import type { NavigationProvider, Place } from "./roadbook";
import { roadbook } from "./roadbook";

export function navigationProvider(place: Place): Exclude<NavigationProvider, "auto"> {
  if (place.navigationProvider && place.navigationProvider !== "auto") return place.navigationProvider;
  if (roadbook.meta.countryCode === "KR") return "naver";
  if (roadbook.meta.countryCode === "CN") return "amap";
  return "google";
}

export function navigationUrl(place: Place) {
  const query = encodeURIComponent(place.navigationQuery || place.name);
  const [lng, lat] = place.coordinates;
  switch (navigationProvider(place)) {
    case "naver": return `https://map.naver.com/p/search/${query}`;
    case "amap": return `https://uri.amap.com/search?keyword=${query}&src=ai-travel-roadbook`;
    default: return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
}
