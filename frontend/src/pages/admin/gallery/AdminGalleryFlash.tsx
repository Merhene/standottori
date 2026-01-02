import { AdminBreadcrumb, AdminPageHeader, AdminEmptyState } from '../../../components/admin';

export default function AdminGalleryFlash() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[
        { label: 'Galerie', path: '/admin/galerie' },
        { label: 'Flash' }
      ]} />

      <AdminPageHeader 
        title="Flash (dessins proposés)"
        actionLabel="Ajouter des images"
        actionIcon="pi-upload"
      />

      <AdminEmptyState 
        icon="pi-bolt"
        message="Aucun flash dans la galerie"
        hint='Cliquez sur "Ajouter des images" pour commencer'
      />
    </div>
  );
}
