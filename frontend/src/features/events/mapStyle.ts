/**
 * MapTiler Cloud styles for MapLibre GL JS.
 *
 * Official map IDs (see MapTiler Maps / SDK MAP_STYLE_CONFIG):
 * - Dark:  streets-v4-dark
 * - Light: streets-v4
 *
 * @see https://docs.maptiler.com/maplibre/
 * @see https://docs.maptiler.com/cloud/api/maps/
 */

const STYLE_BY_THEME = {
  dark: 'streets-v4-dark',
  light: 'streets-v4',
} as const;

export function getMapTilerApiKey(): string | null {
  const key = import.meta.env.VITE_MAPTILER_API_KEY;
  if (typeof key !== 'string') return null;
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Style URL for the given theme, or null if the API key is missing. */
export function eventsMapStyle(theme: 'light' | 'dark'): string | null {
  const key = getMapTilerApiKey();
  if (!key) return null;
  const mapId = STYLE_BY_THEME[theme];
  return `https://api.maptiler.com/maps/${mapId}/style.json?key=${encodeURIComponent(key)}`;
}
