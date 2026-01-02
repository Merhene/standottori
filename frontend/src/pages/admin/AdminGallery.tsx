import { AdminBreadcrumb, AdminCard } from '../../components/admin';

export default function AdminGallery() {
  const galleryCategories = [
    {
      icon: 'pi-pencil',
      title: 'Tattoo',
      description: 'Tattoos réalisés par l\'artiste.',
      path: '/admin/galerie/tattoo',
      count: 0
    },
    {
      icon: 'pi-bolt',
      title: 'Flash',
      description: 'Dessins de tattoo proposés, mais non tatoués.',
      path: '/admin/galerie/flash',
      count: 0
    },
    {
      icon: 'pi-desktop',
      title: 'Wallpaper',
      description: 'Fonds d\'écran de la page d\'accueil.',
      path: '/admin/galerie/wallpaper',
      count: 0
    }
  ];

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Galerie' }]} />

      <h1 className="text-3xl font-bold mb-6">Gestion de la Galerie</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryCategories.map((category) => (
          <AdminCard 
            key={category.path}
            icon={category.icon}
            title={category.title}
            description={category.description}
            path={category.path}
            buttonLabel="Gérer"
            badge={`${category.count} image${category.count !== 1 ? 's' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
