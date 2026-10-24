import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Map as MapLibreMap,
  NavigationControl,
  LngLatBounds,
  type MapLayerMouseEvent,
  type MapOptions,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '../../hooks/useTheme';
import type { SiteEvent } from '../../lib/types';
import { eventLngLat, hasCoordinates } from './geocode';
import {
  buildEventsGeoJson,
  ensureEventsLayers,
  LAYER_CLUSTER_COUNT,
  LAYER_CLUSTERS,
  LAYER_UNCLUSTERED,
  recreateEventsLayers,
  removeEventsLayers,
  UNCLUSTER_FOCUS_ZOOM,
  whenStyleReady,
  zoomToCluster,
} from './eventsMapClusters';
import { ensureMapLibreWorker } from './maplibreSetup';
import { eventsMapStyle, getMapTilerApiKey } from './mapStyle';
import './EventsMap.css';

interface EventsMapProps {
  events: SiteEvent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  formatDate: (date: string) => string;
  emptyLabel: string;
  closeLabel: string;
  upcomingLabel: string;
  pastLabel: string;
  today: string;
}

type MapFault = 'missing_key' | 'webgl' | 'style' | 'tiles' | null;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function EventsMap({
  events,
  selectedId,
  onSelect,
  formatDate,
  emptyLabel,
  closeLabel,
  upcomingLabel,
  pastLabel,
  today,
}: EventsMapProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  /** pinsKey of the last successful dataset fit (initial load or filter change). */
  const fittedKeyRef = useRef('');
  const themeRef = useRef(theme);
  const mappedRef = useRef<SiteEvent[]>([]);
  const todayRef = useRef(today);
  const selectedIdRef = useRef(selectedId);
  const unbindInteractionsRef = useRef<(() => void) | null>(null);
  /** Bumps on every setStyle so stale style.load/idle callbacks no-op. */
  const styleGenRef = useRef(0);
  const cancelStyleWaitRef = useRef<(() => void) | null>(null);
  /** Separate from style-swap waits so data sync never cancels theme/mount restore. */
  const cancelDataWaitRef = useRef<(() => void) | null>(null);
  const [fault, setFault] = useState<MapFault>(() =>
    getMapTilerApiKey() ? null : 'missing_key'
  );
  onSelectRef.current = onSelect;

  const mapped = useMemo(() => events.filter(hasCoordinates), [events]);
  mappedRef.current = mapped;
  todayRef.current = today;
  selectedIdRef.current = selectedId;

  const pinsKey = useMemo(
    () =>
      mapped
        .map((e) => {
          const ll = eventLngLat(e);
          return `${e.id}:${ll?.[0]}:${ll?.[1]}:${e.status}:${e.event_date}`;
        })
        .join('|'),
    [mapped]
  );
  const selected = events.find((e) => e.id === selectedId) ?? null;
  const canInitMap = fault !== 'missing_key' && fault !== 'webgl';

  const currentGeoJson = () =>
    buildEventsGeoJson(mappedRef.current, todayRef.current, selectedIdRef.current);

  const bindLayerInteractions = (map: MapLibreMap) => {
    unbindInteractionsRef.current?.();

    const onClusterClick = (e: MapLayerMouseEvent) => {
      e.originalEvent.stopPropagation();
      void zoomToCluster(map, e);
    };

    const onPointClick = (e: MapLayerMouseEvent) => {
      e.originalEvent.stopPropagation();
      const eventId = e.features?.[0]?.properties?.eventId;
      if (typeof eventId === 'string' && eventId) {
        onSelectRef.current(eventId);
      }
    };

    const setPointer = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const clearPointer = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', LAYER_CLUSTERS, onClusterClick);
    map.on('click', LAYER_CLUSTER_COUNT, onClusterClick);
    map.on('click', LAYER_UNCLUSTERED, onPointClick);
    map.on('mouseenter', LAYER_CLUSTERS, setPointer);
    map.on('mouseleave', LAYER_CLUSTERS, clearPointer);
    map.on('mouseenter', LAYER_CLUSTER_COUNT, setPointer);
    map.on('mouseleave', LAYER_CLUSTER_COUNT, clearPointer);
    map.on('mouseenter', LAYER_UNCLUSTERED, setPointer);
    map.on('mouseleave', LAYER_UNCLUSTERED, clearPointer);

    const unbind = () => {
      map.off('click', LAYER_CLUSTERS, onClusterClick);
      map.off('click', LAYER_CLUSTER_COUNT, onClusterClick);
      map.off('click', LAYER_UNCLUSTERED, onPointClick);
      map.off('mouseenter', LAYER_CLUSTERS, setPointer);
      map.off('mouseleave', LAYER_CLUSTERS, clearPointer);
      map.off('mouseenter', LAYER_CLUSTER_COUNT, setPointer);
      map.off('mouseleave', LAYER_CLUSTER_COUNT, clearPointer);
      map.off('mouseenter', LAYER_UNCLUSTERED, setPointer);
      map.off('mouseleave', LAYER_UNCLUSTERED, clearPointer);
    };
    unbindInteractionsRef.current = unbind;
    return unbind;
  };

  /** Restore clusters after style replacement (forced recreate). Does not move the camera. */
  const restoreAfterStyleChange = (map: MapLibreMap, nextTheme: 'light' | 'dark') => {
    const ok = recreateEventsLayers(map, nextTheme, currentGeoJson());
    if (!ok) return false;
    bindLayerInteractions(map);
    map.resize();
    return true;
  };

  /** Fit viewport once per pinsKey (initial open + filter changes; not theme). */
  const fitCameraToEvents = (map: MapLibreMap, items: SiteEvent[]) => {
    if (items.length === 0) return false;

    const mobile =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    const padding = mobile
      ? { top: 56, bottom: 56, left: 36, right: 36 }
      : { top: 80, bottom: 80, left: 72, right: 72 };

    if (items.length === 1) {
      const only = eventLngLat(items[0]);
      if (!only) return false;
      map.flyTo({
        center: only,
        zoom: 9,
        essential: true,
        duration: 700,
      });
      return true;
    }

    const bounds = new LngLatBounds();
    for (const event of items) {
      const ll = eventLngLat(event);
      if (ll) bounds.extend(ll);
    }
    if (bounds.isEmpty()) return false;

    map.fitBounds(bounds, {
      padding,
      maxZoom: 11,
      duration: 750,
      essential: true,
    });
    return true;
  };

  // Create / destroy map once
  useEffect(() => {
    if (!getMapTilerApiKey()) {
      setFault('missing_key');
      return;
    }
    if (!supportsWebGL()) {
      setFault('webgl');
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const styleUrl = eventsMapStyle(themeRef.current);
    if (!styleUrl) {
      setFault('missing_key');
      return;
    }

    let cancelled = false;
    let resizeId = 0;
    let map: MapLibreMap;
    const genAtMount = styleGenRef.current;

    try {
      ensureMapLibreWorker();
      const options: MapOptions = {
        container: el,
        style: styleUrl,
        center: [-73.57, 45.5],
        zoom: 3.2,
        attributionControl: { compact: true },
      };
      map = new MapLibreMap(options);
    } catch (err) {
      console.error('[EventsMap] failed to create MapLibre map', err);
      setFault('webgl');
      return;
    }

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    setFault(null);

    const cancelWait = whenStyleReady(
      map,
      () => {
        if (cancelled || styleGenRef.current !== genAtMount) return;
        restoreAfterStyleChange(map, themeRef.current);
      },
      () => !cancelled && styleGenRef.current === genAtMount
    );
    cancelStyleWaitRef.current = cancelWait;

    const onError = (e: { error?: Error & { status?: number; url?: string } }) => {
      if (cancelled) return;
      const status = e.error?.status;
      const message = e.error?.message ?? '';
      console.error('[EventsMap] map error', e.error ?? e);
      if (status === 401 || status === 403 || /unauthorized|forbidden|api.?key/i.test(message)) {
        setFault('style');
        return;
      }
      if (/style|tile|source/i.test(message) || (typeof status === 'number' && status >= 400)) {
        setFault((prev) => (prev === 'missing_key' || prev === 'webgl' ? prev : 'tiles'));
      }
    };

    map.on('error', onError);
    resizeId = window.setTimeout(() => {
      if (!cancelled) map.resize();
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(resizeId);
      cancelStyleWaitRef.current?.();
      cancelStyleWaitRef.current = null;
      cancelDataWaitRef.current?.();
      cancelDataWaitRef.current = null;
      map.off('error', onError);
      unbindInteractionsRef.current?.();
      unbindInteractionsRef.current = null;
      removeEventsLayers(map);
      map.remove();
      mapRef.current = null;
    };
    // mount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme → MapTiler style; recreate event layers when the new style is ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !canInitMap) return;
    if (themeRef.current === theme) return;

    const styleUrl = eventsMapStyle(theme);
    if (!styleUrl) {
      setFault('missing_key');
      return;
    }

    themeRef.current = theme;
    const gen = ++styleGenRef.current;

    cancelStyleWaitRef.current?.();
    // setStyle drops all custom sources/layers
    map.setStyle(styleUrl);

    cancelStyleWaitRef.current = whenStyleReady(
      map,
      () => {
        if (styleGenRef.current !== gen) return;
        const ok = restoreAfterStyleChange(map, theme);
        if (!ok) {
          map.once('idle', () => {
            if (styleGenRef.current !== gen) return;
            restoreAfterStyleChange(map, theme);
          });
        }
        setFault((prev) => (prev === 'tiles' || prev === 'style' ? null : prev));
      },
      () => styleGenRef.current === gen,
      { waitForStyleLoad: true }
    );

    return () => {
      // If theme flips again before ready, the next effect bumps gen and cancels.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, canInitMap]);

  // Sync GeoJSON + camera with filtered events / selection (no forced recreate)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !canInitMap) return;

    const sync = () => {
      // Skip while a style swap is in flight — restoreAfterStyleChange owns that path.
      if (!map.isStyleLoaded()) return;

      map.resize();
      ensureEventsLayers(map, themeRef.current, currentGeoJson());

      if (mapped.length === 0) {
        // Keep fallback viewport; empty overlay is handled in render.
        fittedKeyRef.current = '';
        return;
      }

      // Explicit selection always wins (list click / marker click).
      if (selectedId) {
        const focus = mapped.find((e) => e.id === selectedId);
        const focusLl = focus ? eventLngLat(focus) : null;
        if (focusLl) {
          map.flyTo({
            center: focusLl,
            zoom: Math.max(map.getZoom(), UNCLUSTER_FOCUS_ZOOM),
            essential: true,
            duration: 800,
          });
          return;
        }
      }

      // Fit once per visible pin set (initial open + filter changes). Skips re-renders
      // and does not run on theme change (pinsKey unchanged).
      if (fittedKeyRef.current === pinsKey) return;
      fittedKeyRef.current = pinsKey;
      fitCameraToEvents(map, mapped);
    };

    if (map.isStyleLoaded()) {
      sync();
      return;
    }

    const gen = styleGenRef.current;
    cancelDataWaitRef.current?.();
    cancelDataWaitRef.current = whenStyleReady(
      map,
      () => {
        if (styleGenRef.current !== gen) return;
        if (!map.getSource('standottori-events')) {
          restoreAfterStyleChange(map, themeRef.current);
        }
        // Always sync after restore so the initial fitBounds/flyTo runs.
        sync();
      },
      () => styleGenRef.current === gen
    );

    return () => {
      cancelDataWaitRef.current?.();
      cancelDataWaitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapped, pinsKey, selectedId, today, canInitMap]);

  const hardFault = fault === 'missing_key' || fault === 'webgl';
  const faultMessage =
    fault === 'missing_key'
      ? t('events.map_error_missing_key')
      : fault === 'webgl'
        ? t('events.map_error_webgl')
        : fault === 'style'
          ? t('events.map_error_style')
          : fault === 'tiles'
            ? t('events.map_error_tiles')
            : null;

  // Canvas markers are not keyboard-operable; list buttons remain the keyboard path.
  // Escape clears the selected card without trapping focus on the WebGL canvas.
  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }
      onSelectRef.current(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  return (
    <div
      className="events-map"
      role="region"
      aria-label={t('events.map_region_label')}
    >
      {canInitMap && (
        <div
          ref={containerRef}
          className="events-map__canvas"
          aria-hidden="true"
        />
      )}

      {faultMessage && (
        <div
          className={`events-map__fault${hardFault ? '' : ' is-soft'}`}
          role="alert"
        >
          <p>{faultMessage}</p>
        </div>
      )}

      {!hardFault && !faultMessage && mapped.length === 0 && (
        <div className="events-map__empty" aria-live="polite">
          {emptyLabel}
        </div>
      )}

      {selected && hasCoordinates(selected) && !hardFault && (
        <article className="events-map__card" aria-live="polite">
          <button
            type="button"
            className="events-map__card-close"
            onClick={() => onSelect(null)}
            aria-label={closeLabel}
          >
            <i className="pi pi-times" aria-hidden="true" />
          </button>
          <p className="events-map__card-kicker">
            {selected.event_date < today || selected.status === 'past'
              ? pastLabel
              : upcomingLabel}
          </p>
          <h3 className="events-map__card-title">{selected.title}</h3>
          <p className="events-map__card-meta">
            <time dateTime={selected.event_date}>{formatDate(selected.event_date)}</time>
            {selected.location ? ` · ${selected.location}` : ''}
          </p>
          {selected.description && (
            <p className="events-map__card-desc">{selected.description}</p>
          )}
        </article>
      )}
    </div>
  );
}
