import { z } from 'zod';
export const MESSAGE_MAX_LENGTH = 2000;
export const DECLINE_COOLDOWN_DAYS = 30;
export const messageBody = z.string().trim().min(1, 'Введите сообщение').max(MESSAGE_MAX_LENGTH, 'Не более 2000 символов');
export const reportReasons = { spam: 'Спам', abuse: 'Оскорбления', fraud: 'Мошенничество', other: 'Другое' } as const;
export function canSendInConversation(status: string, blocked: boolean, banned: boolean) { return status === 'accepted' && !blocked && !banned; }
export function canRepeatRequest(declinedAt: string, now: number) { return now - Date.parse(declinedAt) >= DECLINE_COOLDOWN_DAYS * 86400000; }
export const inboxSchema = z.array(z.object({ id:z.string(), initiator_id:z.string(), recipient_id:z.string(), status:z.enum(['pending','accepted','declined']), updated_at:z.string(), declined_at:z.string().nullable(), peer_id:z.string(), name:z.string(), family:z.string(), city:z.string(), avatar_path:z.string().nullable(), blocked:z.boolean(), banned:z.boolean(), last_body:z.string().nullable(), unread:z.number() }));
export type Conversation = z.infer<typeof inboxSchema>[number] & { avatarUrl: string | null };
