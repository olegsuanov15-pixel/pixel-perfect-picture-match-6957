import { z } from 'zod';
export const markSubmission = z.object({ familyId: z.string().uuid(), country: z.string().trim().min(1).max(100), city: z.string().trim().max(120), consent: z.literal(true) });
export function pendingMark(input: z.infer<typeof markSubmission>, userId: string) {
 return { family_id: input.familyId, country: input.country, city: input.city || null, user_id: userId, status: 'pending', consent_to_publish: true, latitude: null, longitude: null };
}
export function canModerate(roles: string[]) { return roles.some(r => r === 'admin' || r === 'moderator'); }
export const reviewInput = z.object({ id: z.string().uuid(), decision: z.enum(['approved','rejected']), note: z.string().trim().max(500), latitude: z.number().min(-60).max(85).nullable(), longitude: z.number().min(-180).max(180).nullable() }).refine(v => v.decision !== 'approved' || (v.latitude !== null && v.longitude !== null), 'Укажите приблизительные координаты города');
