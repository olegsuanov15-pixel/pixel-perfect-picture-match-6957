import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { describe, it, expect } from 'vitest';

// Execute the deployed SQL unchanged in isolated PostgreSQL; no participant data is touched.
async function databaseAssert(body: string) {
 const db = new PGlite();
 try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
   CREATE TABLE public.profiles(id uuid PRIMARY KEY,created_at timestamptz DEFAULT now());
   INSERT INTO public.profiles(id) VALUES('00000000-0000-4000-8000-000000000001');
   CREATE TABLE public.conversations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),initiator_id uuid,status text DEFAULT 'pending');
   CREATE TABLE public.messages(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),sender_id uuid);
  `);
  await db.exec(readFileSync('drizzle/migrations/0009_account_messaging_frequency_limits.sql', 'utf8'));
  await db.exec(`DO $$ DECLARE account uuid := '00000000-0000-4000-8000-000000000001'; n integer; rejected boolean := false; BEGIN ${body} END; $$;`);
  const result = await db.query('SELECT count(*)::integer AS count FROM public.profiles');
  expect(result.rows).toEqual([{count:1}]);
 } finally { await db.close(); }
}

describe('Account messaging frequency, enforced by the database', () => {
  it('allows 5 requests in 24 hours and rejects the sixth with an understandable error', async () => {
    await databaseAssert(`
      FOR n IN 1..5 LOOP INSERT INTO public.conversations(initiator_id) VALUES(account); END LOOP;
      BEGIN INSERT INTO public.conversations(initiator_id) VALUES(account);
      EXCEPTION WHEN raise_exception THEN
        IF SQLERRM <> 'Можно отправить не больше 5 новых запросов за 24 часа. Попробуйте позже.' THEN RAISE; END IF;
        rejected := true;
      END;
      IF NOT rejected THEN RAISE EXCEPTION 'Sixth request was allowed'; END IF;
      IF (SELECT count(*) FROM public.messaging_send_events WHERE user_id=account AND kind='request')<>5 THEN RAISE EXCEPTION 'Failed request consumed quota'; END IF;
    `);
  });
  it('allows 30 messages in 60 seconds and rejects the thirty-first with an understandable error', async () => {
    await databaseAssert(`
      FOR n IN 1..30 LOOP INSERT INTO public.messages(sender_id) VALUES(account); END LOOP;
      BEGIN INSERT INTO public.messages(sender_id) VALUES(account);
      EXCEPTION WHEN raise_exception THEN
        IF SQLERRM <> 'Можно отправить не больше 30 сообщений за минуту. Подождите немного.' THEN RAISE; END IF;
        rejected := true;
      END;
      IF NOT rejected THEN RAISE EXCEPTION 'Thirty-first message was allowed'; END IF;
      IF (SELECT count(*) FROM public.messaging_send_events WHERE user_id=account AND kind='message')<>30 THEN RAISE EXCEPTION 'Failed message consumed quota'; END IF;
    `);
  });
  it('expires request events after a rolling 24 hours, not at calendar midnight', async () => {
    await databaseAssert(`
      FOR n IN 1..5 LOOP PERFORM public.enforce_messaging_frequency(account,'request'); END LOOP;
      UPDATE public.messaging_send_events SET sent_at=clock_timestamp()-interval '24 hours 1 second' WHERE user_id=account AND kind='request';
      PERFORM public.enforce_messaging_frequency(account,'request');
      IF (SELECT count(*) FROM public.messaging_send_events WHERE user_id=account AND kind='request')<>1 THEN RAISE EXCEPTION 'Expired request events still counted'; END IF;
    `);
  });
  it('expires message events after a rolling 60 seconds', async () => {
    await databaseAssert(`
      FOR n IN 1..30 LOOP PERFORM public.enforce_messaging_frequency(account,'message'); END LOOP;
      UPDATE public.messaging_send_events SET sent_at=clock_timestamp()-interval '61 seconds' WHERE user_id=account AND kind='message';
      PERFORM public.enforce_messaging_frequency(account,'message');
      IF (SELECT count(*) FROM public.messaging_send_events WHERE user_id=account AND kind='message')<>1 THEN RAISE EXCEPTION 'Expired message events still counted'; END IF;
    `);
  });
  it('enforces both first-request and message inserts with non-bypassable triggers', async () => {
    await databaseAssert(`
      IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.conversations'::regclass AND tgname='conversation_frequency_guard' AND tgenabled='O') THEN RAISE EXCEPTION 'Request guard missing'; END IF;
      IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.messages'::regclass AND tgname='message_frequency_guard' AND tgenabled='O') THEN RAISE EXCEPTION 'Message guard missing'; END IF;
      IF has_function_privilege('authenticated','public.enforce_messaging_frequency(uuid,text)','EXECUTE') THEN RAISE EXCEPTION 'Client can mutate quota directly'; END IF;
      IF has_table_privilege('authenticated','public.messaging_send_events','INSERT') OR has_table_privilege('authenticated','public.messaging_send_events','DELETE') THEN RAISE EXCEPTION 'Client can bypass quota'; END IF;
    `);
  });
  it('counts repeat requests and rolls back a request if its first message exceeds the message limit', async () => {
    await databaseAssert(`
      INSERT INTO public.conversations(initiator_id,status) VALUES(account,'accepted');
      DELETE FROM public.messaging_send_events WHERE user_id=account;
      UPDATE public.conversations SET status='pending';
      IF (SELECT count(*) FROM public.messaging_send_events WHERE user_id=account AND kind='request')<>1 THEN RAISE EXCEPTION 'Retry bypassed request limit'; END IF;
      FOR n IN 1..30 LOOP INSERT INTO public.messages(sender_id) VALUES(account); END LOOP;
      BEGIN
        INSERT INTO public.conversations(initiator_id) VALUES(account);
        INSERT INTO public.messages(sender_id) VALUES(account);
      EXCEPTION WHEN raise_exception THEN rejected:=true;
      END;
      IF NOT rejected THEN RAISE EXCEPTION 'First message bypassed message limit'; END IF;
      IF (SELECT count(*) FROM public.messaging_send_events WHERE user_id=account AND kind='request')<>1 THEN RAISE EXCEPTION 'Failed request consumed quota'; END IF;
    `);
  });

});
