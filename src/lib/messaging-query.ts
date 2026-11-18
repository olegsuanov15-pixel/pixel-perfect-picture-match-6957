import { queryOptions } from '@tanstack/react-query';
import { getInbox,getThread,getBlocks,getReports } from './messaging.functions';
export const inboxQuery=()=>queryOptions({queryKey:['messages','inbox'],queryFn:()=>getInbox(),refetchInterval:30000});
export const threadQuery=(id:string)=>queryOptions({queryKey:['messages','thread',id],queryFn:()=>getThread({data:{id}})});
export const blocksQuery=()=>queryOptions({queryKey:['messages','blocks'],queryFn:()=>getBlocks()});
export const reportsQuery=()=>queryOptions({queryKey:['messages','reports'],queryFn:()=>getReports()});
