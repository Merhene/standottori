import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSiteInfo } from '../lib/content';
import { playClack, playClink, playPanelLock, playPowerSurge } from './arcadeSounds';
import './YouTube.css';

type Phase = 'dormant' | 'inserting' | 'powering' | 'ready';

const ARCADE_NEON = [
  'brightness(0.92)',
  'drop-shadow(0 0 3px #fff)',
  'drop-shadow(0 0 10px #ff2ec8)',
  'drop-shadow(0 0 24px #ff00aa)',
  'drop-shadow(0 0 40px #c00080)',
  'drop-shadow(0 0 56px rgba(0, 242, 255, 0.28))',
].join(' ');

const EPISODES = [
  { id: '4YtLr8oyfdk', titleKey: 'youtube.episode_1' as const, star: false },
  { id: 'cWESpXgZs0k', titleKey: 'youtube.featured_title' as const, star: true },
  { id: 'D-_IL9qh9JI', titleKey: 'youtube.episode_2' as const, star: false },
];

const STAR_INDEX = Math.max(
  0,
  EPISODES.findIndex((e) => e.star)
);

/** Slot opens first, then coin slides fully through (~2.4s ritual) */
const COIN_CLINK_MS = 1550;
const POWER_MS = 2400;
const READY_MS = 4600;

function Embed({ id, title, active }: { id: string; title: string; active: boolean }) {
  if (!active) {
    return (
      <div className="youtube-arcade__thumb" aria-hidden="true">
        <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" draggable={false} />
        <span className="youtube-arcade__thumb-play" />
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}?rel=0`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}

export default function YouTube() {
  const { t } = useTranslation();
  const [channelUrl, setChannelUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('dormant');
  const [active, setActive] = useState(STAR_INDEX);
  const [muted, setMuted] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSiteInfo()
      .then((info) => {
        if (info.youtube_url?.trim()) setChannelUrl(info.youtube_url.trim());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) setPhase('ready');
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const sfx = (fn: () => void) => {
    if (!muted) fn();
  };

  const pressStart = () => {
    if (phase !== 'dormant') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('ready');
      return;
    }

    sfx(playClack);
    setPhase('inserting');

    schedule(() => sfx(playClink), COIN_CLINK_MS);
    schedule(() => {
      sfx(playPowerSurge);
      setPhase('powering');
    }, POWER_MS);
    schedule(() => {
      sfx(playPanelLock);
      setPhase('ready');
    }, READY_MS);
  };

  const selectEpisode = (index: number) => {
    if (index === active || phase !== 'ready') return;
    setActive(index);
    sfx(playPanelLock);
  };

  const goPrev = () => selectEpisode((active - 1 + EPISODES.length) % EPISODES.length);
  const goNext = () => selectEpisode((active + 1) % EPISODES.length);

  const showBrand = phase === 'powering' || phase === 'ready';

  return (
    <div className={`youtube-arcade youtube-arcade--${phase}`}>
      <div className="youtube-arcade__crt" aria-hidden="true" />
      <div className="youtube-arcade__fog" aria-hidden="true" />
      <div className="youtube-arcade__floor" aria-hidden="true" />
      <div className="youtube-arcade__sparks" aria-hidden="true" />

      <div className="youtube-arcade__stage">
        <div className="youtube-arcade__boot">
          {/* Dormant: only the prompt — nothing else */}
          {phase === 'dormant' && (
            <button type="button" className="youtube-arcade__insert" onClick={pressStart}>
              <span className="youtube-arcade__insert-blink">{t('youtube.insert_coin')}</span>
              <span className="youtube-arcade__insert-btn">{t('youtube.press_start')}</span>
            </button>
          )}

          {/* Simple pixel slot + SDcoin sliding through */}
          {phase === 'inserting' && (
            <div className="youtube-arcade__ritual" aria-hidden="true">
              <div className="youtube-arcade__slot-line" />
              <div className="youtube-arcade__coin-clip">
                <img className="youtube-arcade__coin" src="/images/SDcoin.png" alt="" draggable={false} />
              </div>
            </div>
          )}

          {/* Brand only after the room wakes — titles sit in front of the logo */}
          {showBrand && (
            <div className="youtube-arcade__logo-stage">
              <div className="youtube-arcade__logo-glow" aria-hidden="true" />
              <img
                className="youtube-arcade__logo"
                src="/images/logowsd.png"
                alt={t('youtube.logo_alt')}
                style={{ filter: ARCADE_NEON }}
              />
              {phase === 'ready' && (
                <header className="youtube-arcade__header">
                  <p className="youtube-arcade__eyebrow">{t('youtube.eyebrow')}</p>
                  <h1 className="youtube-arcade__title">{t('youtube.title')}</h1>
                  <p className="youtube-arcade__subtitle">{t('youtube.tagline')}</p>
                </header>
              )}
            </div>
          )}
        </div>

        <div className="youtube-arcade__interface" aria-hidden={phase !== 'ready'}>
          <section className="youtube-arcade__carousel" aria-label={t('youtube.carousel_label')}>
            <button
              type="button"
              className="youtube-arcade__arrow youtube-arcade__arrow--prev"
              onClick={goPrev}
              aria-label={t('youtube.prev')}
              tabIndex={phase === 'ready' ? 0 : -1}
            >
              {'<'}
            </button>

            <div className="youtube-arcade__rail">
              {EPISODES.map((ep, index) => {
                const offset = index - active;
                const isActive = index === active;
                return (
                  <article
                    key={ep.id}
                    className={[
                      'youtube-arcade__card',
                      isActive ? 'is-active' : 'is-side',
                      ep.star ? 'is-star' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ '--offset': offset } as CSSProperties}
                    onClick={() => selectEpisode(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectEpisode(index);
                      }
                    }}
                    role="button"
                    tabIndex={phase === 'ready' ? 0 : -1}
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={t(ep.titleKey)}
                  >
                    <p className="youtube-arcade__card-label">
                      {ep.star ? t('youtube.featured_badge') : t(ep.titleKey)}
                    </p>
                    <div className="youtube-arcade__frame">
                      <Embed id={ep.id} title={t(ep.titleKey)} active={isActive} />
                    </div>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              className="youtube-arcade__arrow youtube-arcade__arrow--next"
              onClick={goNext}
              aria-label={t('youtube.next')}
              tabIndex={phase === 'ready' ? 0 : -1}
            >
              {'>'}
            </button>

            <div className="youtube-arcade__dots" role="tablist">
              {EPISODES.map((ep, index) => (
                <button
                  key={ep.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={`youtube-arcade__dot ${index === active ? 'is-on' : ''}`}
                  onClick={() => selectEpisode(index)}
                  aria-label={t(ep.titleKey)}
                  tabIndex={phase === 'ready' ? 0 : -1}
                />
              ))}
            </div>
          </section>

          <div className="youtube-arcade__footer">
            {channelUrl && (
              <a
                className="youtube-arcade__cta"
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={phase === 'ready' ? 0 : -1}
              >
                <i className="pi pi-youtube" aria-hidden="true" />
                {t('youtube.visit_channel')}
              </a>
            )}
            <button
              type="button"
              className="youtube-arcade__mute"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              tabIndex={phase === 'ready' ? 0 : -1}
            >
              {muted ? t('youtube.sound_off') : t('youtube.sound_on')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
