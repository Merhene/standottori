import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGalleryImages } from '../lib/content';
import { isSupabaseConfigured, publicImageUrl } from '../lib/supabase';
import './Gallery.css';

/** Used until Cover images are uploaded in admin */
const FALLBACK_COVERS = {
  book: '/images/back-tattoo.jpg',
  flash: '/images/tattoo_ex3.jpg',
} as const;

interface GallerySectionProps {
  image: string;
  title: string;
  link: string;
  onSelect: (payload: ExpandPayload) => void;
  dismissed: boolean;
}

export interface ExpandPayload {
  image: string;
  title: string;
  link: string;
  rect: DOMRect;
}

type ExpandPhase = 'start' | 'fill' | 'plunge' | 'void';

function GallerySection({ image, title, link, onSelect, dismissed }: GallerySectionProps) {
  const panelRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={panelRef}
      type="button"
      className={`gallery-hub__panel ${dismissed ? 'is-dismissed' : ''}`}
      aria-label={title}
      onClick={() => {
        const el = panelRef.current;
        if (!el) return;
        onSelect({ image, title, link, rect: el.getBoundingClientRect() });
      }}
    >
      <img className="gallery-hub__image" src={image} alt="" draggable={false} />
      <div className="gallery-hub__scrim" aria-hidden="true" />
      <div className="gallery-hub__label">
        <h2 className="gallery-hub__title">{title}</h2>
      </div>
    </button>
  );
}

interface ExpandLayerProps {
  payload: ExpandPayload;
  onDone: () => void;
}

/** Fill screen → hard zoom into black ink → void → navigate */
function ExpandLayer({ payload, onDone }: ExpandLayerProps) {
  const [phase, setPhase] = useState<ExpandPhase>('start');
  const doneRef = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('fill'));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (phase === 'fill') {
      const t = window.setTimeout(() => setPhase('plunge'), 420);
      return () => window.clearTimeout(t);
    }
    if (phase === 'plunge') {
      const t = window.setTimeout(() => setPhase('void'), 780);
      return () => window.clearTimeout(t);
    }
    if (phase === 'void') {
      const t = window.setTimeout(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        onDone();
      }, 180);
      return () => window.clearTimeout(t);
    }
  }, [phase, onDone]);

  const { rect } = payload;
  const filled = phase !== 'start';

  return (
    <div
      className={`gallery-expand is-${phase}`}
      style={
        filled
          ? undefined
          : {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }
      }
      aria-hidden="true"
    >
      <img className="gallery-expand__image" src={payload.image} alt="" draggable={false} />
      <div className="gallery-expand__ink" />
      <div className="gallery-expand__void" />
      <p className={`gallery-expand__title ${phase === 'fill' || phase === 'plunge' ? 'is-in' : ''}`}>
        {payload.title}
      </p>
    </div>
  );
}

export default function Gallery() {
  const navigate = useNavigate();
  const [expand, setExpand] = useState<ExpandPayload | null>(null);
  const [covers, setCovers] = useState<{ book: string; flash: string }>({ ...FALLBACK_COVERS });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listGalleryImages('cover')
      .then((images) => {
        const book = images.find((img) => img.title === 'book');
        const flash = images.find((img) => img.title === 'flash');
        setCovers({
          book: book ? publicImageUrl(book.storage_path) : FALLBACK_COVERS.book,
          flash: flash ? publicImageUrl(flash.storage_path) : FALLBACK_COVERS.flash,
        });
      })
      .catch(() => {
        // Keep static fallbacks
      });
  }, []);

  const handleSelect = (payload: ExpandPayload) => {
    if (expand) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(payload.link, { state: { galleryEnter: true } });
      return;
    }

    setExpand(payload);
  };

  const handleExpandDone = useCallback(() => {
    if (!expand) return;
    navigate(expand.link, { state: { galleryEnter: true } });
  }, [expand, navigate]);

  return (
    <div className={`gallery-hub ${expand ? 'is-expanding' : ''}`}>
      <GallerySection
        image={covers.book}
        title="Book"
        link="/gallery/book"
        onSelect={handleSelect}
        dismissed={!!expand && expand.link !== '/gallery/book'}
      />
      <GallerySection
        image={covers.flash}
        title="Flash"
        link="/gallery/flash"
        onSelect={handleSelect}
        dismissed={!!expand && expand.link !== '/gallery/flash'}
      />

      {expand && <ExpandLayer payload={expand} onDone={handleExpandDone} />}
    </div>
  );
}
