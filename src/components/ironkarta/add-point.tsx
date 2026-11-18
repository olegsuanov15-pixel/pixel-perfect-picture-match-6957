import { useState, useRef, type FormEvent } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddPoint({ family = "", compact = false }: { family?: string; compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
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
            Это демонстрация: ваша точка не сохранена и не опубликована.
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSent(false);
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
            <input name="surname" placeholder="Например, Суановы" defaultValue={family} required />
          </label>
          <label className="field">
            <span>Страна</span>
            <select name="country" defaultValue="" required>
              <option value="" disabled>
                Выберите страну
              </option>
              <option>Россия</option>
              <option>Испания</option>
              <option>Франция</option>
              <option>Германия</option>
              <option>Великобритания</option>
              <option>Казахстан</option>
              <option>США</option>
              <option>Южная Корея</option>
              <option>Другая страна</option>
            </select>
          </label>
          <label className="field">
            <span>
              Город <span className="inline text-muted-foreground">· необязательно</span>
            </span>
            <input name="city" placeholder="Где вы сейчас живёте?" />
          </label>
          <label className="consent">
            <input type="checkbox" required defaultChecked />
            <span>Разрешаю показать эту отметку на карте</span>
          </label>
          <Button variant="terra" className="w-full h-11" type="submit">
            <MapPin size={16} />
            Добавить на карту
          </Button>
          <p className="form-note">
            {compact
              ? "Демонстрация · без сохранения данных"
              : "Только город и фамилия. Никаких точных адресов."}
          </p>
        </form>
      )}
    </section>
  );
}
