import GalleryManager from '../../../components/admin/GalleryManager';

export default function AdminGalleryTattoo() {
  return (
    <GalleryManager
      category="tattoo"
      title="Tattoos réalisés"
      emptyIcon="pi-pencil"
      emptyMessage="Aucun tattoo dans la galerie"
    />
  );
}
