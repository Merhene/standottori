import { Link } from 'react-router-dom';

export default function GalleryFlash() {
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex align-items-center gap-2 mb-6 text-sm">
        <Link to="/gallery" className="admin-breadcrumb-link">
          <i className="pi pi-arrow-left text-xs" />
          Galerie
        </Link>
        <span>/</span>
        <span className="font-semibold">Flash</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">Flash - Dessins proposés</h1>

      {/* Grille d'images (placeholder) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <i className="pi pi-bolt text-4xl opacity-30 mb-4" style={{ display: 'block' }} />
        <p className="opacity-50">Aucun flash disponible</p>
        <p className="text-sm opacity-30 mt-2">Les dessins de tattoo proposés apparaîtront ici</p>
      </div>
    </div>
  );
}



