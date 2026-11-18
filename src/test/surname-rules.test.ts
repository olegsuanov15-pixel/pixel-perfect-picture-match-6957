import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { cardInput,storyInput,groupedCities } from '@/lib/surname-rules';
const familyId='00000000-0000-4000-8000-000000000001';
describe('Surname rules',()=>{
  it('accepts guest stories of 3000 characters but rejects 3001',()=>{
    expect(storyInput.safeParse({familyId,kind:'share',text:'а'.repeat(3000),consent:true}).success).toBe(true);
    expect(storyInput.safeParse({familyId,kind:'share',text:'а'.repeat(3001),consent:true}).success).toBe(false);
  });
  it('requires processing consent but not contact consent',()=>{
    expect(storyInput.safeParse({familyId,kind:'correction',text:'Уточнение',consent:false}).success).toBe(false);
    expect(storyInput.parse({familyId,kind:'correction',text:'Уточнение',consent:true}).contactConsent).toBe(false);
  });
  it('rejects executable source URLs',()=>{
    expect(storyInput.safeParse({familyId,kind:'share',text:'Текст',consent:true,sourceUrl:'javascript:alert(1)'}).success).toBe(false);
  });
  it('limits summaries to 400 characters',()=>{
    const card={family_id:familyId,type:'legend',title:'Предание',summary:'а'.repeat(400),source_title:'Источник',source_url:'https://example.org',sort_order:0,status:'draft',origin:'admin'};
    expect(cardInput.safeParse(card).success).toBe(true);
    expect(cardInput.safeParse({...card,summary:'а'.repeat(401)}).success).toBe(false);
  });
  it('groups approved consenting city marks without exposing guest names',()=>{
    const mark={id:familyId,family_id:familyId,country:'Россия',city:'Владикавказ',latitude:43,longitude:44,status:'approved',consent_to_publish:true};
    expect(groupedCities([mark,{...mark,id:'2'},{...mark,status:'pending'},{...mark,consent_to_publish:false}])).toEqual([{country:'Россия',city:'Владикавказ',count:2}]);
  });
  it('enforces published-only reads, admin editing and a private one-minute gate in PostgreSQL',async()=>{
    const db=new PGlite();try {
      await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT null::uuid $$; CREATE FUNCTION public.has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$; CREATE TABLE public.families(id uuid PRIMARY KEY); CREATE TABLE public.profiles(id uuid PRIMARY KEY);`);
      await db.exec(readFileSync('drizzle/migrations/0010_surname_editor_and_submissions.sql','utf8'));
      await db.exec(`INSERT INTO public.families VALUES('${familyId}'); INSERT INTO public.surname_cards(family_id,type,title,summary,status) VALUES('${familyId}','legend','Published','Text','published'),('${familyId}','legend','Draft','Text','draft');`);
      expect((await db.query(`select public.claim_story_slot('guest') as allowed`)).rows).toEqual([{allowed:true}]);
      expect((await db.query(`select public.claim_story_slot('guest') as allowed`)).rows).toEqual([{allowed:false}]);
      await db.exec(`UPDATE public.story_submission_limits SET last_submission=clock_timestamp()-interval '61 seconds' WHERE bucket='guest';`);
      expect((await db.query(`select public.claim_story_slot('guest') as allowed`)).rows).toEqual([{allowed:true}]);
      await db.exec('SET ROLE anon');
      expect((await db.query('select title from public.surname_cards')).rows).toEqual([{title:'Published'}]);
      await expect(db.query('select * from public.story_submissions')).rejects.toThrow();
      await db.exec('RESET ROLE; SET ROLE authenticated');
      await expect(db.exec(`INSERT INTO public.surname_cards(family_id,type,title,summary) VALUES('${familyId}','legend','Unauthorized','Text')`)).rejects.toThrow();
      await expect(db.query(`select public.claim_story_slot('bypass')`)).rejects.toThrow();
    }finally{await db.close();}
  },15000);
});