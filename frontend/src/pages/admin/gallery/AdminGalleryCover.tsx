import { useCallback, useEffect, useState } from 'react';
import { AdminBreadcrumb } from '../../../components/admin';
import StatusBanner, { type Status } from '../../../components/admin/StatusBanner';
import { listGalleryImages, replaceGalleryCover } from '../../../lib/content';
import { publicImageUrl } from '../../../lib/supabase';
import type { GalleryCoverSlot, GalleryImage } from '../../../lib/types';

interface CoverSlotProps {
  label: string;
  hint: string;
  path: string | null;
  busy: boolean;
  onChange: (file: File) => void;
}

function CoverSlot({ label, hint, path, busy, onChange }: CoverSlotProps) {
  return (
    <div className="flex-1 min-w-56">
      <span className="block text-sm font-semibold mb-1">{label}</span>
      <p className="text-xs opacity-60 mb-2">{hint}</p>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="h-56 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {path ? (
            <img src={publicImageUrl(path)} alt={label} className="w-full h-full object-cover" />
          ) : (
            <i className="pi pi-image text-3xl opacity-30" />
          )}
        </div>
        <label
          className={`block text-center text-sm px-4 py-2 border-t border-gray-200 dark:border-gray-700 transition-opacity ${
            busy ? 'opacity-50 cursor-wait' : 'hover:opacity-70 cursor-pointer'
          }`}
        >
          {busy ? 'Envoi…' : path ? "Changer l'image" : 'Ajouter une image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminGalleryCover() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busySlot, setBusySlot] = useState<GalleryCoverSlot | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  const refresh = useCallback(async () => {
    try {
      setImages(await listGalleryImages('cover'));
    } catch (error) {
      setStatus({ kind: 'error', message: `Chargement impossible : ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pathFor = (slot: GalleryCoverSlot) =>
    images.find((img) => img.title === slot)?.storage_path ?? null;

  const handleReplace = async (slot: GalleryCoverSlot, file: File) => {
    setBusySlot(slot);
    setStatus(null);
    try {
      await replaceGalleryCover(slot, file);
      setStatus({
        kind: 'success',
        message: slot === 'book' ? 'Cover Book mise à jour.' : 'Cover Flash mise à jour.',
      });
      await refresh();
    } catch (error) {
      setStatus({ kind: 'error', message: `Échec : ${(error as Error).message}` });
    } finally {
      setBusySlot(null);
    }
  };

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Galerie', path: '/admin/gallery' }, { label: 'Cover' }]} />

      <h1 className="text-3xl font-bold mb-2">Cover (hub Galerie)</h1>
      <p className="text-sm opacity-60 mb-6 max-w-2xl">
        Images des deux panneaux sur la page <strong>/gallery</strong> : Book à gauche, Flash à
        droite. Formats JPEG, PNG ou WebP.
      </p>

      <StatusBanner status={status} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          <CoverSlot
            label="Book"
            hint="Panneau gauche — ouvre /gallery/book"
            path={pathFor('book')}
            busy={busySlot === 'book'}
            onChange={(file) => handleReplace('book', file)}
          />
          <CoverSlot
            label="Flash"
            hint="Panneau droit — ouvre /gallery/flash"
            path={pathFor('flash')}
            busy={busySlot === 'flash'}
            onChange={(file) => handleReplace('flash', file)}
          />
        </div>
      )}
    </div>
  );
}
