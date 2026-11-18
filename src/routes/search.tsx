import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { catalogQuery } from "@/lib/catalog-query";
import { DataError, DataNotFound } from "@/components/ironkarta/data-boundaries";
import { SurnameSearch } from "@/components/ironkarta/surname-search";
import { pageHead } from "@/data/demo";
export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"] } : {},
  loaderDeps: ({ search }) => ({ q: (search.q ?? "").slice(0, 150) }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(catalogQuery(deps.q));
  },
  head: () =>
    pageHead(
      "Поиск фамилии",
      "Найдите фамилию в каталоге Иронкарты и откройте историю по источникам и одобренные отметки участников.",
    ),
  component: SearchPage,
  errorComponent: DataError,
  notFoundComponent: DataNotFound,
});
function SearchPage() {
  const { q = "" } = Route.useSearch();
  const safeQ = q.slice(0, 150);
  const { data } = useSuspenseQuery(catalogQuery(safeQ));
  return (
    <main className="page-main">
      <section className="intro">
        <div className="eyebrow">Каталог фамилий</div>
        <h1>Результаты поиска</h1>
        <p>
          {safeQ
            ? `По запросу «${safeQ}» найдено: ${data.families.length}`
            : "Все фамилии в каталоге"}
        </p>
      </section>
      <div className="max-w-xl">
        <SurnameSearch key={safeQ} initial={safeQ} />
      </div>
      <section className="family-results">
        {data.families.map((f) => (
          <Link key={f.id} to="/family/$slug" params={{ slug: f.slug }} className="family-entry">
            <h2>{f.name}</h2>
            <p>История по источникам и отметки участников</p>
            <span className="text-link">
              Открыть фамилию <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>
      {!data.families.length && (
        <div className="family-description">
          <h2 className="section-title">Ничего не найдено</h2>
          <p>Попробуйте другую фамилию или её часть.</p>
        </div>
      )}
    </main>
  );
}
