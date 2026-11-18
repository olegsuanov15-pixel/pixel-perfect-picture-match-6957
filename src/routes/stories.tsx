import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { pageHead } from "@/data/demo";
export const Route = createFileRoute("/stories")({
  head: () =>
    pageHead(
      "Истории фамилий",
      "Осетинские фамилии, семейные воспоминания и общие корни на Иронкарте.",
    ),
  component: Stories,
});
function Stories() {
  return (
    <main className="page-main">
      <section className="intro">
        <div className="eyebrow">Память, которая объединяет</div>
        <h1>Истории фамилий</h1>
        <p>Наши фамилии — начало большого семейного рассказа.</p>
      </section>
      <Link to="/family/suanovy" className="family-entry">
        <h2>Суановы</h2>
        <p>Одна фамилия. Разные города. Общие корни.</p>
        <div className="inline-flex items-center gap-2 text-sm text-primary">
          <MapPin size={15} />4 страны · 43 участника
        </div>
        <span className="text-link flex">
          Открыть страницу фамилии <ArrowRight />
        </span>
      </Link>
      <p className="demo-notice max-w-lg mb-16">
        Первая демонстрационная страница. Исторические материалы пока не добавлены.
      </p>
    </main>
  );
}
