import { AdminBreadcrumb, AdminPageHeader } from '../../components/admin';

export default function AdminBiography() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Biographie' }]} />

      <AdminPageHeader 
        title="Gestion de la Biographie"
        actionLabel="Enregistrer"
        actionIcon="pi-save"
      />

      {/* Éditeur de biographie (placeholder) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Titre</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
            placeholder="Titre de la biographie"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Contenu</label>
          <textarea 
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent min-h-64"
            placeholder="Écrivez la biographie ici..."
            rows={12}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Photo de profil</label>
          <div className="flex align-items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex align-items-center justify-content-center">
              <i className="pi pi-user text-2xl opacity-30" />
            </div>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:opacity-70 transition-opacity">
              Changer la photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
