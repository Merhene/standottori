import { useEffect, useRef } from 'react';
import type { BodyPart } from './parts';

interface HitCanvas {
  id: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

/**
 * Alpha-aware hit testing for stacked body-part cutouts.
 * Parts are painted into offscreen canvases at natural resolution;
 * pointer coords are mapped into that space via the displayed image box.
 */
export function usePartHitTest(parts: BodyPart[]) {
  const caches = useRef<HitCanvas[]>([]);
  const ready = useRef(false);

  useEffect(() => {
    let cancelled = false;
    ready.current = false;
    caches.current = [];

    Promise.all(
      parts.map(
        (part) =>
          new Promise<HitCanvas | null>((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              if (!ctx) {
                resolve(null);
                return;
              }
              ctx.drawImage(img, 0, 0);
              resolve({ id: part.id, canvas, ctx });
            };
            img.onerror = () => resolve(null);
            img.src = part.src;
          })
      )
    ).then((loaded) => {
      if (cancelled) return;
      caches.current = loaded.filter((c): c is HitCanvas => c !== null);
      ready.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [parts]);

  const hitTest = (
    clientX: number,
    clientY: number,
    displayRect: DOMRect
  ): string | null => {
    if (!ready.current || caches.current.length === 0) return null;
    if (displayRect.width <= 0 || displayRect.height <= 0) return null;

    const sample = caches.current[0];
    const natW = sample.canvas.width;
    const natH = sample.canvas.height;
    const scale = Math.min(displayRect.width / natW, displayRect.height / natH);
    const drawW = natW * scale;
    const drawH = natH * scale;
    const offsetX = displayRect.left + (displayRect.width - drawW) / 2;
    const offsetY = displayRect.top + (displayRect.height - drawH) / 2;

    const x = Math.floor((clientX - offsetX) / scale);
    const y = Math.floor((clientY - offsetY) / scale);
    if (x < 0 || y < 0 || x >= natW || y >= natH) return null;

    // Top-most part wins (registry order = paint order; reverse for hit)
    for (let i = caches.current.length - 1; i >= 0; i--) {
      const { id, ctx } = caches.current[i];
      const alpha = ctx.getImageData(x, y, 1, 1).data[3];
      if (alpha > 16) return id;
    }
    return null;
  };

  return { hitTest };
}
