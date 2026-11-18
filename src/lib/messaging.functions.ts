import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { messageBody, inboxSchema } from './messaging-rules';
const id = z.string().uuid();
export const getInbox = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
 const result = await context.supabase.rpc('messaging_inbox'); if(result.error) throw new Error('Не удалось загрузить диалоги');
 const rows = inboxSchema.parse(result.data);
 return Promise.all(rows.map(async row => { let avatarUrl: string|null = null; if(row.avatar_path) { const {supabaseAdmin:db} = await import('@/integrations/supabase/client.server'); const r = await db.storage.from('participant-avatars').createSignedUrl(row.avatar_path,600); avatarUrl = r.data?.signedUrl ?? null; } return {...row,avatarUrl}; }));
});
export const getThread = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id}).parse(v)).handler(async({data,context})=>{
 const [messages,reads] = await Promise.all([context.supabase.from('messages').select('id,sender_id,body,created_at').eq('conversation_id',data.id).order('created_at'),context.supabase.from('conversation_reads').select('user_id,read_at').eq('conversation_id',data.id)]);
 if(messages.error||reads.error) throw new Error('Не удалось загрузить переписку'); return {messages:messages.data,reads:reads.data};
});
export const startConversation = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({target:id,body:messageBody}).parse(v)).handler(async({data,context})=>{
 const r=await context.supabase.rpc('start_conversation',{_target:data.target,_body:data.body}); if(r.error) throw new Error(r.error.message); return r.data;
});
export const sendMessage = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id,body:messageBody}).parse(v)).handler(async({data,context})=>{
 const r=await context.supabase.rpc('send_chat_message',{_conversation:data.id,_body:data.body}); if(r.error) throw new Error(r.error.message); return r.data;
});
export const decideConversation = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id,decision:z.enum(['accepted','declined'])}).parse(v)).handler(async({data,context})=>{
 const r=await context.supabase.rpc('decide_conversation',{_conversation:data.id,_decision:data.decision}); if(r.error) throw new Error(r.error.message); return {saved:true};
});
export const readConversation = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id}).parse(v)).handler(async({data,context})=>{ const r=await context.supabase.rpc('mark_conversation_read',{_conversation:data.id});if(r.error)throw new Error(r.error.message);return {saved:true}; });
export const setBlock = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({target:id,blocked:z.boolean()}).parse(v)).handler(async({data,context})=>{ const r=await context.supabase.rpc('set_participant_block',{_target:data.target,_blocked:data.blocked});if(r.error)throw new Error(r.error.message);return {saved:true}; });
export const getBlocks = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{const r=await context.supabase.rpc('blocked_participants');if(r.error)throw new Error('Не удалось загрузить список');return r.data;});
export const reportConversation = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id,message:id.nullable(),reason:z.enum(['spam','abuse','fraud','other']),details:z.string().trim().max(500)}).parse(v)).handler(async({data,context})=>{const r=data.message?await context.supabase.rpc('report_conversation',{_conversation:data.id,_message:data.message,_reason:data.reason,_details:data.details}):await context.supabase.rpc('report_dialog',{_conversation:data.id,_reason:data.reason,_details:data.details});if(r.error)throw new Error(r.error.message);return {saved:true};});
export const getReports = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!role.data)throw new Error('Нет прав администратора');
 const reports=await context.supabase.from('conversation_reports').select('id,conversation_id,reporter_id,reason,details,status,created_at,message_id').order('created_at',{ascending:false});if(reports.error)throw new Error('Не удалось загрузить жалобы');
 return Promise.all(reports.data.map(async report=>{const messages=await context.supabase.from('messages').select('id,sender_id,body,created_at').eq('conversation_id',report.conversation_id).order('created_at');if(messages.error)throw new Error('Не удалось загрузить переписку');return {...report,messages:messages.data};}));
});
export const reviewReport = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id,ban:z.boolean()}).parse(v)).handler(async({data,context})=>{const r=await context.supabase.rpc('review_conversation_report',{_report:data.id,_ban:data.ban});if(r.error)throw new Error(r.error.message);return {saved:true};});
export const getMessageContacts = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({points:z.array(id).max(100)}).parse(v)).handler(async({data,context})=>{const r=await context.supabase.rpc('message_contacts',{_points:data.points});if(r.error)throw new Error('Не удалось загрузить участников');return r.data;});
export const touchActivity = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{await context.supabase.rpc('touch_participant_activity');return {saved:true};});
