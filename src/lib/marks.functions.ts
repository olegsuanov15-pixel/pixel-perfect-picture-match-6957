import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { markSubmission, pendingMark, canModerate, reviewInput } from './marks-rules';
export const submitMark = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:unknown)=>markSubmission.parse(data)).handler(async({data,context})=>{
 const {error}=await context.supabase.from('participant_marks').insert(pendingMark(data,context.userId));
 if(error) throw new Error('Не удалось сохранить отметку. Попробуйте ещё раз.');
 return {saved:true};
});
export const getParticipant = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const [roles,profile,marks]=await Promise.all([
 context.supabase.from('user_roles').select('role').eq('user_id',context.userId),
 context.supabase.from('profiles').select('display_name,avatar_path').eq('id',context.userId).maybeSingle(),
 context.supabase.from('participant_marks').select('id,country,city,status,moderation_note,families(name)').eq('user_id',context.userId).order('created_at',{ascending:false})]);
 if(roles.error||profile.error||marks.error) throw new Error('Не удалось загрузить профиль');
 let avatarUrl:string|null=null;
 if(profile.data?.avatar_path){ const {data}=await context.supabase.storage.from('participant-avatars').createSignedUrl(profile.data.avatar_path,600); avatarUrl=data?.signedUrl??null; }
 return {userId:context.userId,profile:profile.data,avatarUrl,moderator:canModerate(roles.data.map(r=>r.role)),marks:marks.data};
});
export const getModeration = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const roles=await context.supabase.from('user_roles').select('role').eq('user_id',context.userId);
 if(roles.error||!canModerate((roles.data??[]).map(r=>r.role))) return {allowed:false,marks:[]};
 const {data,error}=await context.supabase.from('participant_marks').select('id,country,city,status,created_at,families(name)').eq('status','pending').order('created_at');
 if(error) throw new Error('Не удалось загрузить очередь');
 return {allowed:true,marks:data};
});
export const reviewMark = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:unknown)=>reviewInput.parse(data)).handler(async({data,context})=>{
 const roles=await context.supabase.from('user_roles').select('role').eq('user_id',context.userId);
 if(roles.error||!canModerate((roles.data??[]).map(r=>r.role))) throw new Error('Нет прав модератора');
 const {data:rows,error}=await context.supabase.from('participant_marks').update({status:data.decision,moderation_note:data.note||null,latitude:data.latitude,longitude:data.longitude}).eq('id',data.id).eq('status','pending').select('id');
 if(error||!rows?.length) throw new Error('Заявка уже рассмотрена или решение не сохранено');
 return {saved:true};
});
