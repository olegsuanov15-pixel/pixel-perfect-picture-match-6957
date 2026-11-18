import { useState } from "react";
import { MapPin, Plus, Minus, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import countries from "@/data/world.json";
import { demoPoints, type DemoPoint } from "@/data/demo";

export function WorldMap({
  selected = "barcelona",
  onSelect,
  family,
}: {
  selected?: string;
  onSelect?: (point: DemoPoint) => void;
  family?: string;
}) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className={`world-map zoom-${zoom}`} aria-label="Карта мира с демонстрационными отметками">
      <div className="map-layer">
        <svg
          className="geography"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {countries.map((c) => (
            <path key={c.name} d={c.path} className="country" />
          ))}
        </svg>
        <span className="map-label label-america">Северная Америка</span>
        <span className="map-label label-europe">Европа</span>
        <span className="map-label label-asia">Азия</span>
        <span className="map-label label-africa">Африка</span>
        <span className="map-label label-oceania">Австралия</span>
        {demoPoints
          .filter((p) => !family || p.family === family)
          .map((p) => (
            <Button
              key={p.id}
              variant="ghost"
              className={`map-pin pin-${p.id} ${selected === p.id ? "is-selected" : ""}`}
              aria-label={`${p.family}, ${p.city}`}
              onClick={() => onSelect?.(p)}
              title={`${p.family} · ${p.city}`}
            >
              <MapPin />
              {selected === p.id && (
                <span className="pin-tooltip">
                  {p.family} · {p.city}
                </span>
              )}
            </Button>
          ))}
      </div>
      <div className="map-controls">
        <Button
          variant="ghost"
          size="icon"
          title="Приблизить"
          aria-label="Приблизить карту"
          disabled={zoom === 3}
          onClick={() => setZoom((z) => Math.min(3, z + 1))}
        >
          <Plus />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Отдалить"
          aria-label="Отдалить карту"
          disabled={zoom === 1}
          onClick={() => setZoom((z) => Math.max(1, z - 1))}
        >
          <Minus />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Показать весь мир"
          aria-label="Показать весь мир"
          onClick={() => setZoom(1)}
        >
          <Maximize />
        </Button>
      </div>
      <div className="map-legend">
        <MapPin /> {family ? "Отметки фамилии Суановы" : "Наши по всему миру"}
      </div>
      <span className="map-credit">Границы: Natural Earth · демонстрационные отметки</span>
    </div>
  );
}
