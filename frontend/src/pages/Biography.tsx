import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ZoomReveal from '../components/ZoomReveal';
import ScrollMarquee from '../components/ScrollMarquee';
import { isSupabaseConfigured, publicImageUrl } from '../lib/supabase';
import { getBiography, listGalleryImages } from '../lib/content';
import type { Biography as BiographyContent } from '../lib/types';

// Static fallbacks shown until the admin uploads their own images
const FALLBACK_IMAGE_TOP = '/images/ausse.png';
const FALLBACK_IMAGE_BOTTOM = '/images/merhene.png';
const FALLBACK_MARQUEE = ['/images/ausse.png', '/images/merhene.png'];

export default function Biography() {
  const { t } = useTranslation();
  const [bio, setBio] = useState<BiographyContent | null>(null);
  const [marqueeImages, setMarqueeImages] = useState<string[]>(FALLBACK_MARQUEE);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getBiography()
      .then(setBio)
      .catch(() => {
        // Content unavailable: the fallback text below is shown instead
      });
    listGalleryImages('biography')
      .then((images) => {
        if (images.length > 0) {
          setMarqueeImages(images.map((image) => publicImageUrl(image.storage_path)));
        }
      })
      .catch(() => {
        // Carousel unavailable: the static fallback images are shown instead
      });
  }, []);

  const title = bio?.title || 'Standottori';
  const imageTop = bio?.image_top_path ? publicImageUrl(bio.image_top_path) : FALLBACK_IMAGE_TOP;
  const imageBottom = bio?.image_bottom_path
    ? publicImageUrl(bio.image_bottom_path)
    : FALLBACK_IMAGE_BOTTOM;
  const paragraphs = bio?.content
    ? bio.content.split(/\n{2,}/).filter((p) => p.trim().length > 0)
    : [t('biography.coming_soon')];

  // Quincunx distribution: first chunk next to the left image, middle chunk
  // full-width, last chunk next to the right image. Top and bottom are
  // always fed first so both image rows have text whenever possible.
  const total = paragraphs.length;
  const topCount = Math.ceil(total / 3);
  const bottomCount = total >= 2 ? Math.ceil((total - topCount) / 2) : 0;
  const topParagraphs = paragraphs.slice(0, topCount);
  const middleParagraphs = paragraphs.slice(topCount, total - bottomCount);
  const bottomParagraphs = paragraphs.slice(total - bottomCount);

  const renderParagraphs = (items: string[]) =>
    items.map((paragraph, index) => (
      <p
        key={index}
        className="text-base md:text-lg leading-relaxed text-justify text-[#171617] dark:text-white mt-5 first:mt-0"
      >
        {paragraph}
      </p>
    ));

  return (
    <ZoomReveal
      backgroundSrc="/images/tattoingStan.png"
      backgroundAlt="Stan tattooing"
      logoSrc="/images/logotrans-cutout.png"
      logoLightSrc="/images/logotrans-wht-cutout.png"
      neonSrc="/images/logoneon.png"
      lightSrc="/images/logocreuse.png"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-[#171617] dark:text-white mb-10 md:mb-14">
          {title}
        </h1>

        {bio?.photo_path && (
          <img
            src={publicImageUrl(bio.photo_path)}
            alt={`Portrait - ${title}`}
            className="w-40 h-40 rounded-full object-cover mb-10"
          />
        )}

        {/* Row 1: image left / text right */}
        <section className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
          <img
            src={imageTop}
            alt="Stan Ottori - tatouage"
            loading="lazy"
            className="w-full md:w-5/12 shrink-0 rounded-lg object-cover shadow-lg"
          />
          <div className="flex-1">{renderParagraphs(topParagraphs)}</div>
        </section>

        {/* Middle: full-width text */}
        {middleParagraphs.length > 0 && (
          <section className="mt-14 md:mt-20">{renderParagraphs(middleParagraphs)}</section>
        )}

        {/* Scroll-driven carousels: top row slides right, bottom row slides left */}
        <section className="mt-14 md:mt-20 flex flex-col gap-4">
          <ScrollMarquee images={marqueeImages} direction="right" />
          <ScrollMarquee images={[...marqueeImages].reverse()} direction="left" />
        </section>

        {/* Row 2: text left / image right */}
        <section className="mt-14 md:mt-20 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-14">
          {bottomParagraphs.length > 0 && (
            <div className="flex-1">{renderParagraphs(bottomParagraphs)}</div>
          )}
          <img
            src={imageBottom}
            alt="Stan Ottori - flash"
            loading="lazy"
            className="w-full md:w-5/12 shrink-0 rounded-lg object-cover shadow-lg"
          />
        </section>
      </div>
    </ZoomReveal>
  );
}
