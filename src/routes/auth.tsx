import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GoogleButton, AuthDivider } from '@/components/ironkarta/google-button';
import { useSocialLogin } from '@/hooks/use-social-login';
import { useParticipant } from '@/hooks/use-participant';
import { safeReturnPath } from '@/lib/auth-flow';
import { pageHead } from '@/data/demo';
export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string | undefined } => ({ returnTo: safeReturnPath(search['returnTo']) }),
  head: () => pageHead('Вход', 'Вход в Иронкарту через Google или email.'), component: Auth,
});
function Auth() {
  const { user } = useParticipant();
  const { returnTo } = Route.useSearch();
  const social = useSocialLogin(returnTo ?? '/');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function emailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const f = new FormData(e.currentTarget);
      const result = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
      if (result.error) setError('Неверный email или пароль');
    } catch { setError('Не удалось войти. Попробуйте ещё раз.'); }
    finally { setBusy(false); }
  }
  return <main className="page-main"><section className="prose-page max-w-md"><h1>Вход в Иронкарту</h1>
    {user ? <><p>{social.busy ? 'Открываем профиль…' : 'Вы вошли в аккаунт.'}</p><Button asChild><Link to="/profile">Мой профиль</Link></Button><Button asChild variant="outline" className="ml-2"><Link to="/">К карте</Link></Button></> : <>
      <GoogleButton busy={busy || social.busy} onClick={() => void social.signIn()} />
      <AuthDivider />
      <form onSubmit={emailLogin}><label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label><label className="field"><span>Пароль</span><input name="password" type="password" autoComplete="current-password" required /></label><Button type="submit" className="w-full" disabled={busy || social.busy}>Войти</Button></form>
      <div className="my-4 flex flex-wrap justify-between gap-3"><Link to="/register" search={{ returnTo }}>Регистрация</Link><Link to="/forgot-password">Забыли пароль?</Link></div>
    </>}
    {(error || social.error) && <p role="alert">{error || social.error}</p>}
  </section></main>;
}
