import { AdminBreadcrumb, AdminPageHeader } from '../../components/admin';

export default function AdminEvents() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Événements' }]} />

      <AdminPageHeader 
        title="Gestion des Événements"
        actionLabel="Ajouter un événement"
        actionIcon="pi-plus"
      />

      {/* Liste des événements (placeholder) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Titre</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Lieu</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-4 py-4 text-center opacity-50" colSpan={5}>
                Aucun événement pour le moment
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
