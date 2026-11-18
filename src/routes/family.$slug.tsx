import {WriteButton} from '@/components/messaging/write-button';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, MapPin, Globe2, Users, BookOpen, ExternalLink } from "lucide-react";
import { familyQuery } from "@/lib/catalog-query";
import { DataError, DataNotFound } from "@/components/ironkarta/data-boundaries";
import { WorldMap } from "@/components/ironkarta/world-map";
import { AddPoint } from "@/components/ironkarta/add-point";
import { pageHead } from "@/data/demo";
export const Route = createFileRoute("/family/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(familyQuery(params.slug));
    return { name: result.family.name };
  },
  head: ({ loaderData }) =>
    pageHead(
      loaderData?.name ?? "Фамилия не найдена",
      "История фамилии по опубликованным источникам и одобренные отметки участников.",
    ),
  component: Family,
  errorComponent: DataError,
  notFoundComponent: DataNotFound,
});
function Family() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(familyQuery(slug));
  const [selected, setSelected] = useState("");
  const { family, histories, marks } = data;
  return (
    <main className="page-main">
      <Link to="/search" className="breadcrumb">
        <ArrowLeft size={14} />
        Назад к поиску
      </Link>
      <div className="family-heading">
        <div>
          <div className="eyebrow">Истории фамилий</div>
          <h1>{family.name}</h1>
          <p>История по источникам и места, где отметились участники.</p>
        </div>
        <div className="map-stats">
          <div className="stat">
            <Globe2 />
            <strong>{new Set(marks.map((p) => p.country)).size}</strong>
            <span>стран</span>
          </div>
          <div className="stat">
            <Users />
            <strong>{marks.length}</strong>
            <span>отметок</span>
          </div>
        </div>
      </div>
      <div className="family-layout">
        <div>
          <section className="history-section">
            <h2 className="section-title">
              <BookOpen className="inline mr-2" size={20} />
              История по источникам
            </h2>
            <div className="title-rule" />
            {histories.length ? (
              histories.map((h) => (
                <article key={h.id} className="history-article">
                  <h3>{h.title}</h3>
                  <p className="history-body">{h.body}</p>
                  <div className="source-list">
                    {h.family_history_sources.map(
                      (c) =>
                        c.history_sources && (
                          <div key={c.id} className="source-item">
                            <strong>{c.history_sources.title}</strong>
                            {c.history_sources.author_or_organization && (
                              <p>{c.history_sources.author_or_organization}</p>
                            )}
                            {c.history_sources.publication_year && (
                              <p>Год: {c.history_sources.publication_year}</p>
                            )}
                            {c.pages && <p>Страницы: {c.pages}</p>}
                            {c.history_sources.url && (
                              <a
                                href={c.history_sources.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-link"
                              >
                                Открыть источник <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        ),
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-copy">История этой фамилии пока не добавлена</p>
            )}
          </section>
          <section className="participant-section">
            <h2 className="section-title">Где отметились участники</h2>
            <p className="empty-copy">
              {marks.length ? "Одобренные отметки участников" : "Одобренных отметок пока нет"}
            </p>
            <WorldMap
              points={marks.map((p) => ({ ...p, family: family.name, slug: family.slug }))}
              selected={selected}
              onSelect={(p) => setSelected(p.id)}
            />
            <div className="location-list">
              {marks.map((p) => (
                <div className="location-row" key={p.id}>
                  <MapPin />
                  <span>
                    {p.country}
                    {p.city && <small className="block mt-1">{p.city}</small>}
                    <WriteButton pointId={p.id}/>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside>
          <AddPoint family={family.name} compact />
        </aside>
      </div>
    </main>
  );
}
