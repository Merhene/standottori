import { useEffect, useState } from 'react';
import { AdminBreadcrumb, AdminCard } from '../../components/admin';
import { listGalleryImages } from '../../lib/content';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { GalleryCategory } from '../../lib/types';

const CATEGORIES: {
  icon: string;
  title: string;
  description: string;
  path: string;
  category: GalleryCategory;
}[] = [
  {
    icon: 'pi-pencil',
    title: 'Tattoo',
    description: "Tattoos réalisés par l'artiste.",
    path: '/admin/gallery/tattoo',
    category: 'tattoo',
  },
  {
    icon: 'pi-bolt',
    title: 'Flash',
    description: 'Dessins de tattoo proposés, mais non tatoués.',
    path: '/admin/gallery/flash',
    category: 'flash',
  },
  {
    icon: 'pi-desktop',
    title: 'Wallpaper',
    description: "Fonds d'écran de la page d'accueil.",
    path: '/admin/gallery/wallpaper',
    category: 'wallpaper',
  },
];

export default function AdminGallery() {
  const [counts, setCounts] = useState<Partial<Record<GalleryCategory, number>>>({});

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    Promise.all(
      CATEGORIES.map(async ({ category }) => {
        const images = await listGalleryImages(category);
        return [category, images.length] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;
        setCounts(Object.fromEntries(entries));
      })
      .catch(() => {
        if (!cancelled) setCounts({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Galerie' }]} />

      <h1 className="text-3xl font-bold mb-6">Gestion de la Galerie</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => {
          const count = counts[category.category] ?? 0;
          return (
            <AdminCard
              key={category.path}
              icon={category.icon}
              title={category.title}
              description={category.description}
              path={category.path}
              buttonLabel="Gérer"
              badge={`${count} image${count !== 1 ? 's' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}
