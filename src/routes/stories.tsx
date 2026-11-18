import { createFileRoute,Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { catalogQuery } from '@/lib/catalog-query';
import { DataError,DataNotFound } from '@/components/ironkarta/data-boundaries';
import { LandscapeHero } from '@/components/ironkarta/landscape-hero';
import { pageHead } from '@/data/demo';
import panorama from '@/assets/caucasus-panorama.jpg';
export const Route=createFileRoute('/stories')({loader:({context})=>context.queryClient.ensureQueryData(catalogQuery()),head:()=>pageHead('Истории фамилий','Опубликованные предания и документы об осетинских фамилиях.'),component:Stories,errorComponent:DataError,notFoundComponent:DataNotFound});
function Stories(){const {data}=useSuspenseQuery(catalogQuery());const families=data.allFamilies.filter(f=>data.cards.some(c=>c.family_id===f.id));return <main className="page-main app-content"><LandscapeHero title="История фамилий" subtitle="Память о родовых корнях"/><div className="story-grid">{families.map(f=><Link key={f.id} to="/surname/$slug" params={{slug:f.slug}} className="story-cover"><div><img src={panorama} alt="Горы Кавказа и осетинская башня"/><span>История фамилии</span></div><section><h2>{f.name}<ChevronRight/></h2><p>{data.cards.find(c=>c.family_id===f.id)?.summary.split(/(?<=[.!?])\s/)[0]}</p><small>{data.cards.filter(c=>c.family_id===f.id).length} опубликованных материалов</small></section></Link>)}</div>{!families.length&&<p className="app-empty">Пока нет данных — дополните историю</p>}</main>;}