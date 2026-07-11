import { AdminCard } from '../components/admin';

export default function Admin() {
  const adminSections = [
    {
      icon: 'pi-calendar',
      title: 'Événements',
      description: 'Gérer les événements, dates et lieux.',
      path: '/admin/events'
    },
    {
      icon: 'pi-images',
      title: 'Galerie',
      description: 'Ajouter, modifier ou supprimer des images.',
      path: '/admin/gallery'
    },
    {
      icon: 'pi-user',
      title: 'Biographie',
      description: 'Modifier le contenu de la biographie.',
      path: '/admin/biography'
    },
    {
      icon: 'pi-info-circle',
      title: 'Informations',
      description: 'Modifier les informations générales.',
      path: '/admin/info'
    },
    {
      icon: 'pi-cog',
      title: 'Paramètres',
      description: 'Configurer le site et les préférences.',
      path: '/admin/settings'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <AdminCard key={section.path} {...section} />
        ))}
      </div>
    </div>
  );
}
