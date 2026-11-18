import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { pageHead } from "@/data/demo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/lib/catalog-query";
import { DataError, DataNotFound } from "@/components/ironkarta/data-boundaries";
export const Route = createFileRoute("/stories")({
  head: () =>
    pageHead(
      "Истории фамилий",
      "Осетинские фамилии, семейные воспоминания и общие корни на Иронкарте.",
    ),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(catalogQuery());
  },
  errorComponent: DataError,
  notFoundComponent: DataNotFound,
  component: Stories,
});
function Stories() {
  const { data } = useSuspenseQuery(catalogQuery());
  return (
    <main className="page-main">
      <section className="intro">
        <div className="eyebrow">Память, которая объединяет</div>
        <h1>Истории фамилий</h1>
        <p>Наши фамилии — начало большого семейного рассказа.</p>
      </section>
      <section className="family-results">
        {data.families.map((f) => (
          <Link key={f.id} to="/family/$slug" params={{ slug: f.slug }} className="family-entry">
            <h2>{f.name}</h2>
            <p>История по источникам</p>
            <span className="text-link">
              Открыть страницу фамилии <ArrowRight />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
