import { AdminBreadcrumb } from '../../components/admin';

export default function AdminSettings() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Paramètres' }]} />

      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

      <div className="flex flex-column gap-6">
        {/* Section: Apparence */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Apparence</h2>
          
          <div className="flex align-items-center justify-content-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium">Thème par défaut</p>
              <p className="text-sm opacity-50">Choisir le thème affiché aux visiteurs</p>
            </div>
            <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent">
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>

          <div className="flex align-items-center justify-content-between py-3">
            <div>
              <p className="font-medium">Écran de verrouillage</p>
              <p className="text-sm opacity-50">Activer l'écran de verrouillage à l'entrée</p>
            </div>
            <label className="relative inline-flex align-items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-dark-bg dark:peer-checked:bg-dark-text"></div>
            </label>
          </div>
        </div>

        {/* Section: SEO */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">SEO & Métadonnées</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Titre du site</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="Standottori - Tattoo Artist"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="Description du site pour les moteurs de recherche..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mots-clés</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="tattoo, artiste, paris, standottori"
            />
          </div>
        </div>

        {/* Section: Compte */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Compte administrateur</h2>
          
          <div className="flex align-items-center justify-content-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium">Changer le mot de passe</p>
              <p className="text-sm opacity-50">Modifier le mot de passe administrateur</p>
            </div>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:opacity-70 transition-opacity">
              Modifier
            </button>
          </div>

          <div className="flex align-items-center justify-content-between py-3">
            <div>
              <p className="font-medium text-red-500">Déconnexion</p>
              <p className="text-sm opacity-50">Se déconnecter de l'administration</p>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
