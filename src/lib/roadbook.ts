import rawFacts from "../../content/facts.json";
import rawMedia from "../../content/media-manifest.json";
import rawRoadbook from "../../content/roadbook.json";
import rawRoutesText from "../../content/routes.geojson?raw";

export type Scene = "flight" | "driving" | "walking" | "rail" | "ferry" | "sunset" | "nature" | "city" | "static";
export type TravelMode = "flight" | "driving" | "walking" | "rail" | "ferry";
export type NavigationProvider = "auto" | "naver" | "amap" | "google";
export type Coordinates = [number, number];

export type Place = {
  id: string;
  name: string;
  localName?: string;
  coordinates: Coordinates;
  navigationQuery: string;
  navigationProvider?: NavigationProvider;
};

export type Segment = {
  id: string;
  from: string;
  to: string;
  mode: TravelMode;
  verified: boolean;
};

export type Stop = { time: string; name: string; note: string; placeId?: string };
export type Meal = { label: string; strategy: string; options: { name: string; note?: string }[] };
export type Day = {
  id: string;
  date: string;
  label: string;
  title: string;
  subtitle?: string;
  theme?: string;
  scene: Scene;
  image: string;
  wake?: { time: string; preparationMinutes: number; timezone?: string };
  anchor?: string;
  alerts?: string[];
  stops: Stop[];
  places: Place[];
  segments: Segment[];
  meals?: Meal[];
};

export type Roadbook = {
  schemaVersion: "1.0";
  meta: {
    slug: string;
    title: string;
    destination: string;
    countryCode: string;
    timezone: string;
    locale?: string;
    dateRange?: string;
    routeLabel?: string;
    description?: string;
    theme: { accent: string; ink: string; mist: string; heroImage: string };
  };
  days: Day[];
  guide: { checks?: string[]; notes?: string[] };
};

export type RouteFeature = {
  type: "Feature";
  properties: { id: string; dayId?: string; mode?: TravelMode; verified?: boolean };
  geometry: { type: "LineString"; coordinates: Coordinates[] };
};

export const roadbook = rawRoadbook as unknown as Roadbook;
const rawRoutes = JSON.parse(rawRoutesText) as { features?: RouteFeature[] };
export const routeFeatures = rawRoutes.features ?? [];
export const facts = rawFacts as { needsRecheck?: boolean; records?: { id: string; claim: string; status: string; source?: string }[] };
export const mediaManifest = rawMedia as { assets?: { path: string; role: string; tool?: string; format?: string }[] };

export const dayById = (id?: string) => roadbook.days.find((day) => day.id === id);
export const routeForSegment = (id: string) => routeFeatures.find((feature) => feature.properties.id === id);
export const placeFor = (day: Day, id: string) => day.places.find((place) => place.id === id);

export function dayForDate(date: string) {
  return roadbook.days.find((day) => day.date === date);
}

export function dateInTripTimezone(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: roadbook.meta.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (kind: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === kind)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function todayOrNearestDay() {
  const today = dayForDate(dateInTripTimezone());
  if (today) return today;
  const now = dateInTripTimezone();
  return roadbook.days.find((day) => day.date >= now) ?? roadbook.days.at(-1) ?? roadbook.days[0];
}

export function displayDate(date: string) {
  return new Intl.DateTimeFormat(roadbook.meta.locale ?? "zh-CN", {
    timeZone: roadbook.meta.timezone,
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

export const sceneLabels: Record<Scene, string> = {
  flight: "航线",
  driving: "公路",
  walking: "步行",
  rail: "铁路",
  ferry: "轮渡",
  sunset: "落日",
  nature: "自然",
  city: "城市",
  static: "行程",
};

export const modeLabels: Record<TravelMode, string> = {
  flight: "航线",
  driving: "驾车",
  walking: "步行",
  rail: "铁路",
  ferry: "轮渡",
};
