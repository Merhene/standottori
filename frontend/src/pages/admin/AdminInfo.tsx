import { AdminBreadcrumb, AdminPageHeader } from '../../components/admin';

export default function AdminInfo() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Informations' }]} />

      <AdminPageHeader 
        title="Gestion des Informations"
        actionLabel="Enregistrer"
        actionIcon="pi-save"
      />

      {/* Formulaire d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de contact */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="contact@standottori.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Téléphone</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Adresse</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="Adresse du studio"
              rows={3}
            />
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Réseaux sociaux</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Instagram</label>
            <input 
              type="url" 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="https://instagram.com/standottori"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">YouTube</label>
            <input 
              type="url" 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="https://youtube.com/@standottori"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">TikTok</label>
            <input 
              type="url" 
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
              placeholder="https://tiktok.com/@standottori"
            />
          </div>
        </div>

        {/* Horaires */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Horaires d'ouverture</h2>
          <textarea 
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
            placeholder="Lundi - Vendredi : 10h - 19h&#10;Samedi : Sur rendez-vous&#10;Dimanche : Fermé"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
