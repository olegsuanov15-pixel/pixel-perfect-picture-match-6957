import { z } from 'zod';
export const markSubmission=z.object({familyId:z.string().uuid().optional(),familyName:z.string().trim().min(1).max(100).optional(),country:z.string().trim().min(1).max(100),city:z.string().trim().max(120),consent:z.literal(true),processingConsent:z.literal(true),website:z.string().max(200).default('')}).refine(v=>Boolean(v.familyId||v.familyName),'Укажите фамилию');
export function pendingMark(input:{familyId?:string|undefined;country:string;city:string},userId:string|null){return {family_id:input.familyId,country:input.country,city:input.city||null,user_id:userId,status:'pending',consent_to_publish:true,latitude:null,longitude:null};}
export function canModerate(roles:string[]){return roles.includes('admin');}
export const reviewInput=z.object({id:z.string().uuid(),decision:z.enum(['approved','rejected']),note:z.string().trim().max(500),coordinates:z.object({latitude:z.number().finite().min(-90).max(90),longitude:z.number().finite().min(-180).max(180)}).optional()});
export const profileInput=z.object({name:z.string().trim().max(80),familyName:z.string().trim().max(100),country:z.string().trim().max(100),city:z.string().trim().max(120),about:z.string().trim().max(300),showOnMap:z.boolean(),avatarPath:z.string().nullable(),processingConsent:z.literal(true)});
export const SUBMISSION_INTERVAL_SECONDS=60;
