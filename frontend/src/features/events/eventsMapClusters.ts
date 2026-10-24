import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapLayerMouseEvent,
} from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';
import type { SiteEvent } from '../../lib/types';
import { eventLngLat } from './geocode';

export const EVENTS_SOURCE = 'standottori-events';
export const LAYER_CLUSTERS = 'standottori-events-clusters';
export const LAYER_CLUSTER_COUNT = 'standottori-events-cluster-count';
export const LAYER_UNCLUSTERED = 'standottori-events-unclustered';

export const CLUSTER_MAX_ZOOM = 12;
export const CLUSTER_RADIUS = 50;
/** Zoom high enough that a selected pin leaves its cluster */
export const UNCLUSTER_FOCUS_ZOOM = CLUSTER_MAX_ZOOM + 1;

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

export function buildEventsGeoJson(
  events: SiteEvent[],
  today: string,
  selectedId: string | null
): FeatureCollection {
  const features: FeatureCollection['features'] = [];
  const seen = new Set<string>();

  for (const event of events) {
    if (seen.has(event.id)) continue;
    const ll = eventLngLat(event);
    if (!ll) continue;
    seen.add(event.id);

    const isPast = event.event_date < today || event.status === 'past';
    features.push({
      type: 'Feature',
      id: features.length + 1,
      geometry: { type: 'Point', coordinates: ll },
      properties: {
        eventId: event.id,
        title: event.title,
        isPast: isPast ? 1 : 0,
        selected: event.id === selectedId ? 1 : 0,
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

function palette(theme: 'light' | 'dark') {
  return theme === 'light'
    ? { pin: '#9b0e2e', ring: '#171617' }
    : { pin: '#c4123a', ring: '#f0eeec' };
}

export function removeEventsLayers(map: MapLibreMap): void {
  for (const id of [LAYER_CLUSTER_COUNT, LAYER_UNCLUSTERED, LAYER_CLUSTERS]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource(EVENTS_SOURCE)) map.removeSource(EVENTS_SOURCE);
}

function addEventsSourceAndLayers(
  map: MapLibreMap,
  theme: 'light' | 'dark',
  data: FeatureCollection
): void {
  const { pin, ring } = palette(theme);

  map.addSource(EVENTS_SOURCE, {
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
    clusterRadius: CLUSTER_RADIUS,
  });

  map.addLayer({
    id: LAYER_CLUSTERS,
    type: 'circle',
    source: EVENTS_SOURCE,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': pin,
      'circle-radius': ['step', ['get', 'point_count'], 18, 5, 22, 15, 28],
      'circle-stroke-width': 2.5,
      'circle-stroke-color': ring,
      'circle-opacity': 0.95,
    },
  });

  map.addLayer({
    id: LAYER_CLUSTER_COUNT,
    type: 'symbol',
    source: EVENTS_SOURCE,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count'],
      'text-font': ['Roboto Bold', 'Noto Sans Bold'],
      'text-size': 13,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: {
      'text-color': '#ffffff',
    },
  });

  map.addLayer({
    id: LAYER_UNCLUSTERED,
    type: 'circle',
    source: EVENTS_SOURCE,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': pin,
      'circle-radius': ['case', ['==', ['get', 'selected'], 1], 12, 8],
      'circle-stroke-width': 2,
      'circle-stroke-color': ring,
      'circle-opacity': ['case', ['==', ['get', 'isPast'], 1], 0.55, 1],
    },
  });
}

/**
 * Idempotent sync: update data/paint if source exists; otherwise create source + layers.
 * Returns false if the style is not ready yet (caller should retry).
 */
export function ensureEventsLayers(
  map: MapLibreMap,
  theme: 'light' | 'dark',
  data: FeatureCollection = EMPTY
): boolean {
  if (!map.getStyle() || !map.isStyleLoaded()) return false;

  const { pin, ring } = palette(theme);
  const existing = map.getSource(EVENTS_SOURCE) as GeoJSONSource | undefined;

  if (existing) {
    const layersOk =
      !!map.getLayer(LAYER_CLUSTERS) &&
      !!map.getLayer(LAYER_CLUSTER_COUNT) &&
      !!map.getLayer(LAYER_UNCLUSTERED);

    if (!layersOk) {
      removeEventsLayers(map);
      addEventsSourceAndLayers(map, theme, data);
      return true;
    }

    existing.setData(data);
    map.setPaintProperty(LAYER_CLUSTERS, 'circle-color', pin);
    map.setPaintProperty(LAYER_CLUSTERS, 'circle-stroke-color', ring);
    map.setPaintProperty(LAYER_UNCLUSTERED, 'circle-color', pin);
    map.setPaintProperty(LAYER_UNCLUSTERED, 'circle-stroke-color', ring);
    map.setPaintProperty(LAYER_CLUSTER_COUNT, 'text-color', '#ffffff');
    return true;
  }

  addEventsSourceAndLayers(map, theme, data);
  return true;
}

/**
 * After setStyle(), custom sources are wiped. Force a clean recreate once the
 * style graph is ready — do not trust leftover getSource() state.
 */
export function recreateEventsLayers(
  map: MapLibreMap,
  theme: 'light' | 'dark',
  data: FeatureCollection = EMPTY
): boolean {
  if (!map.getStyle() || !map.isStyleLoaded()) return false;
  removeEventsLayers(map);
  addEventsSourceAndLayers(map, theme, data);
  return true;
}

/**
 * Run `fn` when the style is ready for addSource/addLayer.
 *
 * Pass `waitForStyleLoad: true` after `map.setStyle()` — immediately after that
 * call, `isStyleLoaded()` can still report true for the previous style.
 */
export function whenStyleReady(
  map: MapLibreMap,
  fn: () => void,
  isCurrent: () => boolean = () => true,
  options?: { waitForStyleLoad?: boolean }
): () => void {
  let cancelled = false;
  let attempts = 0;

  const run = () => {
    if (cancelled || !isCurrent()) return;
    if (map.getStyle() && map.isStyleLoaded()) {
      fn();
      return;
    }
    attempts += 1;
    if (attempts > 40) {
      console.warn('[EventsMap] style never became ready for event layers');
      return;
    }
    map.once('idle', run);
  };

  const onStyleLoad = () => {
    if (cancelled || !isCurrent()) return;
    run();
  };

  if (options?.waitForStyleLoad) {
    map.once('style.load', onStyleLoad);
  } else if (map.getStyle() && map.isStyleLoaded()) {
    queueMicrotask(run);
  } else {
    map.once('style.load', onStyleLoad);
    map.once('idle', run);
  }

  return () => {
    cancelled = true;
    map.off('style.load', onStyleLoad);
    map.off('idle', run);
  };
}

export async function zoomToCluster(
  map: MapLibreMap,
  event: MapLayerMouseEvent
): Promise<void> {
  const feature = event.features?.[0];
  if (!feature || feature.geometry.type !== 'Point') return;
  const clusterId = Number(feature.properties?.cluster_id);
  if (!Number.isFinite(clusterId)) return;

  const source = map.getSource(EVENTS_SOURCE) as GeoJSONSource | undefined;
  if (!source) return;

  const zoom = await source.getClusterExpansionZoom(clusterId);
  const coordinates = (feature.geometry as Point).coordinates as [number, number];
  map.easeTo({
    center: coordinates,
    zoom,
    duration: 650,
    essential: true,
  });
}
