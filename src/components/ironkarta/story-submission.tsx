import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogTrigger } from '@/components/ui/dialog';
import { submitStory } from '@/lib/surname.functions';
import { storyInput } from '@/lib/surname-rules';
export function StorySubmission({familyId,kind}:{familyId:string;kind:'share'|'correction'}) {
  const [open,setOpen]=useState(false);const [error,setError]=useState('');
  const fn=useServerFn(submitStory);
  const mutation=useMutation({mutationFn:fn,onSuccess:()=>{setOpen(false);toast.success('История отправлена на проверку');}});
  const title=kind==='share'?'Поделиться историей':'Дополнить или уточнить историю';
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant={kind==='share'?'default':'link'} className="story-action">{title}</Button></DialogTrigger><DialogContent className="story-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>Материал для редакции Иронкарты</DialogDescription></DialogHeader><form onSubmit={e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);const parsed=storyInput.safeParse({familyId,kind,text:f.get('text'),sourceUrl:f.get('source'),contactConsent:f.get('contact')==='on',consent:f.get('consent')==='on',website:f.get('website')});
    if(!parsed.success){setError(parsed.error.issues[0]?.message??'Проверьте поля');return;}setError('');mutation.mutate({data:parsed.data});
  }} className="grid gap-4"><label className="field"><span>История или уточнение</span><textarea name="text" required maxLength={3000} rows={6}/><small className="text-muted-foreground">До 3000 символов</small></label><label className="field"><span>Ссылка на источник (необязательно)</span><input name="source" type="url" maxLength={1000}/></label><label className="sr-only" aria-hidden="true">Ваш сайт<input name="website" tabIndex={-1} autoComplete="off"/></label><label className="consent-line"><input name="consent" type="checkbox" required/><span>Согласен на обработку данных и рассмотрение материала согласно <Link to="/privacy" className="underline">политике конфиденциальности</Link></span></label><label className="consent-line"><input name="contact" type="checkbox"/><span>Разрешаю редакции связаться со мной через мой аккаунт</span></label><Button type="submit" disabled={mutation.isPending}>{mutation.isPending?'Отправляем…':'Отправить историю'}</Button>{(error||mutation.error)&&<p role="alert" className="text-destructive">{error||mutation.error?.message}</p>}</form></DialogContent></Dialog>;
}