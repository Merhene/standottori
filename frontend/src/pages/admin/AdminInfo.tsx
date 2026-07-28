import { useEffect, useState } from 'react';
import { AdminBreadcrumb } from '../../components/admin';
import StatusBanner, { type Status } from '../../components/admin/StatusBanner';
import { getSiteInfo, saveSiteInfo } from '../../lib/content';
import type { SiteInfo } from '../../lib/types';

type InfoForm = Omit<SiteInfo, 'id' | 'updated_at' | 'opening_hours'>;

const EMPTY_FORM: InfoForm = {
  email: '',
  phone: '',
  address: '',
  instagram_url: '',
  youtube_url: '',
  tiktok_url: '',
  form_url: '',
};

export default function AdminInfo() {
  const [form, setForm] = useState<InfoForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    getSiteInfo()
      .then((info) =>
        setForm({
          email: info.email ?? '',
          phone: info.phone ?? '',
          address: info.address ?? '',
          instagram_url: info.instagram_url ?? '',
          youtube_url: info.youtube_url ?? '',
          tiktok_url: info.tiktok_url ?? '',
          form_url: info.form_url ?? '',
        })
      )
      .catch((error) =>
        setStatus({ kind: 'error', message: `Chargement impossible : ${(error as Error).message}` })
      )
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatus(null);
    try {
      // Clear legacy opening_hours — no longer shown on the public site
      await saveSiteInfo({ ...form, opening_hours: null });
      setStatus({ kind: 'success', message: 'Informations enregistrées.' });
    } catch (error) {
      setStatus({ kind: 'error', message: `Enregistrement impossible : ${(error as Error).message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const setField = (field: keyof InfoForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const inputClass =
    'w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent';

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Informations' }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Informations</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>

            <div className="mb-4">
              <label htmlFor="info-email" className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                id="info-email"
                type="email"
                value={form.email ?? ''}
                onChange={setField('email')}
                className={inputClass}
                placeholder="contact@standottori.com"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="info-phone" className="block text-sm font-semibold mb-2">
                Téléphone
              </label>
              <input
                id="info-phone"
                type="tel"
                value={form.phone ?? ''}
                onChange={setField('phone')}
                className={inputClass}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div>
              <label htmlFor="info-address" className="block text-sm font-semibold mb-2">
                Adresse
              </label>
              <textarea
                id="info-address"
                value={form.address ?? ''}
                onChange={setField('address')}
                className={inputClass}
                placeholder="Adresse du studio"
                rows={3}
              />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Réseaux sociaux</h2>
            <p className="text-sm opacity-60 mb-4">Affichés dans le pied de page du site.</p>

            <div className="mb-4">
              <label htmlFor="info-instagram" className="block text-sm font-semibold mb-2">
                Instagram
              </label>
              <input
                id="info-instagram"
                type="url"
                value={form.instagram_url ?? ''}
                onChange={setField('instagram_url')}
                className={inputClass}
                placeholder="https://instagram.com/standottori"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="info-youtube" className="block text-sm font-semibold mb-2">
                YouTube
              </label>
              <input
                id="info-youtube"
                type="url"
                value={form.youtube_url ?? ''}
                onChange={setField('youtube_url')}
                className={inputClass}
                placeholder="https://youtube.com/@standottori"
              />
            </div>

            <div>
              <label htmlFor="info-tiktok" className="block text-sm font-semibold mb-2">
                TikTok
              </label>
              <input
                id="info-tiktok"
                type="url"
                value={form.tiktok_url ?? ''}
                onChange={setField('tiktok_url')}
                className={inputClass}
                placeholder="https://tiktok.com/@standottori"
              />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Formulaire de demande</h2>
            <p className="text-sm opacity-60 mb-3">
              Lien vers le formulaire à remplir (affiché sur la page Contact). Le visiteur pourra
              l’ouvrir, le remplir, puis le joindre à son message.
            </p>
            <label htmlFor="info-form-url" className="block text-sm font-medium mb-1">
              URL du formulaire
            </label>
            <input
              id="info-form-url"
              type="url"
              value={form.form_url ?? ''}
              onChange={setField('form_url')}
              className={inputClass}
              placeholder="https://…"
            />
          </div>
        </div>
      )}
    </div>
  );
}
