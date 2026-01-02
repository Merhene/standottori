import { Link } from 'react-router-dom';

export default function GalleryBook() {
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex align-items-center gap-2 mb-6 text-sm">
        <Link to="/gallery" className="admin-breadcrumb-link">
          <i className="pi pi-arrow-left text-xs" />
          Galerie
        </Link>
        <span>/</span>
        <span className="font-semibold">Book</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">Book - Tattoos réalisés</h1>

      {/* Grille d'images (placeholder) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <i className="pi pi-images text-4xl opacity-30 mb-4" style={{ display: 'block' }} />
        <p className="opacity-50">Aucune image dans le book</p>
        <p className="text-sm opacity-30 mt-2">Les tattoos réalisés apparaîtront ici</p>
      </div>
    </div>
  );
}

