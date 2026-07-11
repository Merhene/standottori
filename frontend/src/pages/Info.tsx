import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSiteInfo } from '../lib/content';
import type { SiteInfo } from '../lib/types';

export default function Info() {
  const { t } = useTranslation();
  const [info, setInfo] = useState<SiteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSiteInfo()
      .then(setInfo)
      .catch(() => {
        // Backend unavailable: the placeholder is shown instead
      })
      .finally(() => setIsLoading(false));
  }, []);

  const hasContent =
    info && (info.email || info.phone || info.address || info.opening_hours || info.instagram_url);

  const socials = [
    { url: info?.instagram_url, icon: 'pi-instagram', label: 'Instagram' },
    { url: info?.youtube_url, icon: 'pi-youtube', label: 'YouTube' },
    { url: info?.tiktok_url, icon: 'pi-video', label: 'TikTok' },
  ].filter((s) => s.url);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t('info.title')}</h1>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : !hasContent ? (
        <div className="bg-light-text/5 dark:bg-dark-text/5 rounded-lg p-8 text-center">
          <p className="text-lg">{t('info.coming_soon')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(info.email || info.phone || info.address) && (
            <section className="border border-light-text/10 dark:border-dark-text/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t('info.contact_heading')}</h2>
              <ul className="flex flex-col gap-3 list-none m-0 p-0">
                {info.email && (
                  <li>
                    <i className="pi pi-envelope mr-2" aria-hidden="true" />
                    <a href={`mailto:${info.email}`} className="hover:opacity-70 transition-opacity">
                      {info.email}
                    </a>
                  </li>
                )}
                {info.phone && (
                  <li>
                    <i className="pi pi-phone mr-2" aria-hidden="true" />
                    <a href={`tel:${info.phone}`} className="hover:opacity-70 transition-opacity">
                      {info.phone}
                    </a>
                  </li>
                )}
                {info.address && (
                  <li className="whitespace-pre-line">
                    <i className="pi pi-map-marker mr-2" aria-hidden="true" />
                    {info.address}
                  </li>
                )}
              </ul>
            </section>
          )}

          {info.opening_hours && (
            <section className="border border-light-text/10 dark:border-dark-text/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t('info.hours_heading')}</h2>
              <p className="whitespace-pre-line">{info.opening_hours}</p>
            </section>
          )}

          {socials.length > 0 && (
            <section className="border border-light-text/10 dark:border-dark-text/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t('info.socials_heading')}</h2>
              <ul className="flex gap-4 list-none m-0 p-0">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <i className={`pi ${social.icon}`} aria-hidden="true" />
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
