import GalleryManager from '../../../components/admin/GalleryManager';

export default function AdminGalleryWallpaper() {
  return (
    <GalleryManager
      category="wallpaper"
      title="Fonds d'écran (Homepage)"
      emptyIcon="pi-desktop"
      emptyMessage="Aucun fond d'écran dans la galerie"
      intro="Ces images sont utilisées dans le carrousel de la page d'accueil."
    />
  );
}
