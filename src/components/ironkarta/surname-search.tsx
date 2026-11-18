import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
export function SurnameSearch({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();
  function submit(e: FormEvent) {
    e.preventDefault();
    navigate({ to: "/search", search: { q: value.trim().slice(0, 150) } });
  }
  return (
    <form onSubmit={submit} className="search-wrap">
      <div className="search-box">
        <Search />
        <input
          aria-label="Поиск фамилии"
          name="q"
          placeholder="Введите фамилию…"
          value={value}
          maxLength={150}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          variant="ghost"
          type="submit"
          aria-label="Найти фамилию"
          title="Найти фамилию"
          size="icon"
        >
          <Search />
        </Button>
      </div>
    </form>
  );
}
