import {createServerFn} from '@tanstack/react-start';
import {getRequestHeader,getRequestIP} from '@tanstack/react-start/server';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {markSubmission,profileInput,reviewInput} from './marks-rules';
import {z} from 'zod';
export const submitMark=createServerFn({method:'POST'}).inputValidator((v:unknown)=>markSubmission.parse(v)).handler(async({data})=>{
 if(data.website)throw new Error('Не удалось отправить заявку');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const token=getRequestHeader('authorization')?.replace(/^Bearer /,'');let userId:string|null=null;
 if(token){const {data:user,error}=await db.auth.getUser(token);if(error||!user.user)throw new Error('Войдите повторно');userId=user.user.id;}
 const ip=getRequestIP({xForwardedFor:true})??'unknown';const raw=new TextEncoder().encode(`${process.env['LOVABLE_CRON_SECRET']}|${ip}|${userId??'guest'}`);const hash=await crypto.subtle.digest('SHA-256',raw);const bucket=Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');
 const slot=await db.rpc('claim_point_slot',{_bucket:bucket});if(slot.error||!slot.data)throw new Error('Подождите минуту перед следующей отправкой.');
 let familyId=data.familyId;
 if(!familyId){const name=data.familyName??'';const existing=await db.from('families').select('id').ilike('name',name).maybeSingle();if(existing.data)familyId=existing.data.id;else{const row=await db.from('families').insert({name,slug:`family-${crypto.randomUUID()}`,aliases:[]}).select('id').single();familyId=row.data?.id;}}
 if(!familyId)throw new Error('Не удалось сохранить фамилию');
 const {data:point,error}=await db.from('map_points').insert({family_id:familyId,user_id:userId,country:data.country,city:data.city||null,status:'pending',consent_to_publish:true}).select('id,guest_delete_token').single();if(error||!point)throw new Error('Не удалось сохранить отметку');
 return {saved:true,id:point.id,deleteToken:userId?null:point.guest_delete_token};
});
export const getParticipant=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const [roles,profile,marks,consent]=await Promise.all([context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'}),context.supabase.from('profiles').select('display_name,avatar_path,family_name,country,city,about,show_on_map,processing_consent_at').eq('id',context.userId).maybeSingle(),context.supabase.from('map_points').select('id,country,city,status,moderation_note,families(name)').eq('user_id',context.userId).order('created_at',{ascending:false}),context.supabase.from('registration_consents').select('accepted_at').eq('user_id',context.userId).maybeSingle()]);
 if(roles.error||profile.error||marks.error)throw new Error('Не удалось загрузить профиль');let avatarUrl:string|null=null;
 if(profile.data?.avatar_path){const {data}=await context.supabase.storage.from('participant-avatars').createSignedUrl(profile.data.avatar_path,600);avatarUrl=data?.signedUrl??null;}
 return {userId:context.userId,profile:profile.data,avatarUrl,moderator:roles.data===true,marks:marks.data,consented:Boolean(consent.data)};
});
export const saveProfile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>profileInput.parse(v)).handler(async({data,context})=>{
 if(data.avatarPath&&!data.avatarPath.startsWith(`${context.userId}/`))throw new Error('Недопустимое фото');
 const {error}=await context.supabase.from('profiles').upsert({id:context.userId,display_name:data.name,family_name:data.familyName,country:data.country,city:data.city,about:data.about,show_on_map:data.showOnMap,avatar_path:data.avatarPath,processing_consent_at:new Date().toISOString()});if(error)throw new Error('Не удалось сохранить профиль');
 await context.supabase.from('registration_consents').upsert({user_id:context.userId});return {saved:true};
});
export const getModeration=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!role.data)return {allowed:false,marks:[]};
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data,error}=await db.from('map_points').select('id,country,city,status,created_at,moderation_note,families(name)').order('created_at',{ascending:false});if(error)throw new Error('Не удалось загрузить очередь');return {allowed:true,marks:data};
});
export const reviewMark=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>reviewInput.parse(v)).handler(async({data,context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!role.data)throw new Error('Нет прав администратора');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const row=await db.from('map_points').select('country,city,status,consent_to_publish').eq('id',data.id).single();if(!row.data||row.data.status!=='pending')throw new Error('Заявка уже рассмотрена');
 let coords={latitude:null as number|null,longitude:null as number|null};if(data.decision==='approved'){if(!row.data.consent_to_publish)throw new Error('Нет согласия на показ');const {cityCoordinates}=await import('./map-points.server');coords=await cityCoordinates(row.data.country,row.data.city);}
 const {data:rows,error}=await db.from('map_points').update({status:data.decision,...coords,moderation_note:data.note||null,reviewed_at:new Date().toISOString(),reviewed_by:context.userId}).eq('id',data.id).eq('status','pending').select('id');if(error||!rows?.length)throw new Error('Решение не сохранено');return {saved:true};
});
export const deleteAccount=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const files=await db.storage.from('participant-avatars').list(context.userId);if(files.data?.length){const removed=await db.storage.from('participant-avatars').remove(files.data.map(f=>`${context.userId}/${f.name}`));if(removed.error)throw new Error('Не удалось удалить фото');}
 for(const table of ['map_points','participant_marks','registration_consents'] as const){const result=await db.from(table).delete().eq('user_id',context.userId);if(result.error)throw new Error('Не удалось удалить данные');}
 const deleted=await db.auth.admin.deleteUser(context.userId);if(deleted.error)throw new Error('Не удалось удалить аккаунт');return {deleted:true};
});
export const deleteGuestPoint=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({id:z.string().uuid(),token:z.string().uuid()}).parse(v)).handler(async({data})=>{const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {error}=await db.from('map_points').delete().eq('id',data.id).eq('guest_delete_token',data.token).is('user_id',null);if(error)throw new Error('Не удалось удалить отметку');return {deleted:true};});
