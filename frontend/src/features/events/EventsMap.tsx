import { useEffect, useMemo, useRef } from 'react';
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  LngLatBounds,
  type MapOptions,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '../../hooks/useTheme';
import type { SiteEvent } from '../../lib/types';
import { eventLngLat, hasCoordinates } from './geocode';
import { eventsMapStyle } from './mapStyle';
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

interface MarkerEntry {
  marker: Marker;
  pin: HTMLButtonElement;
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
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new globalThis.Map<string, MarkerEntry>());
  const onSelectRef = useRef(onSelect);
  const fittedKeyRef = useRef('');
  const themeRef = useRef(theme);
  onSelectRef.current = onSelect;

  const mapped = useMemo(() => events.filter(hasCoordinates), [events]);
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

  // Create / destroy map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const options: MapOptions = {
      container: el,
      style: eventsMapStyle(themeRef.current),
      center: [-73.57, 45.5],
      zoom: 3.2,
      attributionControl: { compact: true },
    };
    const map = new MapLibreMap(options);
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    const onLoad = () => {
      map.resize();
    };
    map.on('load', onLoad);

    // Layout can settle after first paint (sticky header / flex) — force a resize
    const resizeId = window.setTimeout(() => map.resize(), 80);

    return () => {
      window.clearTimeout(resizeId);
      map.off('load', onLoad);
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Theme → basemap style (skip the mount pass — map already has the right style)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (themeRef.current === theme) return;
    themeRef.current = theme;
    map.setStyle(eventsMapStyle(theme));
    map.once('load', () => map.resize());
  }, [theme]);

  // Sync markers + camera
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = () => {
      map.resize();
      const nextIds = new Set(mapped.map((e) => e.id));

      markersRef.current.forEach((entry, id) => {
        if (!nextIds.has(id)) {
          entry.marker.remove();
          markersRef.current.delete(id);
        }
      });

      for (const event of mapped) {
        const lngLat = eventLngLat(event);
        if (!lngLat) continue;

        const isPast = event.event_date < today || event.status === 'past';
        const isActive = event.id === selectedId;
        let entry = markersRef.current.get(event.id);

        if (!entry) {
          const pin = document.createElement('button');
          pin.type = 'button';
          pin.className = 'events-map__pin';
          pin.setAttribute('aria-label', event.title);

          const marker = new Marker({ element: pin, anchor: 'center' })
            .setLngLat(lngLat)
            .addTo(map);

          pin.addEventListener('click', (ev) => {
            ev.stopPropagation();
            onSelectRef.current(event.id);
          });

          entry = { marker, pin };
          markersRef.current.set(event.id, entry);
        } else {
          entry.marker.setLngLat(lngLat);
        }

        entry.pin.classList.toggle('is-active', isActive);
        entry.pin.classList.toggle('is-past', isPast);
      }

      if (mapped.length === 0) {
        fittedKeyRef.current = '';
        return;
      }

      if (selectedId) {
        const focus = mapped.find((e) => e.id === selectedId);
        const focusLl = focus ? eventLngLat(focus) : null;
        if (focusLl) {
          map.flyTo({
            center: focusLl,
            zoom: Math.max(map.getZoom(), 5.5),
            essential: true,
            duration: 800,
          });
          return;
        }
      }

      // Fit all pins only when the set of coordinates changes (not on every select clear)
      if (fittedKeyRef.current === pinsKey) return;
      fittedKeyRef.current = pinsKey;

      if (mapped.length === 1) {
        const only = eventLngLat(mapped[0]);
        if (!only) return;
        map.flyTo({
          center: only,
          zoom: 5,
          essential: true,
          duration: 600,
        });
        return;
      }

      const bounds = new LngLatBounds();
      mapped.forEach((e) => {
        const ll = eventLngLat(e);
        if (ll) bounds.extend(ll);
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 64, maxZoom: 6, duration: 700 });
      }
    };

    if (map.loaded()) sync();
    else map.once('load', sync);
  }, [mapped, pinsKey, selectedId, today]);

  return (
    <div className="events-map" role="region" aria-label="Carte des événements">
      <div ref={containerRef} className="events-map__canvas" />

      {mapped.length === 0 && (
        <div className="events-map__empty" aria-live="polite">
          {emptyLabel}
        </div>
      )}

      {selected && hasCoordinates(selected) && (
        <article className="events-map__card">
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
