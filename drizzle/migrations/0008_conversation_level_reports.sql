CREATE FUNCTION public.report_dialog(_conversation uuid,_reason text,_details text) RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ SELECT public.report_conversation(_conversation,NULL,_reason,_details); $$;
REVOKE ALL ON FUNCTION public.report_dialog(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.report_dialog(uuid,text,text) TO authenticated;