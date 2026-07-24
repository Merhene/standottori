import { useEffect, useState, useCallback, useRef, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isSupabaseConfigured, publicImageUrl } from '../lib/supabase';
import { listGalleryImages } from '../lib/content';
import type { GalleryCategory, GalleryImage } from '../lib/types';
import type { FlashRequestLocationState } from '../features/contact/flashRequest';
import '../pages/Gallery.css';

interface GalleryLocationState {
  galleryEnter?: boolean;
}

interface GalleryGridProps {
  category: GalleryCategory;
  title: string;
  emptyIcon: string;
  emptyMessage: string;
}

function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'nav' | 'h1';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = Tag as 'div';

  return (
    <Comp
      ref={ref as never}
      className={`gallery-reveal__item ${visible ? 'is-in' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      <div className="gallery-reveal__rise">{children}</div>
    </Comp>
  );
}

function readColumnCount(list: HTMLElement) {
  const columns = getComputedStyle(list).gridTemplateColumns;
  const count = columns.split(/\s+/).filter(Boolean).length;
  return count > 0 ? count : 2;
}

function useTouchFocusMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pointerMq = window.matchMedia('(hover: none), (pointer: coarse)');
    const widthMq = window.matchMedia('(max-width: 1023px)');
    const sync = () => setEnabled(pointerMq.matches || widthMq.matches);
    sync();
    pointerMq.addEventListener('change', sync);
    widthMq.addEventListener('change', sync);
    return () => {
      pointerMq.removeEventListener('change', sync);
      widthMq.removeEventListener('change', sync);
    };
  }, []);

  return enabled;
}

export default function GalleryGrid({ category, title, emptyIcon, emptyMessage }: GalleryGridProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const entered = !!(location.state as GalleryLocationState | null)?.galleryEnter;
  const touchFocus = useTouchFocusMode();
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const isFlash = category === 'flash';

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [askFlashOpen, setAskFlashOpen] = useState(false);
  const [voidOut, setVoidOut] = useState(!entered);
  const [showVoid, setShowVoid] = useState(entered);
  const [focusRow, setFocusRow] = useState(0);
  const [columnCount, setColumnCount] = useState(2);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listGalleryImages(category)
      .then(setImages)
      .catch(() => {
        // Backend unavailable: the empty state is shown instead
      })
      .finally(() => setIsLoading(false));
  }, [category]);

  useEffect(() => {
    if (!entered) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVoidOut(true);
      setShowVoid(false);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    const lift = window.setTimeout(() => setVoidOut(true), 80);
    const clearState = window.setTimeout(() => {
      navigate(location.pathname, { replace: true, state: {} });
    }, 200);
    const unmount = window.setTimeout(() => setShowVoid(false), 950);

    return () => {
      window.clearTimeout(lift);
      window.clearTimeout(clearState);
      window.clearTimeout(unmount);
    };
  }, [entered, location.pathname, navigate]);

  // Mobile/tablet: brighten the grid row closest to the viewport midline
  useEffect(() => {
    if (!touchFocus || images.length === 0) return;

    let frame = 0;

    const updateFocusRow = () => {
      frame = 0;
      const list = listRef.current;
      if (!list) return;

      const cols = readColumnCount(list);
      setColumnCount((prev) => (prev === cols ? prev : cols));

      // Anchor a bit under the header so the first row is bright on land,
      // then each next row takes over as it crosses that line while scrolling.
      const focusY = window.innerHeight * 0.4;
      const first = itemRefs.current[0];

      // Still at the top / first row hasn't scrolled past the focus line yet
      if (first) {
        const firstRect = first.getBoundingClientRect();
        if (firstRect.height >= 2 && firstRect.bottom > focusY) {
          setFocusRow(0);
          return;
        }
      }

      type RowScore = { dist: number; coverage: number };
      const scores = new Map<number, RowScore>();

      for (let index = 0; index < images.length; index++) {
        const el = itemRefs.current[index];
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.height < 2) continue;

        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, window.innerHeight);
        const visibleHeight = visibleBottom - visibleTop;
        if (visibleHeight < 48) continue;

        // Distance from the focus line to this row’s box (clamped into view)
        const rowFocusPoint = Math.min(Math.max(focusY, rect.top), rect.bottom);
        const dist = Math.abs(rowFocusPoint - focusY);
        const coverage =
          Math.max(0, Math.min(rect.bottom, focusY + 80) - Math.max(rect.top, focusY - 80)) /
          160;

        const row = Math.floor(index / cols);
        const prev = scores.get(row);
        const next = { dist, coverage };

        if (!prev) {
          scores.set(row, next);
          continue;
        }

        scores.set(row, {
          dist: Math.min(prev.dist, next.dist),
          coverage: Math.max(prev.coverage, next.coverage),
        });
      }

      if (scores.size === 0) return;

      let bestRow = 0;
      let bestScore = Number.POSITIVE_INFINITY;

      scores.forEach((score, row) => {
        const weighted = score.dist - score.coverage * 40;
        if (weighted < bestScore) {
          bestScore = weighted;
          bestRow = row;
        }
      });

      setFocusRow((prev) => (prev === bestRow ? prev : bestRow));
    };

    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateFocusRow);
    };

    updateFocusRow();
    const imgs = listRef.current?.querySelectorAll('img') ?? [];
    imgs.forEach((img) => img.addEventListener('load', onScrollOrResize));

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      imgs.forEach((img) => img.removeEventListener('load', onScrollOrResize));
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [touchFocus, images.length]);

  const closeLightbox = useCallback(() => {
    setAskFlashOpen(false);
    setLightboxIndex(null);
  }, []);

  const requestFlash = useCallback(() => {
    if (lightboxIndex === null) return;
    const image = images[lightboxIndex];
    if (!image) return;

    const state: FlashRequestLocationState = {
      flash: {
        id: image.id,
        storage_path: image.storage_path,
        title: image.title,
      },
    };
    navigate('/contact', { state });
  }, [images, lightboxIndex, navigate]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (askFlashOpen) {
          setAskFlashOpen(false);
          return;
        }
        closeLightbox();
      }
      if (askFlashOpen) return;
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, images.length, closeLightbox, askFlashOpen]);

  useEffect(() => {
    setAskFlashOpen(false);
  }, [lightboxIndex]);

  return (
    <div className="gallery-grid-page min-h-screen px-4 md:px-8 pb-16 relative">
      {showVoid && (
        <div className={`gallery-reveal__void ${voidOut ? 'is-out' : ''}`} aria-hidden="true" />
      )}

      <Reveal as="nav" className="flex items-center gap-2 pt-4 mb-8 text-sm" delay={40}>
        <Link
          to="/gallery"
          className="inline-flex items-center gap-1.5 no-underline hover:opacity-70 transition-opacity"
        >
          <i className="pi pi-arrow-left text-xs" />
          Galerie
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold">{title}</span>
      </Reveal>

      <Reveal as="h1" className="text-3xl md:text-5xl font-bold uppercase tracking-widest mb-10" delay={120}>
        {title}
      </Reveal>

      {isLoading ? (
        <div className="flex justify-center p-16">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : images.length === 0 ? (
        <Reveal delay={180}>
          <div className="gallery-grid-empty border rounded-lg p-12 text-center max-w-xl mx-auto">
            <i className={`pi ${emptyIcon} text-4xl opacity-30 mb-4`} style={{ display: 'block' }} />
            <p className="opacity-60">{emptyMessage}</p>
          </div>
        </Reveal>
      ) : (
        <ul ref={listRef} className="gallery-grid-list">
          {images.map((image, index) => {
            const row = Math.floor(index / columnCount);
            const isFocusLine = touchFocus && row === focusRow;
            return (
              <li
                key={image.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                data-gallery-index={index}
                className="gallery-grid-item"
              >
                <Reveal delay={(index % 8) * 55}>
                  <button
                    onClick={() => setLightboxIndex(index)}
                    className={`gallery-grid-card block w-full p-0 border-none bg-transparent cursor-zoom-in${
                      isFocusLine ? ' is-focus-line' : ''
                    }`}
                    aria-label={`Agrandir ${image.title ?? "l'image"}`}
                  >
                    <img
                      src={publicImageUrl(image.storage_path)}
                      alt={image.title ?? ''}
                      loading="lazy"
                      className="gallery-grid-card__img"
                    />
                  </button>
                </Reveal>
              </li>
            );
          })}
        </ul>
      )}

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[lightboxIndex].title ?? 'Image agrandie'}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <img
            src={publicImageUrl(images[lightboxIndex].storage_path)}
            alt={images[lightboxIndex].title ?? ''}
            className="max-w-full max-h-[min(78vh,100%)] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <i className="pi pi-times" />
          </button>

          {isFlash && (
            <div
              className="mt-5 w-full max-w-md text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {!askFlashOpen ? (
                <button
                  type="button"
                  onClick={() => setAskFlashOpen(true)}
                  className="px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#171617] bg-white border-none cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {t('gallery.ask_flash')}
                </button>
              ) : (
                <div className="bg-white text-[#171617] px-5 py-4 text-left">
                  <p className="m-0 mb-4 text-sm font-medium leading-snug">
                    {t('gallery.ask_flash_confirm')}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setAskFlashOpen(false)}
                      className="px-4 py-2 text-sm font-semibold bg-transparent border border-[#171617]/25 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      {t('gallery.ask_flash_no')}
                    </button>
                    <button
                      type="button"
                      onClick={requestFlash}
                      className="px-4 py-2 text-sm font-semibold text-white bg-[#171617] border-none cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      {t('gallery.ask_flash_yes')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
