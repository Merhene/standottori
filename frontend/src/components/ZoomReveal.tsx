import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FixedBackground from './FixedBackground';
import { useTheme } from '../hooks/useTheme';

interface ZoomRevealProps {
  backgroundSrc: string;
  backgroundAlt?: string;
  logoSrc: string;
  /** Light-mode variant of logoSrc (light plate, same cutout geometry) */
  logoLightSrc?: string;
  neonSrc: string;
  /** Engraved logo shown instead of the neon in light mode */
  lightSrc?: string;
  /** Content revealed after the zoom-out completes */
  children: React.ReactNode;
}

// Cutouts + finals share the same 3780×5000 canvas and logo placement, so
// neon / creuse overlay the cutout at 100% with no offset.
// Geometry: zoom through the clear window in the hexagram BODY (not the
// moon at the top tip). Hole ≈ 48.3% × 53.8%. Use a conservative clear
// radius — the star opening is irregular, so the fitted circle overstates
// the safe window and plate edges can leak at scroll 0.
const LOGO_ASPECT = 5000 / 3780;
const ORIGIN_X = 0.4825;
const ORIGIN_Y = 0.5376;
const TRANSPARENT_HALF_X = 72 / 3780;
const TRANSPARENT_HALF_Y = 72 / 3780;
const SCALE_SAFETY = 1.75;

/** After the zoom, keep this fraction of the viewport as a logo "beat". */
const LOGO_BEAT_FRACTION = {
  // Phones are tall: a large beat reads as empty air under the logo.
  mobile: 0.48,
  tablet: 0.58,
  desktop: 0.6,
} as const;

/**
 * Smallest scale at which the whole viewport fits inside the transparent
 * star window, i.e. the logo plate is fully invisible at scroll 0.
 */
function computeInitialScale(
  vw: number,
  vh: number,
  widthFraction: number,
  /** Vertically centered stage (phone + tablet). Desktop is top-aligned. */
  centeredStage: boolean,
  upwardOffsetFraction: number
): number {
  const containerWidth = vw * widthFraction;
  const containerHeight = containerWidth * LOGO_ASPECT;
  const tx = containerWidth * TRANSPARENT_HALF_X;
  const ty = containerWidth * TRANSPARENT_HALF_Y;

  // Star hole is nudged onto the viewport midline (see translateX below).
  const holeScreenX = vw / 2;
  const holeScreenY = centeredStage
    ? vh / 2 + containerHeight * (ORIGIN_Y - 0.5) - vh * upwardOffsetFraction
    : containerHeight * ORIGIN_Y;

  const horizontalNeed = Math.max(holeScreenX, vw - holeScreenX) / tx;
  const verticalNeed = Math.max(holeScreenY, vh - holeScreenY) / ty;

  return Math.ceil(Math.max(horizontalNeed, verticalNeed) * SCALE_SAFETY);
}

/**
 * Scroll-driven zoom-out reveal.
 *
 * The logo stays in a full-viewport sticky stage for the whole zoom (so
 * scale never crops). Once settled, the bio is pulled up to leave a short
 * intentional logo beat (~½–¾ viewport), then normal scroll carries both away.
 */
export default function ZoomReveal({
  backgroundSrc,
  backgroundAlt = 'Background',
  logoSrc,
  logoLightSrc,
  neonSrc,
  lightSrc,
  children,
}: ZoomRevealProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || !lightSrc;
  const pageBg = isDark ? '#171717' : '#f8f8f8';
  const ink = isDark ? '#f8f8f8' : '#171617';
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Match site chrome: mobile <768, tablet <1024 (header switches at lg), else desktop.
  const isMobile = viewport.width < 768;
  const isTablet = viewport.width >= 768 && viewport.width < 1024;
  const isSmallMobile = viewport.width <= 375;
  const centeredStage = isMobile || isTablet;
  const maxScroll = isMobile ? 2000 : isTablet ? 2500 : 3000;
  const navPad = isMobile ? 72 : isTablet ? 88 : 104;

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);

    const handleScroll = () => {
      setScrollProgress(Math.min(window.scrollY / maxScroll, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [maxScroll]);

  // Beat gate at the settle Y (same as the ↓ arrow):
  // scroll down → hard-stop there (no overshoot / jump-back) → release finger /
  // wheel → scroll down again to continue. Scroll up always free; re-arms the gate.
  useEffect(() => {
    if (prefersReducedMotion) return;

    type Phase = 'approaching' | 'atStop' | 'free';
    let phase: Phase = 'approaching';
    /** After landing on the stop, the current gesture must end before passing. */
    let passArmed = false;
    let touching = false;
    let wheelIdleTimer: number | null = null;
    let settleTimer: number | null = null;

    const clampToStop = () => {
      if (Math.abs(window.scrollY - maxScroll) > 0.5) {
        window.scrollTo({ top: maxScroll, behavior: 'auto' });
      }
    };

    const armPassAfterIdle = () => {
      if (settleTimer != null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleTimer = null;
        if (phase === 'atStop' && !touching && window.scrollY <= maxScroll + 2) {
          passArmed = true;
        }
      }, 120);
    };

    const enterStop = () => {
      phase = 'atStop';
      passArmed = false;
      clampToStop();
      armPassAfterIdle();
    };

    const onWheel = (e: WheelEvent) => {
      if (phase === 'free') return;

      if (wheelIdleTimer != null) window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(() => {
        wheelIdleTimer = null;
        if (phase === 'atStop') passArmed = true;
      }, 140);

      const y = window.scrollY;
      const down = e.deltaY > 0;

      if (!down) {
        if (y <= maxScroll + 1) {
          phase = 'approaching';
          passArmed = false;
        }
        return;
      }

      if (phase === 'atStop') {
        if (passArmed) {
          phase = 'free';
          return;
        }
        e.preventDefault();
        clampToStop();
        return;
      }

      // approaching — stop exactly at the beat, don't let this gesture past
      if (y >= maxScroll - 1 || y + e.deltaY >= maxScroll) {
        e.preventDefault();
        enterStop();
      }
    };

    const onScroll = () => {
      const y = window.scrollY;

      if (y < maxScroll - 40) {
        phase = 'approaching';
        passArmed = false;
        return;
      }

      if (phase === 'free') return;

      if (y > maxScroll + 0.5) {
        if (phase === 'approaching') {
          enterStop();
          return;
        }
        // atStop: hold until the landing gesture is over; then a new scroll may pass
        if (!passArmed) {
          clampToStop();
          return;
        }
        if (touching || y > maxScroll + 8) {
          phase = 'free';
        }
      } else if (phase === 'atStop' && !touching) {
        armPassAfterIdle();
      }
    };

    const onTouchStart = () => {
      touching = true;
      // New finger-down while already resting on the stop → next move may pass
      if (phase === 'atStop' && window.scrollY <= maxScroll + 2) {
        passArmed = true;
      }
    };
    const onTouchEnd = () => {
      touching = false;
      if (phase === 'atStop') armPassAfterIdle();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      if (wheelIdleTimer != null) window.clearTimeout(wheelIdleTimer);
      if (settleTimer != null) window.clearTimeout(settleTimer);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [maxScroll, prefersReducedMotion]);

  const logoWidthFraction = isSmallMobile ? 0.5 : isMobile ? 0.44 : isTablet ? 0.3 : 0.16;
  const logoWidth = `${logoWidthFraction * 100}%`;
  const logoPixelHeight = viewport.width * logoWidthFraction * LOGO_ASPECT;

  const initialScale = computeInitialScale(
    viewport.width,
    viewport.height,
    logoWidthFraction,
    centeredStage,
    isSmallMobile ? 0.15 : 0
  );

  const starScale = initialScale - scrollProgress * (initialScale - 1);
  const whiteFilterOpacity = Math.max(0, (scrollProgress - 0.2) / 0.8);
  const blackOverlayOpacity = whiteFilterOpacity >= 0.8 ? 1 : 0;

  const smallMobileInitialOffset = isSmallMobile ? -15 * (1 - scrollProgress) : 0;
  const navSettle = Math.min(1, Math.max(0, (scrollProgress - 0.85) / 0.15));

  // Keep the off-centre star hole on the viewport midline while zooming.
  const logoTranslateX = `${((0.5 - ORIGIN_X) * 100).toFixed(3)}%`;

  // Phone/tablet: stay flex-centered, ease the logo up under the nav.
  // Desktop: top-aligned, ease down below the nav.
  const centerToNav = (viewport.height - logoPixelHeight) / 2 - navPad;
  const logoTranslateY = centeredStage
    ? `calc(${smallMobileInitialOffset}vh - ${(navSettle * Math.max(0, centerToNav)).toFixed(1)}px)`
    : `${(navSettle * navPad).toFixed(1)}px`;

  // Pull the bio up only after the zoom is done — stage stays 100vh (no crop).
  const beatFraction = isMobile
    ? LOGO_BEAT_FRACTION.mobile
    : isTablet
      ? LOGO_BEAT_FRACTION.tablet
      : LOGO_BEAT_FRACTION.desktop;
  const contentPull =
    scrollProgress >= 1 ? Math.round(viewport.height * (1 - beatFraction)) : 0;

  // Less top padding on phone once the bio is pulled under the logo beat.
  const contentPadding = isMobile
    ? '0.25rem 1rem 2rem'
    : isTablet
      ? '1.5rem 2rem 2.5rem'
      : '4rem';

  // Land at the end of the zoom: neon logo still in view, bio text just below
  // (not scrolled so far that the heading hits the top of the screen).
  const scrollToContent = () => {
    window.scrollTo({
      top: maxScroll,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const showScrollHint = scrollProgress < 0.9;

  if (prefersReducedMotion) {
    const reducedWidth = isMobile
      ? 'min(50vw, 200px)'
      : isTablet
        ? 'min(36vw, 240px)'
        : 'min(22vw, 220px)';
    return (
      <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
        <div className="flex justify-center pt-24 pb-8">
          <img
            src={isDark ? neonSrc : lightSrc}
            alt="Logo"
            style={{ width: reducedWidth, height: 'auto' }}
          />
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: contentPadding }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <FixedBackground src={backgroundSrc} alt={backgroundAlt} />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: pageBg,
          opacity: blackOverlayOpacity,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.1s ease-out',
        }}
      />

      {/* Full-viewport sticky zoom stage — never shrink while scaling */}
      <div style={{ height: `calc(100vh + ${maxScroll}px)`, position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 6,
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: centeredStage ? 'center' : 'flex-start',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: logoWidth,
              // No CSS transition: scroll drives scale directly. A 0.1s ease
              // lagged behind fast flings and looked like the logo "slipped"
              // (worse with large initialScale from the portrait cutouts).
              transform: `translate(${logoTranslateX}, ${logoTranslateY}) scale(${starScale})`,
              transformOrigin: `${ORIGIN_X * 100}% ${ORIGIN_Y * 100}%`,
              willChange: 'transform',
            }}
          >
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                opacity: scrollProgress >= 1 ? 0 : 1,
                transition: 'opacity 0.5s ease-in',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '1px',
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  backgroundColor: isDark ? '#ffffff' : '#171617',
                  opacity: whiteFilterOpacity,
                  zIndex: 0,
                  transition: 'opacity 0.05s ease-out',
                }}
              />
              <img
                src={isDark || !logoLightSrc ? logoSrc : logoLightSrc}
                alt="Logo"
                style={{
                  display: 'block',
                  position: 'relative',
                  width: '100%',
                  height: 'auto',
                  zIndex: 1,
                }}
              />
            </div>
            <img
              src={neonSrc}
              alt="Logo néon"
              style={{
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 'auto',
                zIndex: 2,
                opacity: scrollProgress >= 1 && isDark ? 1 : 0,
                transition: isDark ? 'opacity 0.5s ease-in' : 'none',
                pointerEvents: 'none',
              }}
            />
            {lightSrc && (
              <img
                src={lightSrc}
                alt="Logo gravé"
                style={{
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 'auto',
                  zIndex: 3,
                  opacity: scrollProgress >= 1 && !isDark ? 1 : 0,
                  transition: 'opacity 0.5s ease-in',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Fixed outside the zoom stage so the oversized scale never covers it */}
      <button
        type="button"
        onClick={scrollToContent}
        aria-label={t('biography.scroll_to_content')}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.75rem',
          height: '2.75rem',
          border: `1px solid ${ink}`,
          borderRadius: '9999px',
          background: isDark ? 'rgba(23, 23, 23, 0.45)' : 'rgba(248, 248, 248, 0.55)',
          backdropFilter: 'blur(6px)',
          color: ink,
          opacity: showScrollHint ? 0.95 : 0,
          pointerEvents: showScrollHint ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
          cursor: 'pointer',
        }}
      >
        <i className="pi pi-angle-down text-xl animate-bounce" aria-hidden="true" />
      </button>

      {/* Bio pulled up after settle → short logo beat, then both scroll away */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          marginTop: -contentPull,
          padding: contentPadding,
          boxSizing: 'border-box',
          backgroundColor: pageBg,
        }}
      >
        {children}
      </div>
    </div>
  );
}
