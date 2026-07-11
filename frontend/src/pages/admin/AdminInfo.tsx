import { useEffect, useState } from 'react';
import { AdminBreadcrumb } from '../../components/admin';
import StatusBanner, { type Status } from '../../components/admin/StatusBanner';
import { getSiteInfo, saveSiteInfo } from '../../lib/content';
import type { SiteInfo } from '../../lib/types';

type InfoForm = Omit<SiteInfo, 'id' | 'updated_at'>;

const EMPTY_FORM: InfoForm = {
  email: '',
  phone: '',
  address: '',
  instagram_url: '',
  youtube_url: '',
  tiktok_url: '',
  opening_hours: '',
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
          opening_hours: info.opening_hours ?? '',
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
      await saveSiteInfo(form);
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
            <h2 className="text-xl font-semibold mb-4">Horaires d'ouverture</h2>
            <label htmlFor="info-hours" className="sr-only">
              Horaires d'ouverture
            </label>
            <textarea
              id="info-hours"
              value={form.opening_hours ?? ''}
              onChange={setField('opening_hours')}
              className={inputClass}
              placeholder={'Lundi - Vendredi : 10h - 19h\nSamedi : Sur rendez-vous\nDimanche : Fermé'}
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}
