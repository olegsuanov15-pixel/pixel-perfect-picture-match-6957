type ProfileDetails = {
  display_name?: string | null;
  family_name?: string | null;
  country?: string | null;
  city?: string | null;
};

export function initialProfileMode(profile: ProfileDetails | null): 'view' | 'edit' {
  return profile && [profile.display_name, profile.family_name, profile.country, profile.city].some(value => Boolean(value?.trim()))
    ? 'view'
    : 'edit';
}

export function profileInitials(name: string | null | undefined, family: string | null | undefined) {
  return [name, family].map(value => value?.trim().charAt(0) ?? '').join('').toLocaleUpperCase('ru') || 'И';
}