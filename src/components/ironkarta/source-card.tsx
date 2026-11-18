import { ExternalLink } from 'lucide-react';
import { cardTypes, shortSource } from '@/lib/surname-rules';
export function SourceCard({card,alternative=false}:{card:{type:string;title:string;summary:string;source_title:string;source_url:string};alternative?:boolean}) {
  const uncertain=card.type==='version'||card.type==='legend';
  const label=cardTypes[card.type as keyof typeof cardTypes]??card.type;
  return <article className={`surname-source ${uncertain?(alternative?'source-alternative':'source-tradition'):'source-document'}`}>
    <div className="source-type"><span>{label}{uncertain&&alternative?' · альтернативная':''}</span>{uncertain&&<small>(не окончательный факт)</small>}</div>
    <h3>{card.title}</h3><p>{card.summary}</p>
    <div className="surname-citation"><span>Источник:</span>{card.source_url?<a href={card.source_url} target="_blank" rel="noopener noreferrer nofollow" title={card.source_title}><ExternalLink size={14}/><span>{card.source_title}<small>{shortSource(card.source_url)}</small></span></a>:<span>{card.source_title||'Источник пока не указан'}</span>}</div>
  </article>;
}