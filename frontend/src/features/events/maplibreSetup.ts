import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

/**
 * MapLibre GL JS v6 loads vector tiles in a dedicated worker module.
 * Vite must resolve that worker via `?worker&url` + setWorkerUrl, otherwise
 * styles load but no .mvt requests fire and the canvas stays blank/black.
 *
 * @see https://www.maplibre.org/maplibre-gl-js/docs/
 */
let configured = false;

export function ensureMapLibreWorker(): void {
  if (configured || typeof window === 'undefined') return;
  setWorkerUrl(workerUrl);
  configured = true;
}
