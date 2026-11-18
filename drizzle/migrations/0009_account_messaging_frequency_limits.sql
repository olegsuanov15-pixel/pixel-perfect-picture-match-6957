CREATE TABLE public.messaging_send_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('request','message')),
 sent_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
GRANT ALL ON public.messaging_send_events TO service_role;
ALTER TABLE public.messaging_send_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX messaging_send_events_account_window ON public.messaging_send_events(user_id,kind,sent_at);

CREATE FUNCTION public.enforce_messaging_frequency(_user uuid,_kind text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
 window_size interval;
 maximum integer;
 current_time_at timestamptz;
BEGIN
 IF _user IS NULL OR _kind NOT IN ('request','message') THEN RAISE EXCEPTION 'Не удалось проверить отправку'; END IF;
 -- One account lock is shared across requests and chat messages, including different dialogs.
 PERFORM pg_advisory_xact_lock(hashtextextended('messaging-frequency:'||_user::text,0));
 current_time_at := clock_timestamp();
 window_size := CASE WHEN _kind='request' THEN interval '24 hours' ELSE interval '60 seconds' END;
 maximum := CASE WHEN _kind='request' THEN 5 ELSE 30 END;
 DELETE FROM public.messaging_send_events WHERE user_id=_user AND kind=_kind AND sent_at<=current_time_at-window_size;
 IF (SELECT count(*) FROM public.messaging_send_events WHERE user_id=_user AND kind=_kind AND sent_at>current_time_at-window_size)>=maximum THEN
  IF _kind='request' THEN RAISE EXCEPTION 'Можно отправить не больше 5 новых запросов за 24 часа. Попробуйте позже.';
  ELSE RAISE EXCEPTION 'Можно отправить не больше 30 сообщений за минуту. Подождите немного.';
  END IF;
 END IF;
 INSERT INTO public.messaging_send_events(user_id,kind,sent_at) VALUES(_user,_kind,current_time_at);
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_messaging_frequency(uuid,text) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.guard_conversation_frequency() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  PERFORM public.enforce_messaging_frequency(NEW.initiator_id,'request');
 ELSIF NEW.status='pending' AND OLD.status<>'pending' THEN
  PERFORM public.enforce_messaging_frequency(NEW.initiator_id,'request');
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_conversation_frequency() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER conversation_frequency_guard BEFORE INSERT OR UPDATE OF status ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.guard_conversation_frequency();

CREATE FUNCTION public.guard_message_frequency() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM public.enforce_messaging_frequency(NEW.sender_id,'message');
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_message_frequency() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER message_frequency_guard BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.guard_message_frequency();
