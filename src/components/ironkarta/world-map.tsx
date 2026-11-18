import {Link} from '@tanstack/react-router';
import {WriteButton} from '@/components/messaging/write-button';
import { useState,useRef } from "react";
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
  showPopup = true,
}: {
  selected?: string;
  onSelect?: (point: MapPoint) => void;
  points?: MapPoint[];
  showPopup?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan,setPan]=useState({x:0,y:0});const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);

  return (
    <div className={`world-map zoom-${zoom}`} aria-label="Карта мира с одобренными отметками">
      <div className="map-layer" style={{transform:`translate(calc(-50% + ${pan.x}px),calc(-50% + ${pan.y}px)) scale(${1+(zoom-1)*0.4})`}}
 onPointerDown={e=>{if(e.target instanceof Element&&e.target.closest('button'))return;drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={e=>{if(drag.current)setPan({x:drag.current.px+e.clientX-drag.current.x,y:drag.current.py+e.clientY-drag.current.y});}}
 onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
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
              <svg viewBox="0 0 24 30" aria-hidden="true"><path d="M12 1C5.9 1 1 5.9 1 12c0 7.3 11 17 11 17s11-9.7 11-17C23 5.9 18.1 1 12 1Z"/><circle cx="12" cy="11" r="4" className="pin-center"/></svg>
              {selected === p.id && (
                <span className="pin-tooltip">
                  {p.city || p.family}
                </span>
              )}
            </Button>
          ))}
      </div>
      {showPopup&&points.filter(p=>p.id===selected).map(p=><div key={p.id} className="absolute bottom-14 left-4 z-20 rounded-md border border-border bg-background p-3"><Link to="/surname/$slug" params={{slug:p.family.toLocaleLowerCase('ru')}} className="block font-bold text-sm">{p.family}</Link><WriteButton pointId={selected}/></div>)}
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
          title="Центрировать карту"
          aria-label="Центрировать карту"
          onClick={() => {setZoom(1);setPan({x:0,y:0});}}
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
