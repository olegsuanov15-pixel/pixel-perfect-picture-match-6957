// Keep comparison rules identical to public.family_key in the database.
export function canonicalSurname(value: string): string {
  let name = value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  if (/[a-z]/.test(name)) {
    name = name.replace(/off$/, 'ov').replace(/eff$/, 'ev');
    const pairs: Record<string, string> = {shch:'щ',sch:'щ',yo:'ё',zh:'ж',kh:'х',ts:'ц',ch:'ч',sh:'ш',yu:'ю',ya:'я'};
    name = name.replace(/shch|sch|yo|zh|kh|ts|ch|sh|yu|ya/g, s => pairs[s] ?? s);
    const letters: Record<string, string> = {a:'а',b:'б',v:'в',g:'г',d:'д',e:'е',z:'з',i:'и',j:'й',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',r:'р',s:'с',t:'т',u:'у',f:'ф',h:'х',c:'к',y:'ы',w:'в',q:'к',x:'кс'};
    name = name.replace(/[a-z]/g, s => letters[s] ?? s);
  }
  name = name.replace(/(ов|ев|ёв|ин)(а|ы)?$/, '$1ы');
  return name ? name[0]?.toLocaleUpperCase('ru') + name.slice(1) : '';
}
export function familyKey(value: string) { return canonicalSurname(value).toLowerCase().replace(/ё/g, 'е'); }
export function levenshtein(a: string, b: string): number {
  let previous = Array.from({length:b.length+1}, (_,i) => i);
  for (let i=0;i<a.length;i++) {
    const row=[i+1];
    for (let j=0;j<b.length;j++) row.push(Math.min((row[j]??0)+1,(previous[j+1]??0)+1,(previous[j]??0)+(a[i]===b[j]?0:1)));
    previous=row;
  }
  return previous[b.length]??0;
}
export function suggestedFamilies<T extends {name:string;aliases:string[]}>(families:T[], value:string):T[] {
  const key=familyKey(value);
  if (!key || families.some(f=>[f.name,...f.aliases].some(a=>familyKey(a)===key))) return [];
  return families.filter(f=>levenshtein(familyKey(f.name),key)<=1);
}
export function plural(n:number,one:string,few:string,many:string) {
  const a=Math.abs(n)%100,b=a%10;
  return a>10&&a<20?many:b===1?one:b>1&&b<5?few:many;
}
export function participantLabel(n:number) { return `${n} ${plural(n,'участник','участника','участников')}`; }