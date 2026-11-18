import {createFileRoute,Link,useNavigate} from '@tanstack/react-router';
import {useSuspenseQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import {useState,type FormEvent} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {participantQuery} from '@/lib/participant-query';
import {pageHead} from '@/data/demo';
export const Route=createFileRoute('/_authenticated/profile')({head:()=>pageHead('Мой профиль','Личный профиль и статус отправленных отметок.'),loader:async({context})=>{await context.queryClient.ensureQueryData(participantQuery());},component:Profile});
const statuses:Record<string,string>={pending:'На проверке',approved:'Одобрена',rejected:'Отклонена'};
function Profile(){
 const {data}=useSuspenseQuery(participantQuery());const qc=useQueryClient();const navigate=useNavigate();const [saved,setSaved]=useState(false);
 const mutation=useMutation({mutationFn:async(form:FormData)=>{
  const file=form.get('avatar');let avatarPath=data.profile?.avatar_path??null;
  if(file instanceof File&&file.size){if(file.size>2*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Фото: JPG, PNG или WebP, до 2 МБ');const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';const path=`${data.userId}/${crypto.randomUUID()}.${ext}`;const upload=await supabase.storage.from('participant-avatars').upload(path,file);if(upload.error)throw new Error('Не удалось загрузить фото');avatarPath=path;}
  const {error}=await supabase.from('profiles').upsert({id:data.userId,display_name:String(form.get('name')??'').trim().slice(0,80),avatar_path:avatarPath});if(error)throw new Error('Не удалось сохранить профиль');
 },onSuccess:()=>{setSaved(true);void qc.invalidateQueries({queryKey:['participant']});}});
 async function signOut(){await qc.cancelQueries();qc.clear();await supabase.auth.signOut();await navigate({to:'/auth',replace:true});}
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setSaved(false);mutation.mutate(new FormData(e.currentTarget));}
 return <main className="page-main"><section className="prose-page"><div className="flex flex-wrap items-center justify-between gap-3"><h1>Мой профиль</h1><Button variant="outline" onClick={signOut}>Выйти</Button></div><form onSubmit={submit} className="max-w-md">{data.avatarUrl&&<img src={data.avatarUrl} alt="Фото профиля" className="size-20 rounded-full object-cover mb-4"/>}<label className="field"><span>Имя</span><input name="name" maxLength={80} defaultValue={data.profile?.display_name??''}/></label><label className="field"><span>Фотография · до 2 МБ</span><input name="avatar" type="file" accept="image/jpeg,image/png,image/webp"/></label><Button disabled={mutation.isPending} type="submit">{mutation.isPending?'Сохраняем…':'Сохранить профиль'}</Button>{saved&&<p role="status">Профиль сохранён</p>}{mutation.error&&<p role="alert" className="text-destructive">{mutation.error.message}</p>}</form><div className="flex flex-wrap gap-3 mt-6"><Button asChild variant="outline"><Link to="/">Добавить отметку</Link></Button><Button asChild variant="outline"><Link to="/moderation">{data.moderator?'Очередь модерации':'Доступ к модерации'}</Link></Button></div><h2>Мои отметки</h2>{!data.marks.length&&<p>Вы пока не отправили отметок.</p>}<div className="divide-y divide-border">{data.marks.map(mark=><article key={mark.id} className="py-4"><strong>{mark.families?.name}</strong><p>{mark.country}{mark.city?` · ${mark.city}`:''}</p><span className="text-primary">{statuses[mark.status]??mark.status}</span>{mark.moderation_note&&<p>Комментарий модератора: {mark.moderation_note}</p>}</article>)}</div></section></main>;
}
