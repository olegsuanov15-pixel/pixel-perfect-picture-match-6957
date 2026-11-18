import { describe, expect, it } from 'vitest';
import { initialProfileMode, profileInitials } from '@/lib/profile-view';

describe('Режим профиля', () => {
  it('открывает первый вход без профиля в редактировании', () => {
    expect(initialProfileMode(null)).toBe('edit');
  });
  it('открывает пустой профиль в редактировании', () => {
    expect(initialProfileMode({ display_name: ' ', family_name: '', country: '', city: null })).toBe('edit');
  });
  it('открывает заполненный профиль в просмотре', () => {
    expect(initialProfileMode({ display_name: 'Алан', family_name: 'Суановы', country: 'Россия', city: 'Владикавказ' })).toBe('view');
  });
  it('не требует заполнения всех необязательных полей для просмотра', () => {
    expect(initialProfileMode({ family_name: 'Суановы' })).toBe('view');
  });
  it('использует инициалы имени и фамилии без фото', () => {
    expect(profileInitials(' Алан ', ' Суановы ')).toBe('АС');
  });
});