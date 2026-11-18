import { describe, expect, it } from 'vitest';
import { destinationAfterLogin, googleDisplayName, safeReturnPath } from '@/lib/auth-flow';
describe('Возврат после Google-входа', () => {
  it('пустой профиль открывается для редактирования', () => { expect(destinationAfterLogin(null, '/stories')).toBe('/profile'); });
  it('заполненный профиль возвращается на исходную страницу', () => { expect(destinationAfterLogin({display_name:'Олег'}, '/stories')).toBe('/stories'); });
  it('возврат не допускает внешнюю страницу', () => { expect(safeReturnPath('//example.org')).toBe('/'); expect(safeReturnPath('/\\example.org')).toBe('/'); });
  it('не возвращает на страницу входа', () => { expect(safeReturnPath('/auth?returnTo=/stories')).toBe('/'); });
  it('подставляет имя Google-аккаунта', () => { expect(googleDisplayName({full_name:' Олег Суанов '})).toBe('Олег Суанов'); });
});