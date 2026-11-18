import { useState, useRef, type FormEvent } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { submitMark } from "@/lib/marks.functions";
import { catalogQuery } from "@/lib/catalog-query";
import { useParticipant } from "@/hooks/use-participant";

export function AddPoint({ family = "", compact = false }: { family?: string; compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const {user,ready}=useParticipant();
  const {data}=useSuspenseQuery(catalogQuery());
  const queryClient=useQueryClient();
  const save=useServerFn(submitMark);
  const mutation=useMutation({mutationFn:save,onSuccess:()=>{setSent(true);void queryClient.invalidateQueries({queryKey:['participant']});}});
  const formRef = useRef<HTMLFormElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    if(!formRef.current) return;
    const fields=new FormData(formRef.current);
    mutation.mutate({data:{familyId:String(fields.get('familyId')??''),country:String(fields.get('country')??''),city:String(fields.get('city')??''),consent:true}});
  }
  return (
    <section className="framed-tool" id="add-point">
      <h2 className="section-title">Добавить свою точку</h2>
      <div className="title-rule" />
      {sent ? (
        <>
          <div className="form-success" role="status">
            <CheckCircle2 size={24} />
            <strong>Спасибо, что вы с нами!</strong>
            <br />
            Ваша отметка сохранена и отправлена на проверку. Она появится на карте после одобрения.
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSent(false);
              mutation.reset();
              formRef.current?.reset();
            }}
          >
            Добавить ещё одну
          </Button>
        </>
      ) : (
        <form ref={formRef} onSubmit={submit}>
          <label className="field">
            <span>Ваша фамилия</span>
            <select name="familyId" defaultValue={data.families.find(f=>f.name===family)?.id??''} required>
              <option value="" disabled>Выберите фамилию</option>
              {data.families.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Страна</span>
            <input name="country" placeholder="Например, Испания" maxLength={100} required />
          </label>
          <label className="field">
            <span>
              Город <span className="inline text-muted-foreground">· необязательно</span>
            </span>
            <input name="city" placeholder="Где вы сейчас живёте?" maxLength={120} />
          </label>
          <label className="consent">
            <input type="checkbox" required />
            <span>Разрешаю показать эту отметку на карте</span>
          </label>
          {user ? <Button variant="terra" className="w-full h-11" type="submit" disabled={mutation.isPending}>
            <MapPin size={16} />
            {mutation.isPending ? 'Сохраняем…' : 'Отправить на проверку'}
          </Button> : <Button asChild variant="terra" className="w-full h-11" disabled={!ready}><Link to="/auth">Войти, чтобы отправить</Link></Button>}
          {mutation.error&&<p className="text-destructive text-sm mt-2" role="alert">{mutation.error.message}</p>}
          <p className="form-note">
            {compact ? "Публикация после проверки модератором" : "Только город и фамилия. Публикация после проверки."}
          </p>
        </form>
      )}
    </section>
  );
}
