import { AdminBreadcrumb, AdminPageHeader, AdminEmptyState } from '../../../components/admin';

export default function AdminGalleryTattoo() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[
        { label: 'Galerie', path: '/admin/galerie' },
        { label: 'Tattoo' }
      ]} />

      <AdminPageHeader 
        title="Tattoos réalisés"
        actionLabel="Ajouter des images"
        actionIcon="pi-upload"
      />

      <AdminEmptyState 
        icon="pi-pencil"
        message="Aucun tattoo dans la galerie"
        hint='Cliquez sur "Ajouter des images" pour commencer'
      />
    </div>
  );
}
