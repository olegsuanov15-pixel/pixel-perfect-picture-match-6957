import {queryOptions} from '@tanstack/react-query';
import {getParticipant,getModeration} from './marks.functions';
export const participantQuery=()=>queryOptions({queryKey:['participant'],queryFn:()=>getParticipant()});
export const moderationQuery=()=>queryOptions({queryKey:['moderation'],queryFn:()=>getModeration()});
