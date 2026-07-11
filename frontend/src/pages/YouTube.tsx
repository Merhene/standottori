import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSiteInfo } from '../lib/content';

export default function YouTube() {
  const { t } = useTranslation();
  const [channelUrl, setChannelUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSiteInfo()
      .then((info) => setChannelUrl(info.youtube_url))
      .catch(() => {
        // Backend unavailable: the placeholder is shown instead
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t('youtube.title')}</h1>
      <div className="bg-light-text/5 dark:bg-dark-text/5 rounded-lg p-8 text-center">
        {channelUrl ? (
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-lg font-semibold hover:opacity-70 transition-opacity"
          >
            <i className="pi pi-youtube text-2xl" aria-hidden="true" />
            {t('youtube.visit_channel')}
          </a>
        ) : (
          <p className="text-lg">{t('youtube.coming_soon')}</p>
        )}
      </div>
    </div>
  );
}
