import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Globe2, Users } from "lucide-react";
import { WorldMap } from "@/components/ironkarta/world-map";
import { AddPoint } from "@/components/ironkarta/add-point";
import { demoPoints, pageHead } from "@/data/demo";

export const Route = createFileRoute("/family/suanovy")({
  head: () =>
    pageHead(
      "Суановы — одна фамилия, разные города",
      "Демонстрационная страница фамилии Суановы: отметки на карте мира и связь с родными корнями.",
    ),
  component: Family,
});
function Family() {
  const [selected, setSelected] = useState("barcelona");
  const points = demoPoints.filter((p) => p.family === "Суановы");
  return (
    <main className="page-main">
      <Link to="/" className="breadcrumb">
        <ArrowLeft size={14} />
        Назад к карте
      </Link>
      <div className="family-heading">
        <div>
          <div className="eyebrow">Истории фамилий</div>
          <h1>Суановы</h1>
          <p>Одна фамилия. Разные города. Общие корни.</p>
        </div>
        <div className="map-stats">
          <div className="stat">
            <Globe2 />
            <strong>{new Set(points.map((p) => p.country)).size}</strong>
            <span>страны</span>
          </div>
          <div className="stat">
            <Users />
            <strong>{points.reduce((n, p) => n + p.people, 0)}</strong>
            <span>участника</span>
          </div>
        </div>
      </div>
      <div className="family-layout">
        <section>
          <WorldMap family="Суановы" selected={selected} onSelect={(p) => setSelected(p.id)} />
          <div className="family-description">
            <h2 className="section-title">Нить, которая нас связывает</h2>
            <p>
              Фамилия — это связь между поколениями, семейными воспоминаниями и родными местами. Эта
              страница объединяет отметки Суановы на карте мира.
            </p>
            <p>
              Здесь появится история фамилии: рассказы семей, фотографии и воспоминания о предках.
              Подтверждённые исторические сведения пока не добавлены.
            </p>
            <div className="demo-notice">
              Все отметки и числа на этой странице — демонстрационные.
            </div>
          </div>
        </section>
        <aside className="sidebar">
          <AddPoint family="Суановы" compact />
          <section>
            <h2 className="section-title">Свои на карте</h2>
            <div className="location-list">
              {points.map((p) => (
                <div className="location-row" key={p.id}>
                  <MapPin />
                  <span>
                    {p.city}
                    <small className="block mt-1">{p.country}</small>
                  </span>
                  <small>{p.people} участников</small>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
