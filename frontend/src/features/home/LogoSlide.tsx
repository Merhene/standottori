import { useTheme } from '../../hooks/useTheme';
import { OVERLAY_FADE_MS } from '../../hooks/useUnlock';

/** Full neon treatment (same recipe as the lockscreen reveal) */
const NEON_DARK = [
  'drop-shadow(0 0 4px #fff)',
  'drop-shadow(0 0 10px #ff2ec8)',
  'drop-shadow(0 0 24px #ff00aa)',
  'drop-shadow(0 0 48px #c00080)',
  'drop-shadow(0 0 80px rgba(179, 7, 179, 0.7))',
].join(' ');

/** Neon logo display width - MUST match the lockscreen reveal geometry */
const LOGO_WIDTH = 'min(70vw, 420px)';
/**
 * logocreuse is square with more padding than logowsd.
 * Scale so the ink bbox matches the neon logo's visual size.
 * (logowsd fill≈0.943 width, logocreuse fill≈0.709 -> x1.331)
 */
const LIGHT_LOGO_WIDTH = 'min(93.2vw, 559px)';

interface LogoSlideProps {
  /** Logo visible (entrance done or in progress) */
  revealed: boolean;
  /** Fast light-up synced with the lockscreen overlay fade */
  handoff: boolean;
  /** Entrance finished: idle flicker only, instant theme swaps */
  entranceComplete: boolean;
}

/**
 * First slide of the homepage carousel: the brand stage.
 * Dark -> neon logo over the glowing floor plate. Light -> engraved asset.
 * The logo sits at the EXACT spot where the lockscreen reveal leaves it,
 * so unlocking is a seamless crossfade with zero movement.
 */
export default function LogoSlide({ revealed, handoff, entranceComplete }: LogoSlideProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  if (!isDark) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#f8f8f8]">
        <div className="relative z-[1] w-full h-full flex flex-col items-center justify-center px-4">
          <img
            src="/images/logocreuse.png"
            alt="Standottori logo"
            className="h-auto select-none"
            style={{
              width: LIGHT_LOGO_WIDTH,
              opacity: revealed ? 1 : 0,
              transition: logoTransition,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#000000]">
      <div
        aria-hidden="true"
        className={`playground-stage-bg absolute inset-0 ${stageClass}`}
        style={revealed ? undefined : { opacity: 0 }}
      />

      <div className="relative z-[1] w-full h-full flex flex-col items-center justify-center px-4">
        <img
          src="/images/logowsd.png"
          alt="Standottori logo"
          className="h-auto select-none"
          style={{
            width: LOGO_WIDTH,
            filter: NEON_DARK,
            opacity: revealed ? 1 : 0,
            transition: logoTransition,
          }}
        />
      </div>
    </div>
  );
}
