import { useEffect, useRef, useState } from 'react';
import Carousel from '../features/carousel/Carousel';
import LogoSlide from '../features/home/LogoSlide';
import { useUnlock } from '../hooks/useUnlock';
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

/** Covers logo fade + stage fade before autoplay may leave slide 1 */
const ENTRANCE_TOTAL_MS = 3200;

export default function Home() {
  const [images, setImages] = useState(FALLBACK_IMAGES);
  const { unlocked } = useUnlock();

  // Brand stage (slide 1) entrance:
  //  - visitor unlocks live -> fast light-up synced with the overlay fade
  //  - returning visitor (already unlocked) -> gentle one-time entrance
  const [revealed, setRevealed] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const wasLockedAtMount = useRef(!unlocked);

  useEffect(() => {
    if (!unlocked || revealed) return;

    if (wasLockedAtMount.current) {
      // The lockscreen reveal left its logo at our exact spot: light ours
      // up immediately so the crossfade never dips to black
      setHandoff(true);
      setRevealed(true);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(true);
      setEntranceComplete(true);
      return;
    }
    const startId = window.setTimeout(() => setRevealed(true), 400);
    return () => window.clearTimeout(startId);
  }, [unlocked, revealed]);

  useEffect(() => {
    if (!revealed || entranceComplete) return;
    const doneId = window.setTimeout(() => setEntranceComplete(true), ENTRANCE_TOTAL_MS);
    return () => window.clearTimeout(doneId);
  }, [revealed, entranceComplete]);

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

  return (
    <Carousel
      images={images}
      isFullscreen={true}
      leadingSlide={
        <LogoSlide revealed={revealed} handoff={handoff} entranceComplete={entranceComplete} />
      }
      paused={!entranceComplete}
    />
  );
}
