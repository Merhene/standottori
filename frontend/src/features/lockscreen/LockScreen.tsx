import { useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import PatternGrid from './PatternGrid';

/* Swap for /images/logosobre.png once the asset exists */
const REVEAL_LOGO_DARK = '/images/logowsd.png';
const REVEAL_LOGO_LIGHT = '/images/logocreuse.png';

/** Full neon treatment for the reveal logo (same recipe as the playground) */
const REVEAL_NEON = [
  'drop-shadow(0 0 4px #fff)',
  'drop-shadow(0 0 10px #ff2ec8)',
  'drop-shadow(0 0 24px #ff00aa)',
  'drop-shadow(0 0 48px #c00080)',
  'drop-shadow(0 0 80px rgba(179, 7, 179, 0.7))',
].join(' ');

/*
 * Timeline, from pattern validation (t=0):
 *  - 0 .. 1.5s   energy flows through the figure (PatternGrid CSS, ENERGY_FILL_MS)
 *  - 0.5s        onPatternSuccess fires -> "charged" (ambient glow arms itself)
 *  - 1.5 .. 2.9s ambient pink glow floods the lockscreen
 *  - 2.4s        reveal: the figure flares and overloads into a blinding flash;
 *                under the peak, the logo appears at its FINAL resting spot
 *                (same geometry as the playground logo - no movement after)
 *  - 5.0s        onComplete -> the app unlocks underneath (0.9s crossfade,
 *                the playground logo lights up in the same spot)
 */
const GLOW_DELAY_MS = 1000;
const GLOW_SPREAD_MS = 1400;
const BLOOM_HOLD_MS = 1900;
/* Flash peaks at ~0.6s, dies at ~2.2s (revealFlash in PatternGrid.css);
   leave a short beat with the logo standing alone before unlocking */
const REVEAL_COMPLETE_MS = 2600;

type Phase = 'pattern' | 'charged' | 'reveal';

export default function LockScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [phase, setPhase] = useState<Phase>('pattern');
  const unlockStarted = useRef(false);

  const handlePatternSuccess = () => {
    if (unlockStarted.current) return; // already unlocking
    unlockStarted.current = true;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      onComplete();
      return;
    }

    setPhase('charged');
    window.setTimeout(() => {
      setPhase('reveal');
      window.setTimeout(onComplete, REVEAL_COMPLETE_MS);
    }, BLOOM_HOLD_MS);
  };

  const isCharged = phase !== 'pattern';
  const isRevealing = phase === 'reveal';

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse 120% 80% at 50% 110%, rgba(179, 7, 179, 0.18) 0%, rgba(0, 0, 0, 0) 55%), #000000'
          : 'radial-gradient(ellipse 120% 90% at 50% 40%, #ffffff 0%, #f4f2ee 100%)',
      }}
    >
      {/* Ambient glow: once the figure is full of light, the energy overflows
          and floods the whole lockscreen */}
      {isDark && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 95% 80% at 50% 50%, rgba(255, 46, 200, 0.35) 0%, rgba(179, 7, 179, 0.18) 45%, rgba(0, 0, 0, 0) 80%)',
            opacity: isCharged ? 1 : 0,
            transition: `opacity ${GLOW_SPREAD_MS}ms ease-in ${GLOW_DELAY_MS}ms`,
          }}
        />
      )}

      {/* Pattern stage: on reveal the figure flares (see .pattern-stage--reveal
          in PatternGrid.css) and vanishes under the flash peak */}
      <div
        className={isRevealing ? 'pattern-stage--reveal' : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isRevealing ? 0 : 1,
          /* the figure vanishes under the flash peak (~0.6s..1.0s) */
          transition: 'opacity 0.5s ease-in 0.5s',
          pointerEvents: isRevealing ? 'none' : 'auto',
        }}
      >
        <PatternGrid onPatternSuccess={handlePatternSuccess} />
      </div>

      {/* Reveal stage: the logo appears directly at its FINAL resting spot -
          identical geometry to the playground logo, so after the flash there
          is no movement at all, just the crossfade to the app */}
      <div
        aria-hidden={!isRevealing}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <img
          src={isDark ? REVEAL_LOGO_DARK : REVEAL_LOGO_LIGHT}
          alt="Standottori"
          className="select-none h-auto"
          style={{
            width: 'min(70vw, 420px)',
            filter: isDark ? REVEAL_NEON : 'none',
            opacity: isRevealing ? 1 : 0,
            /* pre-rasterise this heavy layer (large PNG + filters) so the
               reveal doesn't jank at the exact moment of the flash */
            willChange: 'opacity',
            /* materialises under the flash peak, unveiled as it decays */
            transition: 'opacity 0.9s ease-in 0.4s',
          }}
        />
      </div>

      {/* Reveal flash: the energy overloads into a blinding bloom whose peak
          masks the pattern->logo swap - the eye cannot track shapes through
          peak brightness, so the figure appears to transmute into the logo.
          Kept mounted (opacity 0) so its first paint doesn't delay the attack. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none ${isRevealing ? 'reveal-flash' : ''}`}
        style={{
          opacity: 0,
          background: isDark
            ? 'radial-gradient(circle at 50% 52%, #ffffff 0%, #ffd9f3 18%, rgba(255, 46, 200, 0.9) 42%, rgba(179, 7, 179, 0.5) 68%, transparent 88%)'
            : 'radial-gradient(circle at 50% 52%, #ffffff 0%, #ffffff 30%, rgba(255, 255, 255, 0.7) 60%, transparent 88%)',
        }}
      />
    </div>
  );
}
