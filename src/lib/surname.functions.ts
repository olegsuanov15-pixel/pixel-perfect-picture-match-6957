import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { cardInput, storyInput } from './surname-rules';

export const submitStory = createServerFn({method:'POST'}).inputValidator((v:unknown)=>storyInput.parse(v)).handler(async({data})=>{
  if(data.website) throw new Error('Не удалось отправить историю');
  const {supabaseAdmin:db} = await import('@/integrations/supabase/client.server');
  const bearer = getRequestHeader('authorization');
  let userId: string|null = null;
  if(bearer) {
    const result = await db.auth.getUser(bearer.replace(/^Bearer /,''));
    if(result.error || !result.data.user) throw new Error('Войдите повторно');
    userId = result.data.user.id;
    const banned = await db.from('site_bans').select('user_id').eq('user_id',userId).maybeSingle();
    if(banned.error || banned.data) throw new Error('Отправка историй недоступна');
  }
  const family = await db.from('families').select('id').eq('id',data.familyId).maybeSingle();
  if(!family.data) throw new Error('Фамилия не найдена');
  const ip = getRequestIP({xForwardedFor:true}) ?? 'unknown';
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`stories|${process.env['LOVABLE_CRON_SECRET']??''}|${userId??ip}`));
  const bucket = Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  const slot = await db.rpc('claim_story_slot',{_bucket:bucket});
  if(slot.error || !slot.data) throw new Error('Подождите минуту перед следующей отправкой истории.');
  const result = await db.from('story_submissions').insert({family_id:data.familyId,user_id:userId,kind:data.kind,text:data.text,source_url:data.sourceUrl,contact_consent:data.contactConsent,status:'pending'});
  if(result.error) throw new Error('Не удалось сохранить историю. Попробуйте позже.');
  return {saved:true};
});

export const getSurnameAdmin = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const role = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) throw new Error('Нет прав администратора');
  const [families,cards,details,submissions] = await Promise.all([
    context.supabase.from('families').select('id,name,slug,aliases').order('name'),
    context.supabase.from('surname_cards').select('*').order('sort_order'),
    context.supabase.from('family_details').select('*'),
    context.supabase.from('story_submissions').select('*').order('created_at',{ascending:false}),
  ]);
  if(families.error||cards.error||details.error||submissions.error) throw new Error('Не удалось загрузить истории');
  return {families:families.data,cards:cards.data,details:details.data,submissions:submissions.data};
});
const adminInput = z.discriminatedUnion('action',[
  z.object({action:z.literal('card'),card:cardInput}),
  z.object({action:z.literal('delete'),id:z.string().uuid()}),
  z.object({action:z.literal('details'),family_id:z.string().uuid(),home_villages:z.array(z.string().trim().max(200)).max(30),region:z.string().trim().max(300),progenitor:z.string().trim().max(200),related_family_ids:z.array(z.string().uuid()).max(50),related_family_names:z.array(z.string().trim().min(1).max(100)).max(50)}),
  z.object({action:z.literal('order'),cards:z.array(cardInput.extend({id:z.string().uuid()})).max(100)}),
  z.object({action:z.literal('submission'),id:z.string().uuid(),status:z.enum(['accepted','rejected'])}),
]);
export const editSurname = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>adminInput.parse(v)).handler(async({data,context})=>{
  const role = await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) throw new Error('Нет прав администратора');
  const db = context.supabase;
  let error;
  if(data.action==='card') {
    const {id,...card}=data.card;
    const result = id ? await db.from('surname_cards').update(card).eq('id',id) : await db.from('surname_cards').insert({...card,created_by:context.userId}); error=result.error;
  } else if(data.action==='delete') { error=(await db.from('surname_cards').delete().eq('id',data.id)).error; }
  else if(data.action==='details') { const {action,...details}=data; error=(await db.from('family_details').upsert(details)).error; }
  else if(data.action==='order') { if(data.cards.length) error=(await db.from('surname_cards').upsert(data.cards)).error; }
  else { error=(await db.from('story_submissions').update({status:data.status}).eq('id',data.id)).error; }
  if(error) throw new Error('Не удалось сохранить изменения');
  return {saved:true};
});