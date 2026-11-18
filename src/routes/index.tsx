import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  MapPin,
  Globe2,
  Users,
  ArrowRight,
  HeartHandshake,
  Share2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorldMap } from "@/components/ironkarta/world-map";
import { AddPoint } from "@/components/ironkarta/add-point";
import { demoPoints, pageHead } from "@/data/demo";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { point?: string } =>
    typeof search.point === "string" ? { point: search.point } : {},
  head: () =>
    pageHead(
      "Найди своих по всему миру",
      "Карта осетинских фамилий. Найдите своих, где бы вы ни были.",
    ),
  component: Index,
});
function Index() {
  const { point } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(
    demoPoints.find((p) => p.id === point) ?? demoPoints[1],
  );
  const [shared, setShared] = useState(false);
  const results = [...new Set(demoPoints.map((p) => p.family))].filter((f) =>
    f.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru")),
  );
  const countriesCount = new Set(demoPoints.map((p) => p.country)).size;
  const participants = demoPoints.reduce((n, p) => n + p.people, 0);
  function focusForm() {
    document.getElementById("add-point")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelector<HTMLInputElement>("#add-point input")?.focus({ preventScroll: true });
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/?point=${selected?.id ?? "barcelona"}`,
      );
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      setShared(false);
    }
  }
  return (
    <main className="page-main">
      <section className="intro">
        <div className="eyebrow">Одна история. Тысячи дорог.</div>
        <h1>Найди своих по всему миру</h1>
        <p>От родных гор до далёких городов — мы ближе, чем кажется.</p>
      </section>
      <div className="workspace">
        <section>
          <div className="map-toolbar">
            <div className="search-wrap">
              <div className="search-box">
                <Search />
                <input
                  aria-label="Поиск фамилии"
                  placeholder="Введите фамилию…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {query.trim() && (
                <div className="search-results">
                  {results.length ? (
                    results.map((f) =>
                      f === "Суановы" ? (
                        <Link key={f} to="/family/suanovy">
                          {f}
                          <ArrowRight size={15} />
                        </Link>
                      ) : (
                        <Button
                          key={f}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setSelected(demoPoints.find((p) => p.family === f));
                            setQuery("");
                          }}
                        >
                          {f}
                        </Button>
                      ),
                    )
                  ) : (
                    <p>Такой фамилии пока нет на демо-карте.</p>
                  )}
                </div>
              )}
            </div>
            <Button variant="terra" className="h-12 px-5" onClick={focusForm}>
              <MapPin />
              Добавить свою точку
            </Button>
            <span className="demo-tag">Демо-карта</span>
          </div>
          <WorldMap selected={selected?.id ?? "barcelona"} onSelect={setSelected} />
          <div className="map-bottom">
            <div className="map-stats">
              <div className="stat">
                <Globe2 />
                <strong>{countriesCount}</strong>
                <span>стран</span>
              </div>
              <div className="stat">
                <MapPin />
                <strong>{demoPoints.length}</strong>
                <span>отметок</span>
              </div>
              <div className="stat">
                <Users />
                <strong>{participants}</strong>
                <span>участников</span>
              </div>
            </div>
            <span className="map-bottom-note">За каждой точкой — своя история</span>
          </div>
        </section>
        <aside className="sidebar">
          <AddPoint compact />
          <section className="framed-tool selected-family">
            <div className="selected-top">
              <MapPin />
              <h2>{selected?.family ?? "Суановы"}</h2>
            </div>
            <div className="title-rule" />
            <p className="family-location">
              {selected?.city} · {selected?.country}
            </p>
            <div className="community-line">
              <div className="avatar-stack">
                <span>А</span>
                <span>М</span>
                <span>С</span>
              </div>
              <span>{selected?.people} участников рядом</span>
            </div>
            <Button className="w-full h-10" onClick={share}>
              {shared ? <Check /> : <Share2 />}
              {shared ? "Ссылка скопирована" : "Поделиться находкой"}
            </Button>
            {selected?.family === "Суановы" ? (
              <Link to="/family/suanovy" className="text-link">
                История фамилии <ArrowRight />
              </Link>
            ) : (
              <p>История этой фамилии ещё не добавлена.</p>
            )}
          </section>
        </aside>
      </div>
      <section className="connection-band">
        <HeartHandshake className="connection-icon" />
        <div className="connection-copy">
          <h2>Разные города. Одни корни.</h2>
          <p>Сохраняем связь с родными местами и находим друг друга.</p>
        </div>
        <Link to="/about" className="text-link">
          Больше о проекте <ArrowRight />
        </Link>
      </section>
    </main>
  );
}
