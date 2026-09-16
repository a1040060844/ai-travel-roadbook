import { useEffect, useMemo, useRef, useState } from "react";
import { NavigationArrow } from "@phosphor-icons/react";
import { modeLabels, placeFor, roadbook, routeForSegment, type Coordinates, type Day, type TravelMode } from "../lib/roadbook";
import { navigationUrl } from "../lib/navigation";

type Props = { dayId?: string; compact?: boolean };

type MapLibreRuntime = {
  Map: new (options: Record<string, unknown>) => any;
  LngLatBounds: new (southWest: Coordinates, northEast: Coordinates) => { extend(coordinate: Coordinates): unknown };
  NavigationControl: new (options: Record<string, unknown>) => any;
  AttributionControl: new (options: Record<string, unknown>) => any;
  Marker: new (options: Record<string, unknown>) => { setLngLat(coordinate: Coordinates): { addTo(map: any): void } };
};

declare global { interface Window { maplibregl?: MapLibreRuntime } }

let mapRuntimePromise: Promise<MapLibreRuntime> | undefined;

function loadMapRuntime() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (mapRuntimePromise) return mapRuntimePromise;
  mapRuntimePromise = new Promise((resolve, reject) => {
    const stylesheetId = "maplibre-runtime-styles";
    if (!document.getElementById(stylesheetId)) {
      const stylesheet = document.createElement("link");
      stylesheet.id = stylesheetId;
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/vendor/maplibre-gl.css";
      document.head.append(stylesheet);
    }
    const script = document.createElement("script");
    script.src = "/vendor/maplibre-gl.js";
    script.async = true;
    script.onload = () => window.maplibregl ? resolve(window.maplibregl) : reject(new Error("MapLibre runtime loaded without its global API"));
    script.onerror = () => reject(new Error("Unable to load the local MapLibre runtime"));
    document.head.append(script);
  });
  return mapRuntimePromise;
}

const styles: Record<TravelMode, { color: string; dash?: number[] }> = {
  driving: { color: "#156da8" }, walking: { color: "#ef8955", dash: [1.2, 1] }, rail: { color: "#7c5db0", dash: [1.8, 0.8] }, ferry: { color: "#1e9fa9", dash: [0.55, 1.1] }, flight: { color: "#d39b45", dash: [0.4, 1.25] },
};

function daysFor(dayId?: string) { return dayId ? roadbook.days.filter((day) => day.id === dayId) : roadbook.days; }

export function TravelMap({ dayId, compact = false }: Props) {
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const days = useMemo(() => daysFor(dayId), [dayId]);
  const warningSegments = useMemo(() => days.flatMap((day) => day.segments.filter((segment) => !segment.verified || !routeForSegment(segment.id))), [days]);

  useEffect(() => {
    if (!node.current || days.length === 0) return;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let map: any;
    setReady(false);
    void loadMapRuntime().then((maplibregl) => {
      if (disposed || !node.current) return;
      const points = days.flatMap((day) => day.places.map((place) => place.coordinates));
      const safePoints: Coordinates[] = points.length > 0 ? points : [[0, 0]];
      const bounds = new maplibregl.LngLatBounds(safePoints[0], safePoints[0]);
      safePoints.slice(1).forEach((coordinate) => bounds.extend(coordinate));
      map = new maplibregl.Map({
      container: node.current,
      style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" } }, layers: [{ id: "background", type: "background", paint: { "background-color": "#e6edf0" } }, { id: "osm", type: "raster", source: "osm" }] },
      bounds, fitBoundsOptions: { padding: compact ? 32 : 64, maxZoom: compact ? 10 : 12, duration: 0 }, attributionControl: false, fadeDuration: 0, refreshExpiredTiles: false,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      const resize = () => map.resize();
      observer = new ResizeObserver(resize); observer.observe(node.current); requestAnimationFrame(resize);
      map.once("style.load", () => {
        if (disposed) return;
      const features = days.flatMap((day) => day.segments.map((segment) => {
        const found = routeForSegment(segment.id);
        const from = placeFor(day, segment.from)?.coordinates;
        const to = placeFor(day, segment.to)?.coordinates;
        const coordinates = found?.geometry.coordinates ?? (from && to ? [from, to] : []);
        return coordinates.length >= 2 ? { type: "Feature" as const, properties: { id: segment.id, mode: segment.mode, verified: Boolean(segment.verified && found) }, geometry: { type: "LineString" as const, coordinates } } : null;
      }).filter(Boolean));
      map.addSource("routes", { type: "geojson", data: { type: "FeatureCollection", features } });
      (Object.keys(styles) as TravelMode[]).forEach((mode) => {
        const style = styles[mode];
        map.addLayer({ id: `route-${mode}-glow`, type: "line", source: "routes", filter: ["==", ["get", "mode"], mode], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": style.color, "line-width": 8, "line-opacity": 0.16 } });
        map.addLayer({ id: `route-${mode}-verified`, type: "line", source: "routes", filter: ["all", ["==", ["get", "mode"], mode], ["==", ["get", "verified"], true]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": style.color, "line-width": 3.5, ...(style.dash ? { "line-dasharray": style.dash } : {}) } });
        map.addLayer({ id: `route-${mode}-unverified`, type: "line", source: "routes", filter: ["all", ["==", ["get", "mode"], mode], ["==", ["get", "verified"], false]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#6f7d85", "line-width": 3, "line-dasharray": [1.1, 1.1] } });
      });
      days.forEach((day) => day.places.forEach((place, index) => {
        const el = document.createElement("button"); el.className = "map-marker"; el.type = "button"; el.innerHTML = `<span>${index + 1}</span><strong>${place.localName || place.name}</strong><small>${place.name}</small>`;
        el.addEventListener("click", () => window.open(navigationUrl(place), "_blank", "noopener,noreferrer"));
        new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(place.coordinates).addTo(map);
      }));
        requestAnimationFrame(() => { map.resize(); setReady(true); });
      });
    }).catch((error: unknown) => console.error("[Map] runtime initialization failed", error));
    return () => { disposed = true; observer?.disconnect(); map?.remove(); mapRef.current = null; };
  }, [days, compact]);

  const visiblePlaces = days.flatMap((day) => day.places).slice(0, compact ? 2 : 4);
  return <section className={`travel-map ${compact ? "is-compact" : ""}`} aria-label="行程地图">
    <div className="travel-map-canvas" ref={node} />
    {!ready && <div className="map-loading">正在加载地图与本地路线…</div>}
    <div className="map-caption"><strong>路线地图</strong><span>真实路网显示为实线；虚线仅为未验证示意。</span></div>
    {warningSegments.length > 0 && <div className="map-warning">路线未验证，仅供示意</div>}
    <div className="map-links">{visiblePlaces.map((place) => <a key={place.id} href={navigationUrl(place)} target="_blank" rel="noreferrer"><NavigationArrow weight="fill" />{place.name}</a>)}</div>
    <div className="map-legend">{[...new Set(days.flatMap((day) => day.segments.map((segment) => segment.mode)))].map((mode) => <span key={mode}>{modeLabels[mode]}</span>)}</div>
  </section>;
}
