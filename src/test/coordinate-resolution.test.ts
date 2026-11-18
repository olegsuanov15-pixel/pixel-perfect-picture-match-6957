import { describe, it, expect } from 'vitest';
import { countryCenter, resolveCoordinates } from '@/lib/coordinate-resolution';
import { reviewInput } from '@/lib/marks-rules';
describe('Устойчивое одобрение', () => {
  it('использует центр страны при ошибке геокодинга', async () => {
    const result = await resolveCoordinates('Испания', async () => { throw new Error('Недоступно'); });
    expect(result).toEqual({coordinates:{latitude:40,longitude:-4},source:'country'});
  });
  it('использует найденный центр города', async () => {
    expect((await resolveCoordinates('Испания',async()=>({latitude:41.39,longitude:2.17}))).coordinates).toEqual({latitude:41.39,longitude:2.17});
  });
  it('предлагает ручной ввод при неизвестной стране', async () => {
    expect((await resolveCoordinates('Неизвестная страна',async()=>null)).source).toBe('manual_required');
  });
  it('ручные координаты позволяют одобрить без геокодинга', async () => {
    const result = await resolveCoordinates('Неизвестная страна',async()=>{throw new Error('Не вызывать');},{latitude:40,longitude:-4});
    expect(result).toEqual({coordinates:{latitude:40,longitude:-4},source:'manual'});
  });
  it('понимает русские названия и коды стран',()=>{expect(countryCenter(' РФ ')).toEqual(countryCenter('RU'));});
  it('не принимает координаты за границами мира',()=>{
    expect(reviewInput.safeParse({id:'00000000-0000-4000-8000-000000000001',decision:'approved',note:'',coordinates:{latitude:91,longitude:0}}).success).toBe(false);
  });
});