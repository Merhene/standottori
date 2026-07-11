import { useEffect, useState } from 'react';
import Carousel from '../features/carousel/Carousel';
import { isSupabaseConfigured, publicImageUrl } from '../lib/supabase';
import { listGalleryImages } from '../lib/content';

// Shown until the artist uploads wallpapers from the admin
const FALLBACK_IMAGES = [
  { src: '/images/image1.jpg', alt: 'Tattoo artwork 1' },
  { src: '/images/image2.jpg', alt: 'Tattoo artwork 2' },
  { src: '/images/image3.jpg', alt: 'Tattoo artwork 3' },
  { src: '/images/image4.jpg', alt: 'Tattoo artwork 4' },
  { src: '/images/image5.jpg', alt: 'Tattoo artwork 5' },
  { src: '/images/inkSd.jpg', alt: 'Ink artwork' },
  { src: '/images/tattoingStan.png', alt: 'Stan tattooing' },
];

export default function Home() {
  const [images, setImages] = useState(FALLBACK_IMAGES);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listGalleryImages('wallpaper')
      .then((wallpapers) => {
        if (wallpapers.length > 0) {
          setImages(
            wallpapers.map((w) => ({
              src: publicImageUrl(w.storage_path),
              alt: w.title ?? 'Standottori artwork',
            }))
          );
        }
      })
      .catch(() => {
        // Backend unavailable: keep the fallback images
      });
  }, []);

  return <Carousel images={images} isFullscreen={true} />;
}
