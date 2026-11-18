import {Link} from '@tanstack/react-router';
import {WriteButton} from '@/components/messaging/write-button';
import { useState } from "react";
import { MapPin, Plus, Minus, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import countries from "@/data/world.json";
export type MapPoint = {
  id: string;
  family: string;
  slug: string;
  country: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function WorldMap({
  selected = "barcelona",
  onSelect,
  points = [],
}: {
  selected?: string;
  onSelect?: (point: MapPoint) => void;
  points?: MapPoint[];
}) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className={`world-map zoom-${zoom}`} aria-label="Карта мира с одобренными отметками">
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
        {points
          .filter((p) => p.latitude !== null && p.longitude !== null)
          .map((p) => (
            <Button
              key={p.id}
              variant="ghost"
              className={`map-pin ${selected === p.id ? "is-selected" : ""}`}
              style={{
                left: `${(((p.longitude ?? 0) + 180) / 360) * 100}%`,
                top: `${((85 - (p.latitude ?? 0)) / 145) * 100}%`,
              }}
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
      {points.filter(p=>p.id===selected).map(p=><div key={p.id} className="absolute bottom-14 left-4 z-20 rounded-md border border-border bg-background p-3"><Link to="/surname/$slug" params={{slug:p.family.toLocaleLowerCase('ru')}} className="block font-bold text-sm">{p.family}</Link><WriteButton pointId={selected}/></div>)}
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
        <MapPin /> Одобренные отметки
      </div>
      <span className="map-credit">Границы: Natural Earth</span>
    </div>
  );
}
