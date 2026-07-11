import GalleryGrid from '../../components/GalleryGrid';

export default function GalleryFlash() {
  return (
    <GalleryGrid
      category="flash"
      title="Flash"
      emptyIcon="pi-bolt"
      emptyMessage="Aucun flash disponible pour le moment."
    />
  );
}
