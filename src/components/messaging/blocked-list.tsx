import { useSuspenseQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { blocksQuery } from '@/lib/messaging-query';
import { setBlock } from '@/lib/messaging.functions';
export function BlockedList(){const {data}=useSuspenseQuery(blocksQuery());const qc=useQueryClient();const fn=useServerFn(setBlock);const m=useMutation({mutationFn:fn,onSuccess:()=>{void qc.invalidateQueries({queryKey:['messages']});}});return <section className="mt-8 border-t border-border pt-5"><h2>Заблокированные</h2>{!data.length&&<p>Нет заблокированных участников.</p>}{data.map(p=><div key={p.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span>{[p.display_name,p.family_name].filter(Boolean).join(' ')||'Участник Иронкарты'}</span><Button variant="outline" disabled={m.isPending} onClick={()=>m.mutate({data:{target:p.user_id,blocked:false}})}>Разблокировать</Button></div>)}{m.error&&<p role="alert" className="text-destructive">{m.error.message}</p>}</section>;}
