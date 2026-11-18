import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GoogleButton, AuthDivider } from '@/components/ironkarta/google-button';
import { useSocialLogin } from '@/hooks/use-social-login';
import { safeReturnPath } from '@/lib/auth-flow';
import { pageHead } from '@/data/demo';
export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string | undefined } => ({ returnTo: safeReturnPath(search['returnTo']) }),
  head: () => pageHead('Регистрация', 'Создание аккаунта Иронкарты через Google или email.'), component: Register,
});
function Register() {
  const { returnTo } = Route.useSearch();
  const social = useSocialLogin(returnTo ?? '/');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      const { data, error } = await supabase.auth.signUp({ email: String(f.get('email')), password: String(f.get('password')), options: { emailRedirectTo: window.location.origin, data: { processing_consent: true } } });
      setMessage(error ? 'Регистрация не удалась. Проверьте email и пароль и попробуйте позже.' : data.session ? 'Аккаунт создан.' : 'Проверьте почту и подтвердите регистрацию.');
    } catch { setMessage('Регистрация не удалась. Попробуйте ещё раз.'); }
    finally { setBusy(false); }
  }
  return <main className="page-main"><section className="prose-page max-w-md"><h1>Регистрация</h1>
    <GoogleButton busy={busy || social.busy} onClick={() => void social.signIn()} />
    <AuthDivider />
    <form onSubmit={submit}><label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label><label className="field"><span>Пароль · не менее 8 символов</span><input name="password" type="password" minLength={8} required autoComplete="new-password" /></label><label className="consent"><input type="checkbox" required /><span>Согласен на обработку данных по <Link to="/privacy" className="underline">политике конфиденциальности</Link></span></label><Button disabled={busy || social.busy} type="submit">{busy ? 'Создаём аккаунт…' : 'Зарегистрироваться'}</Button></form>
    {message && <p role="status">{message}</p>}{social.error && <p role="alert">{social.error}</p>}
    <Link to="/auth" search={{ returnTo }} className="text-link">Уже есть аккаунт? Войти</Link>
  </section></main>;
}
