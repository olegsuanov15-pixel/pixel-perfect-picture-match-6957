import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {catalogQuery} from '@/lib/catalog-query';
import {suggestedFamilies} from '@/lib/family-normalization';
import {Button} from '@/components/ui/button';
export function SurnameInput({name,label,initial='',required=false}:{name:string;label:string;initial?:string;required?:boolean}) {
 const [value,setValue]=useState(initial);
 const {data}=useQuery(catalogQuery());
 const suggestions=suggestedFamilies(data?.allFamilies??[],value);
 return <div className="mb-4"><label className="field"><span>{label}</span><input name={name} placeholder="Например, Суановы" value={value} onChange={e=>setValue(e.target.value)} required={required} maxLength={100}/></label>{suggestions.map(f=><div key={f.id} className="flex flex-wrap items-center gap-2 text-sm"><span>Вы имели в виду {f.name}?</span><Button type="button" variant="outline" size="sm" onClick={()=>setValue(f.name)}>Выбрать {f.name}</Button></div>)}</div>;
}