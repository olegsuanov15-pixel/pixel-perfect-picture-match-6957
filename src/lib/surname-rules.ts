import { z } from 'zod';
import type { MarkRecord } from './catalog-rules';
export const cardTypes = { version: 'Версия', legend: 'Предание', document: 'Документ', village: 'Сведения о селе' } as const;
export const sourceUrl = z.string().trim().max(1000).refine(v => { if (!v) return true; try { return ['http:', 'https:'].includes(new URL(v).protocol); } catch { return false; } }, 'Укажите ссылку http или https');
export const storyInput = z.object({ familyId: z.string().uuid(), kind: z.enum(['share','correction']), text: z.string().trim().min(1,'Добавьте текст истории').max(3000,'Не больше 3000 символов'), sourceUrl: sourceUrl.default(''), contactConsent: z.boolean().default(false), consent: z.literal(true,{message:'Нужно согласие на обработку данных'}), website: z.string().max(200).default('') });
export const cardInput = z.object({ id: z.string().uuid().optional(), family_id: z.string().uuid(), type: z.enum(['version','legend','document','village']), title: z.string().trim().min(1).max(200), summary: z.string().trim().min(1).max(400), source_title: z.string().trim().max(200), source_url: sourceUrl, sort_order: z.number().int().min(0), status: z.enum(['draft','published']), origin: z.enum(['admin','user','ai']) });
export type SurnameCard = z.infer<typeof cardInput>;
export function groupedCities(marks: MarkRecord[]) {
  const groups = new Map<string,{country:string;city:string|null;count:number}>();
  for (const mark of marks) {
    if (mark.status !== 'approved' || !mark.consent_to_publish) continue;
    const key = JSON.stringify([mark.country,mark.city]);
    const group = groups.get(key);
    if (group) group.count++; else groups.set(key,{country:mark.country,city:mark.city,count:1});
  }
  return [...groups.values()].sort((a,b) => b.count-a.count || a.country.localeCompare(b.country,'ru'));
}
export function shortSource(url: string) {
  try { const u = new URL(url); return decodeURI(`${u.hostname.replace(/^www\./,'')}${u.pathname}`).replace(/\/$/,''); } catch { return ''; }
}