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
import { pageHead } from "@/data/demo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/lib/catalog-query";
import { DataError, DataNotFound } from "@/components/ironkarta/data-boundaries";
import { SurnameSearch } from "@/components/ironkarta/surname-search";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { point?: string } =>
    typeof search["point"] === "string" ? { point: search["point"] } : {},
  head: () =>
    pageHead(
      "Найди своих по всему миру",
      "Карта осетинских фамилий. Найдите своих, где бы вы ни были.",
    ),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(catalogQuery());
  },
  errorComponent: DataError,
  notFoundComponent: DataNotFound,
  component: Index,
});
function Index() {
  const { point } = Route.useSearch();
  const { data } = useSuspenseQuery(catalogQuery());
  const points = [...data.marks].sort((a,b)=>b.created_at.localeCompare(a.created_at)).flatMap((mark) => {
    const family = data.families.find((f) => f.id === mark.family_id);
    return family ? [{ ...mark, family: family.name, slug: family.slug }] : [];
  });
  const [selectedId, setSelectedId] = useState(point ?? "");
  const selected = points.find((p) => p.id === selectedId) ?? points[0];
  const [shared, setShared] = useState(false);
  const countriesCount = new Set(points.map((p) => p.country)).size;
  const participants = points.length;
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
            <SurnameSearch />
            <Button variant="terra" className="h-12 px-5" onClick={focusForm}>
              <MapPin />
              Добавить свою точку
            </Button>
            <span className="demo-tag">Одобренные отметки</span>
          </div>
          <WorldMap
            points={points}
            selected={selected?.id ?? ""}
            onSelect={(p) => setSelectedId(p.id)}
          />
          <div className="map-bottom">
            <div className="map-stats">
              <div className="stat">
                <Globe2 />
                <strong>{countriesCount}</strong>
                <span>стран</span>
              </div>
              <div className="stat">
                <MapPin />
                <strong>{points.length}</strong>
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
              <h2>{selected?.family ?? "Свои на карте"}</h2>
            </div>
            <div className="title-rule" />
            {selected&&<p className="family-location">{selected.city} · {selected.country}</p>}
            <div className="divide-y divide-border">{points.slice(0,5).map(p=><Link key={p.id} to="/family/$slug" params={{slug:p.slug}} className="block py-2 text-sm"><strong>{p.family}</strong><br/>{p.country}{p.city?` · ${p.city}`:''}</Link>)}</div>
            <div className="community-line">

              <span>
                {selected ? "Одобренная отметка участника" : "Одобренных отметок пока нет"}
              </span>
            </div>
            <Button className="w-full h-10" onClick={share} disabled={!selected}>
              {shared ? <Check /> : <Share2 />}
              {shared ? "Ссылка скопирована" : "Поделиться находкой"}
            </Button>
            {selected ? (
              <Link to="/family/$slug" params={{ slug: selected.slug }} className="text-link">
                История фамилии <ArrowRight />
              </Link>
            ) : (
              <Link to="/search" className="text-link">
                Найти фамилию <ArrowRight />
              </Link>
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
