export type FamilyRecord = { id: string; name: string; slug: string; aliases: string[] };
export type MarkRecord = {
  id: string;
  family_id: string;
  country: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  consent_to_publish: boolean;
};
import { familyKey } from './family-normalization';
export const normalizeSurname = familyKey;
export function matchesSurname(family: FamilyRecord, query: string) {
  const normalized = normalizeSurname(query);
  return [family.name, ...family.aliases].some((name) =>
    normalizeSurname(name).includes(normalized),
  );
}
export function publicMarks<T extends MarkRecord>(marks: T[]) {
  return marks.filter((mark) => mark.status === "approved" && mark.consent_to_publish);
}
export function sourcedHistories<
  T extends {
    published: boolean;
    family_history_sources: { history_sources: { published: boolean } | null }[];
  },
>(histories: T[]) {
  return histories.filter(
    (history) =>
      history.published &&
      history.family_history_sources.some((citation) => citation.history_sources?.published),
  );
}
