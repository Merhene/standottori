import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ZoomReveal from '../components/ZoomReveal';
import { isSupabaseConfigured, publicImageUrl } from '../lib/supabase';
import { getBiography } from '../lib/content';
import type { Biography as BiographyContent } from '../lib/types';

export default function Biography() {
  const { t } = useTranslation();
  const [bio, setBio] = useState<BiographyContent | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getBiography()
      .then(setBio)
      .catch(() => {
        // Content unavailable: the fallback text below is shown instead
      });
  }, []);

  const title = bio?.title || 'Standottori';
  const paragraphs = bio?.content
    ? bio.content.split(/\n{2,}/).filter((p) => p.trim().length > 0)
    : [t('biography.coming_soon')];

  return (
    <ZoomReveal
      backgroundSrc="/images/tattoingStan.png"
      backgroundAlt="Stan tattooing"
      logoSrc="/images/logotrans-cutout.png"
      neonSrc="/images/logoneon.png"
    >
      <div className="max-w-3xl">
        <h1 style={{ color: '#ffffff' }} className="text-3xl md:text-5xl font-bold mb-8">
          {title}
        </h1>

        {bio?.photo_path && (
          <img
            src={publicImageUrl(bio.photo_path)}
            alt={`Portrait - ${title}`}
            className="w-40 h-40 rounded-full object-cover mb-8"
          />
        )}

        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            style={{ color: '#ffffff' }}
            className="text-base md:text-xl leading-loose mt-6 first:mt-0"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </ZoomReveal>
  );
}
