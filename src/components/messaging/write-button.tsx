import { useState } from 'react';
import { useQuery,useQueryClient,useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger } from '@/components/ui/dialog';
import { useParticipant } from '@/hooks/use-participant';
import { inboxQuery } from '@/lib/messaging-query';
import {canRepeatRequest} from '@/lib/messaging-rules';
import { getMessageContacts,startConversation } from '@/lib/messaging.functions';
export function WriteButton({pointId}:{pointId:string}){
 const {user}=useParticipant();const navigate=useNavigate();const qc=useQueryClient();const [open,setOpen]=useState(false);const [body,setBody]=useState('');
 const {data}=useQuery({queryKey:['messages','contact',pointId,user?.id],queryFn:()=>getMessageContacts({data:{points:[pointId]}}),enabled:Boolean(user)});const contact=data?.[0];const {data:inbox}=useQuery({...inboxQuery(),enabled:Boolean(user)});const existing=inbox?.find(c=>c.peer_id===contact?.user_id);const fn=useServerFn(startConversation);
 const m=useMutation({mutationFn:fn,onSuccess:async id=>{setOpen(false);await qc.invalidateQueries({queryKey:['messages']});await navigate({to:'/messages',search:{conversation:id}});}});
 if(!contact||(existing?.status==='declined'&&existing.declined_at&&!canRepeatRequest(existing.declined_at,Date.now())))return null;
 if(existing&&existing.status!=='declined')return <Button variant="outline" size="sm" onClick={()=>void navigate({to:'/messages',search:{conversation:existing.id}})}><MessageCircle className="size-4"/>Написать</Button>;
 return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" size="sm"><MessageCircle className="size-4"/>Написать</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{[contact.display_name,contact.family_name].filter(Boolean).join(' ')||'Участник Иронкарты'}</DialogTitle></DialogHeader><form onSubmit={e=>{e.preventDefault();if(body.trim())m.mutate({data:{target:contact.user_id,body}});}}><label className="field"><span>Первое сообщение</span><textarea aria-label="Первое сообщение" value={body} onChange={e=>setBody(e.target.value)} maxLength={2000} required className="min-h-32 w-full rounded-md border border-input bg-background p-3"/></label><div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{body.length} / 2000</span><Button type="submit" disabled={m.isPending||!body.trim()}>Отправить запрос</Button></div>{m.error&&<p role="alert" className="mt-3 text-destructive">{m.error.message}</p>}</form></DialogContent></Dialog>;
}
