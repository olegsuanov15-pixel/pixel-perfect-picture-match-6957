import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { MapPin, Pencil, Eye, EyeOff, CheckCircle2, Clock3, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { participantQuery } from '@/lib/participant-query';
import { saveProfile, deleteAccount } from '@/lib/marks.functions';
import { initialProfileMode, profileInitials } from '@/lib/profile-view';
import { pageHead } from '@/data/demo';
import { useParticipant } from '@/hooks/use-participant';
import { Suspense } from 'react';
import { BlockedList } from '@/components/messaging/blocked-list';
import { LandscapeHero } from '@/components/ironkarta/landscape-hero';
import { googleDisplayName } from '@/lib/auth-flow';

export const Route = createFileRoute('/_authenticated/profile')({
  head: () => pageHead('Профиль', 'Личные данные участника и управление показом на карте.'),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(participantQuery()); },
  component: Profile,
});
const statuses = {
  pending: { label: 'На проверке', icon: Clock3, color: 'text-muted-foreground bg-muted' },
  approved: { label: 'Одобрена', icon: CheckCircle2, color: 'text-primary bg-secondary' },
  rejected: { label: 'Отклонена', icon: XCircle, color: 'text-destructive bg-destructive/10' },
};
function Profile() {
  const { user } = useParticipant();
  const { data } = useSuspenseQuery(participantQuery());
  const qc = useQueryClient();
  const navigate = useNavigate();
  const save = useServerFn(saveProfile);
  const remove = useServerFn(deleteAccount);
  const [mode, setMode] = useState(() => initialProfileMode(data.profile));
  const [show, setShow] = useState(data.profile?.show_on_map ?? true);
  const [allowMessages,setAllowMessages]=useState(data.profile?.allow_messages??true);
  const [emailNotifications,setEmailNotifications]=useState(data.profile?.email_notifications??true);
  const [confirm, setConfirm] = useState(false);
  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const file = form.get('avatar');
      let avatarPath = data.profile?.avatar_path ?? null;
      if (file instanceof File && file.size) {
        if (file.size > 2 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Фото: JPG, PNG или WebP, до 2 МБ');
        const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
        const path = `${data.userId}/${crypto.randomUUID()}.${ext}`;
        const upload = await supabase.storage.from('participant-avatars').upload(path, file);
        if (upload.error) throw new Error('Не удалось загрузить фото');
        avatarPath = path;
      }
      await save({ data: {
        name: String(form.get('name') ?? ''), familyName: String(form.get('family') ?? ''),
        country: String(form.get('country') ?? ''), city: String(form.get('city') ?? ''),
        about: String(form.get('about') ?? ''), showOnMap: show, allowMessages,emailNotifications, avatarPath, processingConsent: true,
      } });
      // Stay in editing until the saved data has been read back successfully.
      await qc.invalidateQueries({ queryKey: participantQuery().queryKey }, { throwOnError: true });
    },
    onSuccess: () => {
      setMode('view');
      setConfirm(false);
      toast.success('Профиль сохранён');
      void qc.invalidateQueries({ predicate: query => query.queryKey[0] !== 'participant' });
    },
  });
  const deletion = useMutation({ mutationFn: remove, onSuccess: async () => {
    await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut({ scope: 'local' });
    await navigate({ to: '/auth', replace: true });
  } });
  function edit() {
    mutation.reset(); deletion.reset(); setConfirm(false);
    setShow(data.profile?.show_on_map ?? true); setAllowMessages(data.profile?.allow_messages??true); setEmailNotifications(data.profile?.email_notifications??true); setMode('edit');
  }
  function cancel() {
    mutation.reset(); deletion.reset(); setConfirm(false);
    setShow(data.profile?.show_on_map ?? true); setMode('view');
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); mutation.mutate(new FormData(e.currentTarget));
  }
  const profile = data.profile;
  const visible = profile?.show_on_map ?? true;
  return <main className="page-main app-content profile-page"><LandscapeHero title="Мой профиль"/>
    <section className="prose-page">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        
        {mode === 'view' && <Button variant="outline" onClick={edit}><Pencil className="size-4" />Редактировать</Button>}
      </div>
      {mode === 'view' ? <article aria-label="Карточка профиля" className="rounded-lg border border-border bg-card p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {data.avatarUrl ? <img src={data.avatarUrl} alt="Фото профиля" className="size-24 shrink-0 rounded-full object-cover" /> :
            <div aria-label="Инициалы" className="flex size-24 shrink-0 items-center justify-center rounded-full bg-secondary text-3xl font-bold text-primary">{profileInitials(profile?.display_name, profile?.family_name)}</div>}
          <div className="min-w-0 flex-1">
            <h2 className="!mt-0 text-2xl font-bold [overflow-wrap:anywhere]">{[profile?.display_name, profile?.family_name].filter(Boolean).join(' ') || 'Участник Иронкарты'}</h2>
            {(profile?.country || profile?.city) && <p className="mt-2 flex items-start gap-2"><MapPin className="mt-1 size-4 shrink-0 text-terra" /><span className="[overflow-wrap:anywhere]">{[profile?.country, profile?.city].filter(Boolean).join(' · ')}</span></p>}
            <span className="mt-3 inline-flex items-center gap-2 text-sm text-primary">{visible ? <Eye className="size-4 shrink-0" /> : <EyeOff className="size-4 shrink-0" />}{visible ? 'Показан на карте' : 'Скрыт с карты'}</span>
          </div>
        </div>
        {profile?.about && <div className="mt-6 border-t border-border pt-5"><h3 className="text-sm font-semibold">О себе</h3><p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere]">{profile.about}</p></div>}
      </article> : <>
        <form onSubmit={submit} className="max-w-md">
          <fieldset disabled={mutation.isPending || deletion.isPending}>
            {data.avatarUrl && <img src={data.avatarUrl} alt="Фото профиля" className="mb-4 size-20 rounded-full object-cover" />}
            <label className="field"><span>Имя</span><input name="name" maxLength={80} defaultValue={profile?.display_name || (initialProfileMode(profile) === 'edit' && user?.app_metadata['provider'] === 'google' ? googleDisplayName(user.user_metadata) : '')} /></label>
            <label className="field"><span>Фамилия (род)</span><input name="family" maxLength={100} defaultValue={profile?.family_name ?? ''} /></label>
            <label className="field"><span>Страна</span><input name="country" maxLength={100} defaultValue={profile?.country ?? ''} /></label>
            <label className="field"><span>Город</span><input name="city" maxLength={120} defaultValue={profile?.city ?? ''} /></label>
            <label className="field"><span>О себе · до 300 символов</span><textarea name="about" maxLength={300} defaultValue={profile?.about ?? ''} className="w-full rounded-md border border-input bg-background p-3" /></label>
            <label className="field"><span>Фотография · до 2 МБ</span><input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" className="min-w-0 max-w-full" /></label>
            <label className="my-5 flex items-center gap-3"><Switch checked={show} onCheckedChange={setShow} aria-label="Показывать меня на карте" /><span>Показывать меня на карте</span></label>
            <label className="my-5 flex items-center gap-3"><Switch checked={allowMessages} onCheckedChange={setAllowMessages} aria-label="Мне можно писать"/><span>Мне можно писать</span></label>
            <label className="my-5 flex items-center gap-3"><Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} aria-label="Уведомления на почту"/><span>Уведомления на почту <small className="text-muted-foreground">· скоро</small></span></label>
            <label className="consent"><input type="checkbox" required defaultChecked={data.consented || Boolean(profile?.processing_consent_at)} /><span>Согласен на обработку данных по <Link to="/privacy" className="underline">политике конфиденциальности</Link></span></label>
            <div className="flex flex-wrap gap-3"><Button disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Сохраняем…' : 'Сохранить'}</Button><Button type="button" variant="outline" onClick={cancel}>Отмена</Button></div>
          </fieldset>
          {mutation.error && <p role="alert" className="mt-3 text-destructive">{mutation.error.message}</p>}
        </form>
      </>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="!mt-0">Мои точки</h2>
        <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/"><Plus className="size-4" />Добавить отметку</Link></Button>{data.moderator && <Button asChild variant="outline"><Link to="/admin">Админка</Link></Button>}</div>
      </div>
      {!data.marks.length && <p className="mt-4">Вы пока не отправили отметок.</p>}
      <div className="mt-4 divide-y divide-border">{data.marks.map(mark => {
        const status = mark.status === 'approved' ? statuses.approved : mark.status === 'rejected' ? statuses.rejected : statuses.pending;
        const Icon = status.icon;
        return <article key={mark.id} className="py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><strong className="[overflow-wrap:anywhere]">{mark.families?.name}</strong><p className="[overflow-wrap:anywhere]">{mark.country}{mark.city ? ` · ${mark.city}` : ''}</p></div>
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${status.color}`}><Icon className="size-3.5" />{status.label}</span>
          </div>
          {mark.moderation_note && <p className="mt-2 [overflow-wrap:anywhere]">Комментарий администратора: {mark.moderation_note}</p>}
        </article>;
      })}</div>
      <Suspense fallback={<p>Загружаем список…</p>}><BlockedList/></Suspense>
      {mode === 'edit' && <section aria-label="Опасная зона" className="mt-10 border-t border-destructive/30 pt-6">
        <h2 className="!mt-0 text-destructive">Опасная зона</h2>
        <p className="mb-4 mt-2">Удаление аккаунта также удалит профиль, фотографии, все ваши точки, сообщения и диалоги.</p>
        {confirm ? <div><p className="mb-4">Удалить аккаунт без возможности восстановления?</p><div className="flex flex-wrap gap-3"><Button variant="destructive" disabled={deletion.isPending || mutation.isPending} onClick={() => deletion.mutate(undefined)}>Да, удалить аккаунт</Button><Button variant="outline" disabled={deletion.isPending} onClick={() => setConfirm(false)}>Отмена</Button></div></div> : <Button variant="destructive" disabled={mutation.isPending} onClick={() => setConfirm(true)}>Удалить аккаунт</Button>}
        {deletion.error && <p role="alert" className="mt-3 text-destructive">{deletion.error.message}</p>}
      </section>}
    </section>
  </main>;
}
