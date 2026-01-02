import { AdminBreadcrumb, AdminPageHeader } from '../../components/admin';

export default function AdminMessages() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Messages' }]} />

      <AdminPageHeader 
        title="Messages reçus"
        rightContent={
          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
            0 non lu(s)
          </span>
        }
      />

      {/* Liste des messages (placeholder) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Expéditeur</th>
              <th className="text-left px-4 py-3 font-semibold">Sujet</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-4 py-4 text-center opacity-50" colSpan={5}>
                Aucun message reçu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
