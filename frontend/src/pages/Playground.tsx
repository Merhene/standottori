import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import LockScreen from '../features/lockscreen/LockScreen';

/* TEMP: lockscreen test rig - overlay fade must match App.tsx */
const OVERLAY_FADE_MS = 900;

const NEON_DARK = [
  'drop-shadow(0 0 4px #fff)',
  'drop-shadow(0 0 10px #ff2ec8)',
  'drop-shadow(0 0 24px #ff00aa)',
  'drop-shadow(0 0 48px #c00080)',
  'drop-shadow(0 0 80px rgba(179, 7, 179, 0.7))',
].join(' ');

/** Shared display width — dark/light assets share the same ink bbox. */
const LOGO_WIDTH = 'min(70vw, 420px)';

/**
 * Playground sandbox.
 * Dark → neon energy. Light → engraved asset (logocreuse), soft fade-in.
 * Entrance plays once per visit — theme toggles swap instantly after that.
 */
export default function Playground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [revealed, setRevealed] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);

  // TEMP: lockscreen test rig. The lockscreen always shows here (storage is
  // never touched) and the playground entrance waits for it to dissolve.
  const [locked, setLocked] = useState(true);
  const [overlayGone, setOverlayGone] = useState(false);
  const [handoff, setHandoff] = useState(false);

  const dismissLock = () => {
    setLocked(false);
    // The lockscreen morph already settled its logo onto our logo's exact
    // geometry: light ours up immediately so the crossfade never dips to black
    setHandoff(true);
    setRevealed(true);
    window.setTimeout(() => setOverlayGone(true), OVERLAY_FADE_MS);
  };

  useEffect(() => {
    if (locked || revealed) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(true);
      setEntranceComplete(true);
      return;
    }
    const startId = window.setTimeout(() => setRevealed(true), 400);
    return () => window.clearTimeout(startId);
  }, [locked, revealed]);

  useEffect(() => {
    if (!revealed || entranceComplete) return;
    // Cover logo fade + stage fade before locking “ready” (no replay on theme swap)
    const doneId = window.setTimeout(() => setEntranceComplete(true), 3200);
    return () => window.clearTimeout(doneId);
  }, [revealed, entranceComplete]);

  const logoTransition = entranceComplete
    ? undefined
    : handoff
      ? `opacity ${OVERLAY_FADE_MS}ms ease-out`
      : 'opacity 2.6s ease-in-out 0.15s';

  const stageClass = !revealed
    ? ''
    : entranceComplete
      ? 'playground-stage-ready'
      : 'playground-stage-awake';

  // TEMP: lockscreen overlay, same crossfade as the real one in App.tsx
  const lockOverlay = !overlayGone && (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        opacity: locked ? 1 : 0,
        transition: `opacity ${OVERLAY_FADE_MS}ms ease-out`,
        pointerEvents: locked ? 'auto' : 'none',
      }}
    >
      <LockScreen onComplete={dismissLock} />
    </div>
  );

  if (!isDark) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f8f8f8]">
        <div className="relative z-[1] min-h-screen flex flex-col items-center justify-center px-4">
          <img
            src="/images/logocreuse.png"
            alt="Standottori logo"
            className="h-auto"
            style={{
              width: LOGO_WIDTH,
              opacity: revealed ? 1 : 0,
              transition: logoTransition,
            }}
          />
        </div>
        {lockOverlay}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000000]">
      <div
        aria-hidden="true"
        className={`playground-stage-bg absolute inset-0 ${stageClass}`}
        style={revealed ? undefined : { opacity: 0 }}
      />

      <div className="relative z-[1] min-h-screen flex flex-col items-center justify-center px-4">
        <img
          src="/images/logowsd.png"
          alt="Standottori logo"
          className="h-auto"
          style={{
            width: LOGO_WIDTH,
            filter: NEON_DARK,
            opacity: revealed ? 1 : 0,
            transition: logoTransition,
          }}
        />
      </div>
      {lockOverlay}
    </div>
  );
}
