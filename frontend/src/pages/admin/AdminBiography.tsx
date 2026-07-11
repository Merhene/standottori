import { useEffect, useState } from 'react';
import { AdminBreadcrumb } from '../../components/admin';
import StatusBanner, { type Status } from '../../components/admin/StatusBanner';
import { getBiography, saveBiography, uploadBiographyPhoto } from '../../lib/content';
import { publicImageUrl } from '../../lib/supabase';

export default function AdminBiography() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    getBiography()
      .then((bio) => {
        setTitle(bio.title ?? '');
        setContent(bio.content ?? '');
        setPhotoPath(bio.photo_path);
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
      await saveBiography({ title, content, photo_path: photoPath });
      setStatus({ kind: 'success', message: 'Biographie enregistrée.' });
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
      await saveBiography({ title, content, photo_path: path });
      setStatus({ kind: 'success', message: 'Photo mise à jour.' });
    } catch (error) {
      setStatus({ kind: 'error', message: `Envoi impossible : ${(error as Error).message}` });
    }
  };

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
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="bio-title" className="block text-sm font-semibold mb-2">
              Titre
            </label>
            <input
              id="bio-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="Titre de la biographie"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bio-content" className="block text-sm font-semibold mb-2">
              Contenu
            </label>
            <textarea
              id="bio-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent min-h-64"
              placeholder="Écrivez la biographie ici..."
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
      )}
    </div>
  );
}
