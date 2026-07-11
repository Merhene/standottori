import GalleryManager from '../../../components/admin/GalleryManager';

export default function AdminGalleryFlash() {
  return (
    <GalleryManager
      category="flash"
      title="Flash (dessins proposés)"
      emptyIcon="pi-bolt"
      emptyMessage="Aucun flash dans la galerie"
    />
  );
}
