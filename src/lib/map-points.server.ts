import {supabaseAdmin} from '@/integrations/supabase/client.server';
import {validCoordinates} from './coordinate-resolution';
export async function cityCoordinates(country:string,city:string|null){
 const locationKey=`${country.trim().toLowerCase()}|${(city??'').trim().toLowerCase()}`;
 const cached=await supabaseAdmin.from('city_geocodes').select('latitude,longitude').eq('location_key',locationKey).maybeSingle();if(validCoordinates(cached.data))return cached.data;
 const key=process.env['GOOGLE_MAPS_API_KEY'];const auth=process.env['LOVABLE_API_KEY'];if(!key||!auth)throw new Error('Определение координат ещё не подключено. Заявка остаётся на проверке.');
 const query=new URLSearchParams({components:`country:${country}${city?`|locality:${city}`:''}`,language:'ru'});
 const response=await fetch(`https://connector-gateway.lovable.dev/google_maps/maps/api/geocode/json?${query}`,{headers:{Authorization:`Bearer ${auth}`,'X-Connection-Api-Key':key},signal:AbortSignal.timeout(5000)});
 if(!response.ok){const body=await response.text();console.error(`Geocoding failed [${response.status}]: ${body}`);throw new Error('Сервис координат недоступен');}
 const body=await response.json() as {results?:{types:string[];geometry:{location:{lat:number;lng:number}}}[]};
 const result=body.results?.find(r=>r.types.includes(city?'locality':'country'));if(!result)throw new Error('Не найден центр города или страны. Проверьте название.');
 const coords={latitude:result.geometry.location.lat,longitude:result.geometry.location.lng};
 if(!validCoordinates(coords))throw new Error('Некорректные координаты');
 const saved=await supabaseAdmin.from('city_geocodes').upsert({location_key:locationKey,...coords});if(saved.error)console.error('City coordinate cache write failed',saved.error.code);return coords;
}
