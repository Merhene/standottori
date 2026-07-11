import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminBreadcrumb, AdminEmptyState } from './index';
import StatusBanner, { type Status } from './StatusBanner';
import { listGalleryImages, uploadGalleryImage, deleteGalleryImage } from '../../lib/content';
import { publicImageUrl } from '../../lib/supabase';
import type { GalleryCategory, GalleryImage } from '../../lib/types';

interface GalleryManagerProps {
  category: GalleryCategory;
  title: string;
  emptyIcon: string;
  emptyMessage: string;
  intro?: string;
}

export default function GalleryManager({
  category,
  title,
  emptyIcon,
  emptyMessage,
  intro,
}: GalleryManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setImages(await listGalleryImages(category));
    } catch (error) {
      setStatus({ kind: 'error', message: `Chargement impossible : ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setStatus(null);

    let uploaded = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadGalleryImage(category, file);
        uploaded++;
      } catch (error) {
        setStatus({
          kind: 'error',
          message: `Échec de l'envoi de « ${file.name} » : ${(error as Error).message}`,
        });
      }
    }

    if (uploaded > 0) {
      setStatus({ kind: 'success', message: `${uploaded} image(s) ajoutée(s).` });
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await refresh();
  };

  const handleDelete = async (image: GalleryImage) => {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${image.title ?? 'cette image'} » ?`
    );
    if (!confirmed) return;

    try {
      await deleteGalleryImage(image);
      setStatus({ kind: 'success', message: 'Image supprimée.' });
      await refresh();
    } catch (error) {
      setStatus({ kind: 'error', message: `Suppression impossible : ${(error as Error).message}` });
    }
  };

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Galerie', path: '/admin/gallery' }, { label: title }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <label className="admin-btn cursor-pointer">
          <i className={`pi ${isUploading ? 'pi-spinner pi-spin' : 'pi-upload'}`} />
          {isUploading ? 'Envoi en cours…' : 'Ajouter des images'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={isUploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {intro && <p className="text-sm opacity-70 mb-6">{intro}</p>}

      <StatusBanner status={status} />

      {isLoading ? (
        <div className="flex justify-center p-8">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : images.length === 0 ? (
        <AdminEmptyState
          icon={emptyIcon}
          message={emptyMessage}
          hint='Cliquez sur "Ajouter des images" pour commencer'
        />
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none m-0 p-0">
          {images.map((image) => (
            <li
              key={image.id}
              className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <img
                src={publicImageUrl(image.storage_path)}
                alt={image.title ?? ''}
                loading="lazy"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => handleDelete(image)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={`Supprimer ${image.title ?? "l'image"}`}
              >
                <i className="pi pi-trash text-sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
