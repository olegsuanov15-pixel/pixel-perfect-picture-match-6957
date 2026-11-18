CREATE OR REPLACE FUNCTION public.canonical_family_name(v text) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE n text:=lower(regexp_replace(trim(normalize(v,NFKC)),'\s+',' ','g')); p text[]; BEGIN
IF n ~ '[a-z]' THEN
 n:=regexp_replace(regexp_replace(n,'off$','ov'),'eff$','ev');
 FOREACH p SLICE 1 IN ARRAY ARRAY[['shch','щ'],['sch','щ'],['yo','ё'],['zh','ж'],['kh','х'],['ts','ц'],['ch','ч'],['sh','ш'],['yu','ю'],['ya','я']] LOOP n:=replace(n,p[1],p[2]); END LOOP;
 n:=replace(n,'x','кс'); n:=translate(n,'abvgdezijklmnoprstufhcywq','абвгдезийклмнопрстуфхкывк');
END IF;
n:=regexp_replace(n,'(ов|ев|ёв|ин)(а|ы)?$','\1ы'); RETURN upper(left(n,1))||substr(n,2); END $$;
CREATE OR REPLACE FUNCTION public.family_key(v text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT replace(lower(public.canonical_family_name(v)),'ё','е') $$;
ALTER TABLE public.families ADD COLUMN canonical_key text;
ALTER TABLE public.profiles ADD COLUMN family_id uuid REFERENCES public.families(id);
CREATE TABLE public.family_aliases(alias text PRIMARY KEY, family_id uuid NOT NULL REFERENCES public.families(id), alias_key text GENERATED ALWAYS AS (public.family_key(alias)) STORED);
GRANT SELECT ON public.family_aliases TO anon,authenticated;
GRANT ALL ON public.family_aliases TO service_role;
ALTER TABLE public.family_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public surname spellings" ON public.family_aliases FOR SELECT TO anon,authenticated USING(true);
CREATE INDEX family_alias_key_idx ON public.family_aliases(alias_key);
CREATE OR REPLACE FUNCTION public.merge_families(_source uuid,_target uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE src public.families; dst public.families; BEGIN
 IF current_user <> 'postgres' AND auth.role() IS DISTINCT FROM 'service_role' AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Нет прав администратора'; END IF;
 IF _source=_target THEN RAISE EXCEPTION 'Выберите другую основную фамилию'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('family-resolution'));
 SELECT * INTO src FROM public.families WHERE id=_source FOR UPDATE;
 SELECT * INTO dst FROM public.families WHERE id=_target FOR UPDATE;
 IF src.id IS NULL OR dst.id IS NULL THEN RAISE EXCEPTION 'Фамилия не найдена'; END IF;
 UPDATE public.map_points SET family_id=_target WHERE family_id=_source;
 UPDATE public.participant_marks SET family_id=_target WHERE family_id=_source;
 UPDATE public.surname_cards SET family_id=_target WHERE family_id=_source;
 UPDATE public.family_histories SET family_id=_target WHERE family_id=_source;
 UPDATE public.story_submissions SET family_id=_target WHERE family_id=_source;
 UPDATE public.profiles SET family_id=_target,family_name=dst.name WHERE family_id=_source OR public.family_key(family_name)=public.family_key(src.name);
 UPDATE public.family_aliases SET family_id=_target WHERE family_id=_source;
 INSERT INTO public.family_aliases(alias,family_id) SELECT a,_target FROM unnest(array[src.name,src.slug]||src.aliases) a ON CONFLICT(alias) DO UPDATE SET family_id=_target;
 INSERT INTO public.family_details(family_id,home_villages,region,progenitor,related_family_ids,related_family_names)
 SELECT _target,home_villages,region,progenitor,related_family_ids,related_family_names FROM public.family_details WHERE family_id=_source
 ON CONFLICT(family_id) DO UPDATE SET home_villages=ARRAY(SELECT DISTINCT unnest(public.family_details.home_villages||excluded.home_villages)), region=concat_ws(' · ',nullif(public.family_details.region,''),nullif(excluded.region,'')), progenitor=concat_ws(' · ',nullif(public.family_details.progenitor,''),nullif(excluded.progenitor,'')), related_family_ids=ARRAY(SELECT DISTINCT unnest(public.family_details.related_family_ids||excluded.related_family_ids)), related_family_names=ARRAY(SELECT DISTINCT unnest(public.family_details.related_family_names||excluded.related_family_names));
 DELETE FROM public.family_details WHERE family_id=_source;
 UPDATE public.family_details SET related_family_ids=ARRAY(SELECT DISTINCT CASE WHEN x=_source THEN _target ELSE x END FROM unnest(related_family_ids) x),related_family_names=ARRAY(SELECT DISTINCT CASE WHEN public.family_key(x)=public.family_key(src.name) THEN dst.name ELSE x END FROM unnest(related_family_names) x);
 UPDATE public.families SET aliases=ARRAY(SELECT DISTINCT unnest(aliases||src.aliases||array[src.name,src.slug])) WHERE id=_target;
 DELETE FROM public.families WHERE id=_source;
END $$;
REVOKE ALL ON FUNCTION public.merge_families(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.merge_families(uuid,uuid) TO authenticated,service_role;
INSERT INTO public.family_aliases(alias,family_id) SELECT a,f.id FROM public.families f CROSS JOIN LATERAL unnest(array[f.name,f.slug]||f.aliases) a ON CONFLICT(alias) DO NOTHING;
UPDATE public.families SET canonical_key=public.family_key(name);
DO $$ DECLARE r record; target uuid; BEGIN
 FOR r IN SELECT canonical_key FROM public.families GROUP BY canonical_key HAVING count(*)>1 LOOP
 SELECT id INTO target FROM public.families WHERE canonical_key=r.canonical_key ORDER BY (name=public.canonical_family_name(name)) DESC,created_at,id LIMIT 1;
 PERFORM public.merge_families(id,target) FROM public.families WHERE canonical_key=r.canonical_key AND id<>target;
 END LOOP;
END $$;
UPDATE public.families SET name=public.canonical_family_name(name);
CREATE UNIQUE INDEX families_canonical_key_unique ON public.families(canonical_key);
CREATE OR REPLACE FUNCTION public.resolve_family(_name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid; k text:=public.family_key(_name); BEGIN
 IF k='' OR length(_name)>100 THEN RAISE EXCEPTION 'Укажите фамилию'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('family-resolution'));
 SELECT family_id INTO result FROM public.family_aliases WHERE alias_key=k ORDER BY alias LIMIT 1;
 IF result IS NULL THEN SELECT id INTO result FROM public.families WHERE canonical_key=k; END IF;
 IF result IS NULL THEN INSERT INTO public.families(name,slug,aliases,canonical_key) VALUES(public.canonical_family_name(_name),'family-'||gen_random_uuid(),ARRAY[trim(_name)],k) RETURNING id INTO result; END IF;
 INSERT INTO public.family_aliases(alias,family_id) VALUES(trim(_name),result) ON CONFLICT(alias) DO UPDATE SET family_id=result;
 UPDATE public.families SET aliases=ARRAY(SELECT DISTINCT unnest(aliases||ARRAY[trim(_name)])) WHERE id=result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.resolve_family(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_family(text) TO service_role;
UPDATE public.profiles SET family_id=public.resolve_family(family_name) WHERE trim(family_name)<>'';
UPDATE public.profiles p SET family_name=f.name FROM public.families f WHERE p.family_id=f.id;
CREATE OR REPLACE FUNCTION public.normalize_profile_family() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF trim(NEW.family_name)='' THEN NEW.family_id:=NULL; ELSE NEW.family_id:=public.resolve_family(NEW.family_name); SELECT name INTO NEW.family_name FROM public.families WHERE id=NEW.family_id; END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.normalize_profile_family() FROM PUBLIC;
CREATE TRIGGER profile_family_normalization BEFORE INSERT OR UPDATE OF family_name,family_id ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.normalize_profile_family();