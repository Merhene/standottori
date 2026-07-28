import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminBreadcrumb } from '../../components/admin';
import StatusBanner, { type Status } from '../../components/admin/StatusBanner';
import {
  getBiography,
  saveBiography,
  uploadBiographyPhoto,
  listGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
} from '../../lib/content';
import { publicImageUrl } from '../../lib/supabase';
import type { GalleryImage } from '../../lib/types';

const CAROUSEL_MAX = 12;

interface ImageSlotProps {
  label: string;
  hint: string;
  path: string | null;
  onChange: (file: File) => void;
}

/** Rectangular image slot with preview + replace button */
function ImageSlot({ label, hint, path, onChange }: ImageSlotProps) {
  return (
    <div className="flex-1 min-w-56">
      <span className="block text-sm font-semibold mb-1">{label}</span>
      <p className="text-xs opacity-60 mb-2">{hint}</p>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {path ? (
            <img src={publicImageUrl(path)} alt={label} className="w-full h-full object-cover" />
          ) : (
            <i className="pi pi-image text-3xl opacity-30" />
          )}
        </div>
        <label className="block text-center text-sm px-4 py-2 border-t border-gray-200 dark:border-gray-700 hover:opacity-70 transition-opacity cursor-pointer">
          {path ? "Changer l'image" : 'Ajouter une image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
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

type BioLocale = 'fr' | 'en';

export default function AdminBiography() {
  const [locale, setLocale] = useState<BioLocale>('fr');
  const [titleFr, setTitleFr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentFr, setContentFr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [imageTopPath, setImageTopPath] = useState<string | null>(null);
  const [imageBottomPath, setImageBottomPath] = useState<string | null>(null);
  const [carousel, setCarousel] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);

  const refreshCarousel = useCallback(async () => {
    setCarousel(await listGalleryImages('biography'));
  }, []);

  const textPayload = () => ({
    title_fr: titleFr,
    title_en: titleEn,
    content_fr: contentFr,
    content_en: contentEn,
    // Keep legacy columns mirrored to French for older readers / fallbacks
    title: titleFr,
    content: contentFr,
  });

  useEffect(() => {
    Promise.all([getBiography(), listGalleryImages('biography')])
      .then(([bio, images]) => {
        setTitleFr(bio.title_fr ?? bio.title ?? '');
        setTitleEn(bio.title_en ?? '');
        setContentFr(bio.content_fr ?? bio.content ?? '');
        setContentEn(bio.content_en ?? '');
        setPhotoPath(bio.photo_path);
        setImageTopPath(bio.image_top_path);
        setImageBottomPath(bio.image_bottom_path);
        setCarousel(images);
      })
      .catch((error) =>
        setStatus({ kind: 'error', message: `Chargement impossible : ${(error as Error).message}` })
      )
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus(null);
    try {
      await saveBiography({ ...textPayload(), photo_path: photoPath });
      setStatus({ kind: 'success', message: 'Biographie enregistrée (FR + EN).' });
    } catch (error) {
      setStatus({ kind: 'error', message: `Enregistrement impossible : ${(error as Error).message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return;
    setStatus(null);
    try {
      const path = await uploadBiographyPhoto(file);
      setPhotoPath(path);
      await saveBiography({ ...textPayload(), photo_path: path });
      setStatus({ kind: 'success', message: 'Photo mise à jour.' });
    } catch (error) {
      setStatus({ kind: 'error', message: `Envoi impossible : ${(error as Error).message}` });
    }
  };

  const activeTitle = locale === 'fr' ? titleFr : titleEn;
  const activeContent = locale === 'fr' ? contentFr : contentEn;
  const setActiveTitle = locale === 'fr' ? setTitleFr : setTitleEn;
  const setActiveContent = locale === 'fr' ? setContentFr : setContentEn;

  const handleSlotChange = async (slot: 'image_top_path' | 'image_bottom_path', file: File) => {
    setStatus(null);
    try {
      const path = await uploadBiographyPhoto(file);
      await saveBiography({ [slot]: path });
      if (slot === 'image_top_path') setImageTopPath(path);
      else setImageBottomPath(path);
      setStatus({ kind: 'success', message: 'Image mise à jour.' });
    } catch (error) {
      setStatus({ kind: 'error', message: `Envoi impossible : ${(error as Error).message}` });
    }
  };

  const handleCarouselFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = CAROUSEL_MAX - carousel.length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length < files.length) {
      setStatus({
        kind: 'error',
        message: `Limite de ${CAROUSEL_MAX} images : seules ${selected.length} image(s) seront ajoutées.`,
      });
    } else {
      setStatus(null);
    }

    setIsUploading(true);
    let uploaded = 0;
    for (const file of selected) {
      try {
        await uploadGalleryImage('biography', file);
        uploaded++;
      } catch (error) {
        setStatus({
          kind: 'error',
          message: `Échec de l'envoi de « ${file.name} » : ${(error as Error).message}`,
        });
      }
    }
    if (uploaded > 0) {
      setStatus({ kind: 'success', message: `${uploaded} image(s) ajoutée(s) au carrousel.` });
    }
    setIsUploading(false);
    if (carouselInputRef.current) carouselInputRef.current.value = '';
    try {
      await refreshCarousel();
    } catch {
      // List refresh failed: keep the current state, the upload itself succeeded
    }
  };

  const handleCarouselDelete = async (image: GalleryImage) => {
    const confirmed = window.confirm('Supprimer définitivement cette image du carrousel ?');
    if (!confirmed) return;
    try {
      await deleteGalleryImage(image);
      setStatus({ kind: 'success', message: 'Image supprimée du carrousel.' });
      await refreshCarousel();
    } catch (error) {
      setStatus({ kind: 'error', message: `Suppression impossible : ${(error as Error).message}` });
    }
  };

  const carouselFull = carousel.length >= CAROUSEL_MAX;

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Biographie' }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion de la Biographie</h1>
        <button onClick={handleSave} disabled={isSaving || isLoading} className="admin-btn disabled:opacity-50">
          <i className={`pi ${isSaving ? 'pi-spinner pi-spin' : 'pi-save'}`} />
          {isSaving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      <StatusBanner status={status} />

      {isLoading ? (
        <div className="flex justify-center p-8">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : (
        <>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-semibold mr-1">Langue du texte</span>
              {([
                ['fr', 'Français'],
                ['en', 'English'],
              ] as const).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  className={
                    'px-3 py-1.5 text-sm rounded-lg border transition-opacity ' +
                    (locale === code
                      ? 'border-[#171617] dark:border-white font-semibold'
                      : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100')
                  }
                  aria-pressed={locale === code}
                >
                  {label}
                </button>
              ))}
              <p className="w-full text-xs opacity-60 mt-1">
                Les deux langues sont enregistrées ensemble. Si l’anglais est vide, le site affiche le
                français.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="bio-title" className="block text-sm font-semibold mb-2">
                Titre ({locale === 'fr' ? 'FR' : 'EN'})
              </label>
              <input
                id="bio-title"
                type="text"
                value={activeTitle}
                onChange={(e) => setActiveTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                placeholder={
                  locale === 'fr' ? 'Titre de la biographie' : 'Biography title'
                }
              />
            </div>

            <div className="mb-4">
              <label htmlFor="bio-content" className="block text-sm font-semibold mb-2">
                Contenu ({locale === 'fr' ? 'FR' : 'EN'})
              </label>
              <textarea
                id="bio-content"
                value={activeContent}
                onChange={(e) => setActiveContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent min-h-64"
                placeholder={
                  locale === 'fr'
                    ? 'Écrivez la biographie ici...'
                    : 'Write the biography here...'
                }
                rows={12}
              />
            </div>

            <div>
              <span className="block text-sm font-semibold mb-2">Photo de profil</span>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {photoPath ? (
                    <img
                      src={publicImageUrl(photoPath)}
                      alt="Photo de profil actuelle"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="pi pi-user text-2xl opacity-30" />
                  )}
                </div>
                <label className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:opacity-70 transition-opacity cursor-pointer">
                  Changer la photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-1">Images de la page</h2>
            <p className="text-sm opacity-70 mb-4">
              Les deux grandes images affichées à côté du texte. Enregistrées automatiquement.
            </p>
            <div className="flex flex-col md:flex-row gap-6">
              <ImageSlot
                label="Image 1 — haut"
                hint="Affichée à gauche du premier bloc de texte"
                path={imageTopPath}
                onChange={(file) => handleSlotChange('image_top_path', file)}
              />
              <ImageSlot
                label="Image 2 — bas"
                hint="Affichée à droite du dernier bloc de texte"
                path={imageBottomPath}
                onChange={(file) => handleSlotChange('image_bottom_path', file)}
              />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold">Carrousel</h2>
              <span className={`text-sm ${carouselFull ? 'font-semibold' : 'opacity-70'}`}>
                {carousel.length}/{CAROUSEL_MAX}
              </span>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Petites images carrées défilant sur deux lignes au scroll. Enregistrées automatiquement.
            </p>

            <div className="mb-4">
              <label
                className={`admin-btn cursor-pointer inline-flex ${
                  carouselFull || isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <i className={`pi ${isUploading ? 'pi-spinner pi-spin' : 'pi-upload'}`} />
                {isUploading
                  ? 'Envoi en cours…'
                  : carouselFull
                    ? 'Limite atteinte'
                    : 'Ajouter des images'}
                <input
                  ref={carouselInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  disabled={carouselFull || isUploading}
                  onChange={(e) => handleCarouselFiles(e.target.files)}
                />
              </label>
            </div>

            {carousel.length === 0 ? (
              <p className="text-sm opacity-50">
                Aucune image : le carrousel utilise les images par défaut du site.
              </p>
            ) : (
              <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 list-none m-0 p-0">
                {carousel.map((image) => (
                  <li
                    key={image.id}
                    className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <img
                      src={publicImageUrl(image.storage_path)}
                      alt={image.title ?? ''}
                      loading="lazy"
                      className="w-full aspect-square object-cover"
                    />
                    <button
                      onClick={() => handleCarouselDelete(image)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="Supprimer cette image du carrousel"
                    >
                      <i className="pi pi-trash text-xs" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
