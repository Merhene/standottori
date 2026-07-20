import { useEffect, useMemo, useRef } from 'react';

interface ScrollMarqueeProps {
  images: string[];
  /** Direction the row slides towards when scrolling down */
  direction: 'left' | 'right';
  /** Square size in px */
  size?: number;
  /** Gap between squares in px */
  gap?: number;
  /** Horizontal px travelled per px of page scroll */
  speed?: number;
}

/**
 * Infinite scroll-driven marquee: a row of square images whose horizontal
 * position is bound to the page scroll. The image sequence is duplicated and
 * the offset wraps modulo half the track width, so it loops seamlessly.
 */
export default function ScrollMarquee({
  images,
  direction,
  size = 96,
  gap = 16,
  speed = 0.25,
}: ScrollMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Repeat the sequence until one half of the track is wider than any viewport
  const sequence = useMemo(() => {
    const itemWidth = size + gap;
    const repeats = Math.max(2, Math.ceil(2600 / (itemWidth * images.length)));
    return Array.from({ length: repeats }, () => images).flat();
  }, [images, size, gap]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      const offset = (window.scrollY * speed) % half;
      const x = direction === 'left' ? -offset : offset - half;
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    };
    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [direction, speed]);

  return (
    <div aria-hidden="true" className="w-full overflow-hidden">
      <div ref={trackRef} className="flex w-max will-change-transform">
        {[...sequence, ...sequence].map((src, index) => (
          <img
            key={index}
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            className="shrink-0 rounded-md object-cover select-none"
            style={{ width: size, height: size, marginRight: gap }}
          />
        ))}
      </div>
    </div>
  );
}
