import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { touchActivity } from '@/lib/messaging.functions';
export function useMessagingLive(userId?:string) {
 const qc=useQueryClient();
 useEffect(()=>{if(!userId)return;const refresh=()=>{void qc.invalidateQueries({queryKey:['messages']});};
 const channel=supabase.channel(`messages-${crypto.randomUUID()}`).on('postgres_changes',{event:'*',schema:'public',table:'messages'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'conversations'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'conversation_reads'},refresh).subscribe();
 const touch=()=>{if(document.visibilityState==='visible')void touchActivity().catch(()=>{});};touch();const timer=setInterval(touch,60000);document.addEventListener('visibilitychange',touch);
 return ()=>{void supabase.removeChannel(channel);clearInterval(timer);document.removeEventListener('visibilitychange',touch);};},[userId,qc]);
}
