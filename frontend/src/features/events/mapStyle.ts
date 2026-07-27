import type { StyleSpecification } from 'maplibre-gl';

/** Raster basemaps (CARTO) — no API key, reliable tile loading */
export function eventsMapStyle(theme: 'light' | 'dark'): StyleSpecification {
  const tiles =
    theme === 'dark'
      ? [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        ]
      : [
          'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        ];

  return {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles,
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    },
    layers: [
      {
        id: 'carto',
        type: 'raster',
        source: 'carto',
      },
    ],
  };
}
