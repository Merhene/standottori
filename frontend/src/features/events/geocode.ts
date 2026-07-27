export interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
}

interface NominatimItem {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Free OpenStreetMap Nominatim search (1 req/s courtesy).
 * Used from the admin to fill lat/lng from a city / place string.
 */
export async function searchPlaces(
  query: string,
  lang: 'fr' | 'en' = 'fr'
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '0');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang === 'fr' ? 'fr' : 'en',
    },
  });

  if (!res.ok) throw new Error(`Geocode failed (${res.status})`);

  const data = (await res.json()) as NominatimItem[];
  return data.map((item) => ({
    label: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));
}

/** Coerce PostgREST / JSON numeric strings into finite numbers */
export function toCoord(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function hasCoordinates(event: {
  latitude: unknown;
  longitude: unknown;
}): boolean {
  return toCoord(event.latitude) != null && toCoord(event.longitude) != null;
}

export function eventLngLat(event: {
  latitude: unknown;
  longitude: unknown;
}): [number, number] | null {
  const lat = toCoord(event.latitude);
  const lng = toCoord(event.longitude);
  if (lat == null || lng == null) return null;
  return [lng, lat];
}
