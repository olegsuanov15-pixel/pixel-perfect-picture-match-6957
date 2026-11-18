import {describe,it,expect} from 'vitest';
import {messageBody,canSendInConversation,canRepeatRequest} from '@/lib/messaging-rules';
describe('Правила переписки',()=>{
 it('сообщение ограничено 2000 символами',()=>{expect(messageBody.safeParse('я'.repeat(2000)).success).toBe(true);expect(messageBody.safeParse('я'.repeat(2001)).success).toBe(false);});
 it('пустой текст запрещён',()=>{expect(messageBody.safeParse('   ').success).toBe(false);});
 it('отправитель не пишет до принятия запроса',()=>{expect(canSendInConversation('pending',false,false)).toBe(false);expect(canSendInConversation('accepted',false,false)).toBe(true);});
 it('отклонённый диалог запрещает сообщения',()=>{expect(canSendInConversation('declined',false,false)).toBe(false);});
 it('блок запрещает сообщения',()=>{expect(canSendInConversation('accepted',true,false)).toBe(false);});
 it('бан запрещает сообщения',()=>{expect(canSendInConversation('accepted',false,true)).toBe(false);});
 it('повторный запрос через 30 дней',()=>{const date='2026-11-18T10:00:00Z';expect(canRepeatRequest(date,Date.parse(date)+30*86400000-1)).toBe(false);expect(canRepeatRequest(date,Date.parse(date)+30*86400000)).toBe(true);});
});
