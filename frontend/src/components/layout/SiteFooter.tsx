import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSiteInfo } from '../../lib/content';
import { isSupabaseConfigured } from '../../lib/supabase';

interface SocialLink {
  url: string;
  icon: string;
  label: string;
}

/**
 * Site-wide footer: social links from admin site_info + copyright.
 */
export default function SiteFooter() {
  const { t } = useTranslation();
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSiteInfo()
      .then((info) => {
        const next: SocialLink[] = [];
        if (info.instagram_url?.trim()) {
          next.push({ url: info.instagram_url.trim(), icon: 'pi-instagram', label: 'Instagram' });
        }
        if (info.youtube_url?.trim()) {
          next.push({ url: info.youtube_url.trim(), icon: 'pi-youtube', label: 'YouTube' });
        }
        if (info.tiktok_url?.trim()) {
          next.push({ url: info.tiktok_url.trim(), icon: 'pi-video', label: 'TikTok' });
        }
        setSocials(next);
      })
      .catch(() => setSocials([]));
  }, []);

  return (
    <footer className="border-t border-light-text/10 dark:border-dark-text/10">
      <div className="container mx-auto px-4 py-6 text-sm flex flex-col items-center gap-4">
        {socials.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-5 list-none m-0 p-0" aria-label={t('footer.socials')}>
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <i className={`pi ${social.icon}`} aria-hidden="true" />
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-center m-0 opacity-70">
          &copy; {new Date().getFullYear()} Standottori. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
