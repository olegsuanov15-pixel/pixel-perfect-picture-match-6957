import centers from '@/data/country-centers.json';
export type Coordinates = { latitude: number; longitude: number };
export function validCoordinates(coords: Coordinates | null | undefined): coords is Coordinates {
  return Boolean(coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude) && Math.abs(coords.latitude) <= 90 && Math.abs(coords.longitude) <= 180);
}
export function countryCenter(country: string): Coordinates | null {
  const normalized = country.trim().toLocaleLowerCase('ru');
  const aliases: Record<string, string> = { 'рф': 'RU', 'российская федерация': 'RU', 'сша': 'US', 'англия': 'GB', 'южная корея': 'KR' };
  const alias = aliases[normalized];
  const center = centers.find(c => alias ? c.code === alias : c.names.some(name => name && name.toLocaleLowerCase('ru') === normalized));
  return center ? { latitude: center.latitude, longitude: center.longitude } : null;
}
export async function resolveCoordinates(country: string, lookup: () => Promise<Coordinates | null>, manual?: Coordinates) {
  if (validCoordinates(manual)) return { coordinates: manual, source: 'manual' as const };
  try {
    const city = await lookup();
    if (validCoordinates(city)) return { coordinates: city, source: 'city' as const };
  } catch { /* Geocoding must not prevent country fallback. */ }
  const center = countryCenter(country);
  return { coordinates: center, source: center ? 'country' as const : 'manual_required' as const };
}