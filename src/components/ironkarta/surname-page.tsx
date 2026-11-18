import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Info, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { familyQuery } from '@/lib/catalog-query';
import { groupedCities } from '@/lib/surname-rules';
import { SourceCard } from './source-card';
import { StorySubmission } from './story-submission';
import { WorldMap } from './world-map';
export function SurnamePage({slug}:{slug:string}) {
  const {data}=useSuspenseQuery(familyQuery(slug));const [selected,setSelected]=useState('');
  const {family,cards,details,marks,histories}=data;
  const relatedNames=[...new Set([...(details?.related_family_names??[]),...data.related.filter(f=>details?.related_family_ids.includes(f.id)).map(f=>f.name)])];
  return <main className="page-main surname-page"><Link to="/search" className="breadcrumb"><ArrowLeft size={14}/>Назад к поиску</Link>
    <header className="surname-heading"><div className="eyebrow">Истории фамилий</div><h1>{family.name}</h1><p>История фамилии и места, где живут участники</p><Button variant="secondary" className="surname-chip" onClick={()=>document.getElementById('surname-sources')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}><BookOpen/>Источники и предания</Button></header>
    <section id="surname-sources" className="surname-section"><h2 className="section-title">Что рассказывают источники</h2><div className="title-rule"/>
      {cards.length?<div className="surname-grid">{cards.map((card,index)=><SourceCard key={card.id} card={card} alternative={(card.type==='legend'||card.type==='version')&&index>0}/>)}</div>:histories.length?<div className="surname-grid">{histories.map(h=><article key={h.id} className="surname-source source-document"><h3>{h.title}</h3><p>{h.body}</p>{h.family_history_sources.map(c=>c.history_sources&&<div key={c.id} className="surname-citation"><span>Источник: {c.history_sources.title} {c.history_sources.author_or_organization}{c.pages&&` · Страницы: ${c.pages}`}</span>{c.history_sources.url&&<a href={c.history_sources.url} target="_blank" rel="noopener noreferrer nofollow">Открыть источник</a>}</div>)}</article>)}</div>:<p className="empty-copy">История этой фамилии пока не добавлена</p>}
      {Boolean(cards.length||histories.length)&&<p className="surname-note"><Info size={17}/><span>Это версии из опубликованных материалов; подробности могут различаться</span></p>}
    </section>
    <section className="surname-section surname-roots"><h2 className="section-title">Родовые корни</h2><div className="roots-grid"><div><h3>Родовые сёла</h3>{details?.home_villages.length?details.home_villages.map(v=><p key={v} className="root-village"><MapPin size={16}/>{v}</p>):<p className="empty-copy">Сведения пока не добавлены</p>}{details?.region&&<p className="root-region">Ущелье / общество: {details.region}</p>}</div><div><h3>Родственные фамилии <span className="text-muted-foreground">(æрвадæлтæ)</span></h3><div className="flex flex-wrap gap-2">{relatedNames.map(name=>{const f=data.related.find(f=>f.name===name);return f?<Button key={name} asChild variant="outline" size="sm"><Link to="/surname/$slug" params={{slug:f.name.toLocaleLowerCase('ru')}}>{name}</Link></Button>:<span key={name} className="related-placeholder">{name}</span>;})}{!relatedNames.length&&<p className="empty-copy">Сведения пока не добавлены</p>}</div></div></div></section>
    <section className="surname-section"><h2 className="section-title">{family.name} на карте</h2><div className="surname-map"><WorldMap points={marks.map(p=>({...p,family:family.name,slug:family.name.toLocaleLowerCase('ru')}))} selected={selected} onSelect={p=>setSelected(p.id)}/></div><h3 className="mt-5 font-bold">Участники отметили:</h3><div className="location-list">{groupedCities(marks).map(p=><div className="location-row" key={`${p.country}|${p.city}`}><MapPin/><span>{p.country}{p.city?` · ${p.city}`:''}</span><strong>{p.count}</strong></div>)}{!marks.length&&<p className="empty-copy">Одобренных отметок пока нет</p>}</div></section>
    <div className="surname-actions"><Share2 size={20}/><StorySubmission familyId={family.id} kind="share"/><StorySubmission familyId={family.id} kind="correction"/></div>
  </main>;
}