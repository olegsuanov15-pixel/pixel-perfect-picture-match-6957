import { useState } from 'react';
import { useMutation,useQueryClient,useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { ArrowDown,ArrowUp,Plus,Trash2,Pencil,ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { surnameAdminQuery } from '@/lib/surname-query';
import { editSurname } from '@/lib/surname.functions';
import { cardInput,cardTypes,type SurnameCard } from '@/lib/surname-rules';
import { SourceCard } from './source-card';

type Seed={familyId:string;text:string;source:string};
function blankCard(familyId:string,order=0):SurnameCard {return {family_id:familyId,type:'legend',title:'',summary:'',source_title:'',source_url:'',sort_order:order,status:'draft',origin:'admin'};}
function useEditorMutation() {
  const qc=useQueryClient();const fn=useServerFn(editSurname);
  return useMutation({mutationFn:fn,onSuccess:async()=>{await Promise.all([qc.invalidateQueries({queryKey:['surname-admin']}),qc.invalidateQueries({queryKey:['family']}),qc.invalidateQueries({queryKey:['catalog']})]);toast.success('Изменения сохранены');},onError:e=>toast.error(e.message)});
}
export function SurnameAdmin({seed}:{seed?:Seed}) {
  const {data}=useSuspenseQuery(surnameAdminQuery());const [selected,setSelected]=useState(seed?.familyId??'');const [q,setQ]=useState('');
  const family=data.families.find(f=>f.id===selected);
  if(!family)return <div><label className="field max-w-md"><span>Поиск фамилии</span><input value={q} onChange={e=>setQ(e.target.value)}/></label><div className="surname-admin-list">{data.families.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())).map(f=><Button key={f.id} variant="outline" onClick={()=>setSelected(f.id)}>{f.name}</Button>)}</div></div>;
  const details=data.details.find(d=>d.family_id===family.id);
  return <div><Button variant="ghost" onClick={()=>setSelected('')}><ArrowLeft/>Все фамилии</Button><div className="my-4 flex flex-wrap items-center gap-4"><h2 className="section-title">{family.name}</h2><Button asChild variant="link"><Link to="/surname/$slug" params={{slug:family.name.toLocaleLowerCase('ru')}}>Открыть страницу</Link></Button></div><FamilyEditor key={family.id} familyId={family.id} details={details} families={data.families} cards={data.cards.filter(c=>c.family_id===family.id)} seed={seed?.familyId===family.id?seed:undefined}/></div>;
}
function FamilyEditor({familyId,details,families,cards,seed}:{familyId:string;details?:{home_villages:string[];region:string;related_family_names:string[];related_family_ids:string[]}|undefined;families:{id:string;name:string}[];cards:{id:string;family_id:string;type:string;title:string;summary:string;source_title:string;source_url:string;sort_order:number;status:string;origin:string}[];seed?:Seed|undefined}) {
  const m=useEditorMutation();const [draft,setDraft]=useState<SurnameCard|null>(seed?{...blankCard(familyId,cards.length),summary:seed.text.slice(0,400),source_url:seed.source,origin:'user'}:null);
  const [error,setError]=useState('');
  function move(index:number,direction:number) {
    const ordered=[...cards];const other=ordered[index+direction];const current=ordered[index];if(!other||!current)return;
    ordered[index]=other;ordered[index+direction]=current;
    const parsed=zCards(ordered.map((c,i)=>({...c,sort_order:i})));
    if(parsed)m.mutate({data:{action:'order',cards:parsed}});
  }
  return <div className="surname-editor"><form className="grid gap-4 border-b border-border pb-7" onSubmit={e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);const names=String(f.get('related')).split(',').map(v=>v.trim()).filter(Boolean);
    m.mutate({data:{action:'details',family_id:familyId,home_villages:String(f.get('villages')).split('\n').map(v=>v.trim()).filter(Boolean),region:String(f.get('region')),related_family_names:names,related_family_ids:families.filter(v=>names.includes(v.name)).map(v=>v.id)}});
  }}><h3 className="font-bold">Родовые корни</h3><label className="field"><span>Родовые сёла (каждое с новой строки)</span><textarea name="villages" defaultValue={details?.home_villages.join('\n')??''} rows={3}/></label><label className="field"><span>Ущелье / общество</span><input name="region" maxLength={300} defaultValue={details?.region??''}/></label><label className="field"><span>Родственные фамилии (через запятую)</span><input name="related" defaultValue={details?.related_family_names.join(', ')??''}/></label><Button type="submit" disabled={m.isPending}>Сохранить родовые сведения</Button></form>
    <div className="my-6 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">Карточки источников</h3><Button variant="outline" onClick={()=>{setDraft(blankCard(familyId,cards.length));setError('');}}><Plus/>Добавить карточку</Button></div>
    {draft&&<form className="card-editor grid gap-4" onSubmit={async e=>{e.preventDefault();const parsed=cardInput.safeParse(draft);if(!parsed.success){setError(parsed.error.issues[0]?.message??'Проверьте поля');return;}try{await m.mutateAsync({data:{action:'card',card:parsed.data}});setDraft(null);setError('');}catch{/* Mutation shows the error. */}}}>
      <h3 className="font-bold">{draft.id?'Редактирование карточки':'Новая карточка · черновик'}</h3><div className="roots-grid"><label className="field"><span>Тип</span><select value={draft.type} onChange={e=>setDraft({...draft,type:cardInput.shape.type.parse(e.target.value)})}>{Object.entries(cardTypes).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><label className="field"><span>Статус</span><select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value==='published'?'published':'draft'})}><option value="draft">Черновик</option><option value="published">Опубликовано</option></select></label></div>
      <label className="field"><span>Заголовок</span><input required maxLength={200} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label className="field"><span>Короткий пересказ (до 400 символов)</span><textarea required maxLength={400} rows={5} value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value})}/></label><label className="field"><span>Название источника</span><input maxLength={200} value={draft.source_title} onChange={e=>setDraft({...draft,source_title:e.target.value})}/></label><label className="field"><span>Ссылка на источник</span><input type="url" value={draft.source_url} onChange={e=>setDraft({...draft,source_url:e.target.value})}/></label><label className="field"><span>Происхождение материала</span><select value={draft.origin} onChange={e=>setDraft({...draft,origin:cardInput.shape.origin.parse(e.target.value)})}><option value="admin">Редакция</option><option value="user">Участник</option><option value="ai">ИИ</option></select></label><div className="flex gap-3"><Button type="submit" disabled={m.isPending}>Сохранить карточку</Button><Button variant="outline" onClick={()=>setDraft(null)}>Отмена</Button></div>{error&&<p role="alert" className="text-destructive">{error}</p>}<h4 className="font-bold">Предпросмотр</h4><SourceCard card={draft} alternative={draft.sort_order>0}/>
    </form>}
    <div className="surname-grid">{cards.map((c,index)=><div key={c.id}><SourceCard card={c} alternative={index>0}/><div className="flex flex-wrap items-center gap-2 py-3"><span className="mr-auto text-sm text-muted-foreground">{c.status==='published'?'Опубликовано':'Черновик'}</span><Button variant="ghost" size="icon" title="Выше" aria-label={`Выше: ${c.title}`} disabled={index===0||m.isPending} onClick={()=>move(index,-1)}><ArrowUp/></Button><Button variant="ghost" size="icon" title="Ниже" aria-label={`Ниже: ${c.title}`} disabled={index===cards.length-1||m.isPending} onClick={()=>move(index,1)}><ArrowDown/></Button><Button variant="ghost" size="icon" title="Изменить" aria-label={`Изменить: ${c.title}`} onClick={()=>{const parsed=cardInput.safeParse(c);if(parsed.success)setDraft(parsed.data);}}><Pencil/></Button><Button variant="ghost" size="icon" title="Удалить" aria-label={`Удалить: ${c.title}`} disabled={m.isPending} onClick={()=>{if(window.confirm('Удалить карточку источника?'))m.mutate({data:{action:'delete',id:c.id}});}}><Trash2/></Button></div></div>)}</div>
  </div>;
}
function zCards(cards:unknown[]) {
  const parsed=cardInput.extend({id:cardInput.shape.family_id}).array().safeParse(cards);
  return parsed.success?parsed.data:null;
}
export function StoryQueue() {
  const {data}=useSuspenseQuery(surnameAdminQuery());const m=useEditorMutation();const [seed,setSeed]=useState<Seed|null>(null);const [status,setStatus]=useState('pending');
  if(seed)return <div><Button variant="ghost" onClick={()=>setSeed(null)}><ArrowLeft/>К очереди историй</Button><SurnameAdmin key={`${seed.familyId}-${seed.text}`} seed={seed}/></div>;
  const rows=data.submissions.filter(s=>status==='all'||s.status===status);
  return <div><label className="field max-w-sm"><span>Статус историй</span><select value={status} onChange={e=>setStatus(e.target.value)}><option value="pending">На проверке</option><option value="accepted">Обработаны</option><option value="rejected">Отклонены</option><option value="all">Все</option></select></label>{!rows.length&&<p className="empty-copy">Историй по выбранным условиям пока нет</p>}{rows.map(s=><article key={s.id} className="border-b border-border py-6"><h3 className="font-bold">{data.families.find(f=>f.id===s.family_id)?.name} · {s.kind==='share'?'История':'Уточнение'}</h3><p className="text-sm text-muted-foreground">{s.user_id?'Участник':'Гость'} · {new Date(s.created_at).toLocaleString('ru-RU')} · {s.status==='pending'?'На проверке':s.status==='accepted'?'Обработано':'Отклонено'}</p><p className="whitespace-pre-wrap break-words">{s.text}</p>{s.source_url&&<a href={s.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-link break-all">{s.source_url}</a>}<p className="text-sm text-muted-foreground">Связь через аккаунт: {s.contact_consent&&s.user_id?'разрешена':'не разрешена'}</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={()=>setSeed({familyId:s.family_id,text:s.text,source:s.source_url})}>Создать карточку из этого</Button><Button variant="outline" disabled={m.isPending||s.status!=='pending'} onClick={()=>m.mutate({data:{action:'submission',id:s.id,status:'rejected'}})}>Отклонить</Button><Button variant="secondary" disabled={m.isPending||s.status!=='pending'} onClick={()=>m.mutate({data:{action:'submission',id:s.id,status:'accepted'}})}>Отметить обработанным</Button></div></article>)}</div>;
}