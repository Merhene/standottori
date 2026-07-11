import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured, publicImageUrl } from '../lib/supabase';
import { listGalleryImages } from '../lib/content';
import type { GalleryCategory, GalleryImage } from '../lib/types';

interface GalleryGridProps {
  category: GalleryCategory;
  title: string;
  emptyIcon: string;
  emptyMessage: string;
}

export default function GalleryGrid({ category, title, emptyIcon, emptyMessage }: GalleryGridProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listGalleryImages(category)
      .then(setImages)
      .catch(() => {
        // Backend unavailable: the empty state is shown instead
      })
      .finally(() => setIsLoading(false));
  }, [category]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  // Escape closes, arrows navigate the lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, images.length, closeLightbox]);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text px-4 md:px-8 pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 pt-4 mb-8 text-sm">
        <Link to="/gallery" className="inline-flex items-center gap-1.5 text-dark-text no-underline hover:opacity-70 transition-opacity">
          <i className="pi pi-arrow-left text-xs" />
          Galerie
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold">{title}</span>
      </nav>

      <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mb-10">{title}</h1>

      {isLoading ? (
        <div className="flex justify-center p-16">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : images.length === 0 ? (
        <div className="border border-dark-text/20 rounded-lg p-12 text-center max-w-xl mx-auto">
          <i className={`pi ${emptyIcon} text-4xl opacity-30 mb-4`} style={{ display: 'block' }} />
          <p className="opacity-60">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="columns-2 md:columns-3 lg:columns-4 gap-4 list-none m-0 p-0">
          {images.map((image, index) => (
            <li key={image.id} className="mb-4 break-inside-avoid">
              <button
                onClick={() => setLightboxIndex(index)}
                className="block w-full p-0 border-none bg-transparent cursor-zoom-in group"
                aria-label={`Agrandir ${image.title ?? "l'image"}`}
              >
                <img
                  src={publicImageUrl(image.storage_path)}
                  alt={image.title ?? ''}
                  loading="lazy"
                  className="w-full rounded-lg group-hover:opacity-80 transition-opacity"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[lightboxIndex].title ?? 'Image agrandie'}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <img
            src={publicImageUrl(images[lightboxIndex].storage_path)}
            alt={images[lightboxIndex].title ?? ''}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <i className="pi pi-times" />
          </button>
        </div>
      )}
    </div>
  );
}
