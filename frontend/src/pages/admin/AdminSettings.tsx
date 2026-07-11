import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminBreadcrumb } from '../../components/admin';
import StatusBanner, { type Status } from '../../components/admin/StatusBanner';
import { getSiteSettings, saveSiteSettings } from '../../lib/content';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { SiteSettings } from '../../lib/types';

type SettingsForm = Omit<SiteSettings, 'id' | 'updated_at'>;

const EMPTY_FORM: SettingsForm = {
  default_theme: 'system',
  lockscreen_enabled: true,
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
};

export default function AdminSettings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((settings) =>
        setForm({
          default_theme: settings.default_theme,
          lockscreen_enabled: settings.lockscreen_enabled,
          seo_title: settings.seo_title ?? '',
          seo_description: settings.seo_description ?? '',
          seo_keywords: settings.seo_keywords ?? '',
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
      await saveSiteSettings(form);
      setStatus({ kind: 'success', message: 'Paramètres enregistrés.' });
    } catch (error) {
      setStatus({ kind: 'error', message: `Enregistrement impossible : ${(error as Error).message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (newPassword.length < 8) {
      setStatus({ kind: 'error', message: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    setIsChangingPassword(true);
    setStatus(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPassword(false);

    if (error) {
      setStatus({ kind: 'error', message: `Changement impossible : ${error.message}` });
      return;
    }
    setNewPassword('');
    setStatus({ kind: 'success', message: 'Mot de passe modifié.' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const inputClass =
    'w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent';

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Paramètres' }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <button onClick={handleSave} disabled={isSaving || isLoading} className="admin-btn disabled:opacity-50">
          <i className={`pi ${isSaving ? 'pi-spinner pi-spin' : 'pi-save'}`} />
          {isSaving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      <StatusBanner status={status} />

      <div className="flex flex-col gap-6">
        {/* Appearance */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Apparence</h2>

          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label htmlFor="settings-theme" className="font-medium">
                Thème par défaut
              </label>
              <p className="text-sm opacity-50">Choisir le thème affiché aux visiteurs</p>
            </div>
            <select
              id="settings-theme"
              value={form.default_theme}
              onChange={(e) =>
                setForm({ ...form, default_theme: e.target.value as SettingsForm['default_theme'] })
              }
              disabled={isLoading}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label htmlFor="settings-lockscreen" className="font-medium">
                Écran de verrouillage
              </label>
              <p className="text-sm opacity-50">Activer l'écran de verrouillage à l'entrée</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="settings-lockscreen"
                type="checkbox"
                className="sr-only peer"
                checked={form.lockscreen_enabled}
                disabled={isLoading}
                onChange={(e) => setForm({ ...form, lockscreen_enabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-dark-bg dark:peer-checked:bg-dark-text"></div>
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">SEO & Métadonnées</h2>

          <div className="mb-4">
            <label htmlFor="settings-seo-title" className="block text-sm font-semibold mb-2">
              Titre du site
            </label>
            <input
              id="settings-seo-title"
              type="text"
              value={form.seo_title ?? ''}
              onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
              className={inputClass}
              placeholder="Standottori - Tattoo Artist"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="settings-seo-description" className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              id="settings-seo-description"
              value={form.seo_description ?? ''}
              onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
              className={inputClass}
              placeholder="Description du site pour les moteurs de recherche..."
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="settings-seo-keywords" className="block text-sm font-semibold mb-2">
              Mots-clés
            </label>
            <input
              id="settings-seo-keywords"
              type="text"
              value={form.seo_keywords ?? ''}
              onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })}
              className={inputClass}
              placeholder="tattoo, artiste, paris, standottori"
            />
          </div>
        </div>

        {/* Account */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Compte administrateur</h2>

          <form
            onSubmit={handlePasswordChange}
            className="flex flex-col md:flex-row md:items-end gap-3 py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex-grow">
              <label htmlFor="settings-password" className="block text-sm font-semibold mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="settings-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Au moins 8 caractères"
              />
            </div>
            <button
              type="submit"
              disabled={isChangingPassword || newPassword.length === 0}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:opacity-70 transition-opacity disabled:opacity-50"
            >
              {isChangingPassword ? 'Modification…' : 'Modifier'}
            </button>
          </form>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-red-500">Déconnexion</p>
              <p className="text-sm opacity-50">Se déconnecter de l'administration</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
