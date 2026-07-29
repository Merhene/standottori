import { useEffect, useRef, useState } from 'react';
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
 * Publishes --site-footer-height so fullscreen chrome (e.g. carousel dots)
 * can sit above this block.
 */
export default function SiteFooter() {
  const { t } = useTranslation();
  const footerRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const publishHeight = () => {
      document.documentElement.style.setProperty(
        '--site-footer-height',
        `${el.offsetHeight}px`
      );
    };

    publishHeight();
    const ro = new ResizeObserver(publishHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty('--site-footer-height');
    };
  }, [socials]);

  return (
    <footer ref={footerRef} className="relative z-20">
      {/* Thin veil: 90% → 10% so socials stay readable over fullscreen pages */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -top-8 bg-gradient-to-t from-light-bg/90 via-light-bg/40 to-light-bg/10 dark:from-dark-bg/90 dark:via-dark-bg/40 dark:to-dark-bg/10"
      />
      <div className="relative container mx-auto px-4 py-6 text-sm flex flex-col items-center gap-4">
        {socials.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-5 list-none m-0 p-0" aria-label={t('footer.socials')}>
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
                >
                  <i className={`pi ${social.icon}`} aria-hidden="true" />
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-center m-0 opacity-60">
          &copy; {new Date().getFullYear()} Stan Dottori. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
