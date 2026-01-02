import { AdminBreadcrumb, AdminPageHeader, AdminEmptyState } from '../../../components/admin';

export default function AdminGalleryWallpaper() {
  return (
    <div className="p-6">
      <AdminBreadcrumb items={[
        { label: 'Galerie', path: '/admin/galerie' },
        { label: 'Wallpaper' }
      ]} />

      <AdminPageHeader 
        title="Fonds d'écran (Homepage)"
        actionLabel="Ajouter des images"
        actionIcon="pi-upload"
      />

      <p className="text-sm opacity-70 mb-6">
        Ces images sont utilisées dans le carrousel de la page d'accueil.
      </p>

      <AdminEmptyState 
        icon="pi-desktop"
        message="Aucun fond d'écran dans la galerie"
        hint='Cliquez sur "Ajouter des images" pour commencer'
      />
    </div>
  );
}
