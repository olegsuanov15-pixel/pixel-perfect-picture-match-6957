import { useState } from 'react';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger } from '@/components/ui/dialog';
import { reportConversation } from '@/lib/messaging.functions';
import { reportReasons } from '@/lib/messaging-rules';
export function ReportDialog({id,message=null,iconOnly=false}:{id:string;message?:string|null;iconOnly?:boolean}){
 const [open,setOpen]=useState(false);const qc=useQueryClient();const fn=useServerFn(reportConversation);const mutation=useMutation({mutationFn:fn,onSuccess:()=>{setOpen(false);toast.success('Жалоба отправлена');void qc.invalidateQueries({queryKey:['messages']});}});
 return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size={iconOnly?'icon':'default'} aria-label="Пожаловаться" title="Пожаловаться"><Flag className="size-4"/>{!iconOnly&&'Пожаловаться'}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Пожаловаться</DialogTitle></DialogHeader><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const reason=String(f.get('reason'));if(reason==='spam'||reason==='abuse'||reason==='fraud'||reason==='other')mutation.mutate({data:{id,message,reason,details:String(f.get('details')??'')}});}}><label className="field"><span>Причина</span><select name="reason">{Object.entries(reportReasons).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label><label className="field"><span>Комментарий</span><textarea name="details" maxLength={500} className="w-full rounded-md border border-input bg-background p-3"/></label><Button type="submit" disabled={mutation.isPending}>Отправить жалобу</Button>{mutation.error&&<p role="alert" className="text-destructive">{mutation.error.message}</p>}</form></DialogContent></Dialog>;
}
