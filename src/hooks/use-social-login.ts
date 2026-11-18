import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { useParticipant } from '@/hooks/use-participant';
import { participantQuery } from '@/lib/participant-query';
import { AUTH_RETURN_KEY, OAUTH_PENDING_KEY, destinationAfterLogin, safeReturnPath } from '@/lib/auth-flow';

export function useSocialLogin(returnTo: string) {
  const { user } = useParticipant();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user || !sessionStorage.getItem(OAUTH_PENDING_KEY)) return;
    let active = true;
    setBusy(true);
    void qc.fetchQuery(participantQuery()).then(data => {
      if (!active) return;
      const destination = destinationAfterLogin(data.profile, sessionStorage.getItem(AUTH_RETURN_KEY) ?? returnTo);
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      sessionStorage.removeItem(AUTH_RETURN_KEY);
      void navigate({ to: destination, replace: true });
    }).catch(() => { if (active) setError('Не удалось открыть профиль. Попробуйте ещё раз.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [user?.id, qc, navigate, returnTo]);
  async function signIn(provider: 'google' | 'lovable' = 'google') {
    setBusy(true); setError('');
    sessionStorage.setItem(AUTH_RETURN_KEY, safeReturnPath(returnTo));
    sessionStorage.setItem(OAUTH_PENDING_KEY, provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) throw result.error;
      if (result.redirected) return;
      // Session is installed by the broker before user identity triggers completion.
      const session = await supabase.auth.getUser();
      if (!session.data.user) throw new Error('Нет активной сессии');
    } catch {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      setError('Не удалось войти. Попробуйте ещё раз.');
    } finally { setBusy(false); }
  }
  return { busy, error, signIn };
}