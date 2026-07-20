import { useState, useEffect } from 'react';
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

// logocreuse.png (1024x1024, transparent) vs logoneon.png (1920x1080, opaque
// plate): measured from their alpha/ink bounding boxes so the engraved logo
// overlays the neon's ink exactly (same shape, different padding).
// width = (740/1920) / (724/1024); left/top align the two ink centres
// (top is relative to the container height, i.e. width * 1080/1920).
const LIGHT_LOGO_WIDTH_PCT = 54.5;
const LIGHT_LOGO_LEFT_PCT = 22.43;
const LIGHT_LOGO_TOP_PCT = -2.15;

// Geometry of logotrans-cutout.png (1920x1080), measured from its alpha
// channel: the transparent "window" around the image centre extends
// ±30px horizontally and ±17px vertically. At the start of the animation the
// viewport must stay inside that window, otherwise the logo's ink is visible.
const LOGO_ASPECT = 1080 / 1920;
const TRANSPARENT_HALF_X = 30 / 1920; // fraction of the displayed logo width
const TRANSPARENT_HALF_Y = 17 / 1920;
const SCALE_SAFETY = 1.3;

/**
 * Smallest scale at which the whole viewport fits inside the transparent
 * centre of the logo, i.e. the logo is fully invisible at scroll 0.
 */
function computeInitialScale(
  vw: number,
  vh: number,
  widthFraction: number,
  isMobile: boolean,
  upwardOffsetFraction: number
): number {
  const containerWidth = vw * widthFraction;
  const tx = containerWidth * TRANSPARENT_HALF_X;
  const ty = containerWidth * TRANSPARENT_HALF_Y;
  const containerHeight = containerWidth * LOGO_ASPECT;

  const horizontalNeed = vw / 2 / tx;
  // Mobile: container vertically centered (plus optional upward offset).
  // Desktop: container top-aligned, so the viewport extends far below centre.
  const verticalReach = isMobile
    ? vh * (0.5 + upwardOffsetFraction)
    : vh - containerHeight / 2;
  const verticalNeed = verticalReach / ty;

  return Math.ceil(Math.max(horizontalNeed, verticalNeed) * SCALE_SAFETY);
}

/**
 * Scroll-driven zoom-out reveal.
 *
 * The logo starts zoomed in so much that it is invisible at the top of the
 * page. As the user scrolls, it zooms out until it fully replaces the
 * background, then a neon version fades in and the content appears.
 *
 * Extracted from the original /gallery/book page experiment; the starting
 * zoom is computed per viewport instead of hardcoded so no logo edge is
 * visible at scroll 0 on any screen size.
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
  const { theme } = useTheme();
  const isDark = theme === 'dark' || !lightSrc;
  // Page surface once the zoom is done (matches the playground light mode)
  const pageBg = isDark ? '#171717' : '#f8f8f8';
  const pageBgTransparent = isDark ? 'rgba(23, 23, 23, 0)' : 'rgba(248, 248, 248, 0)';
  const [scrollProgress, setScrollProgress] = useState(0);
  const [postNeonScroll, setPostNeonScroll] = useState(0); // Scroll after the neon appears
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile = viewport.width < 768;
  const isSmallMobile = viewport.width <= 375;

  useEffect(() => {
    const checkMobile = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = isMobile ? 2000 : 3000; // Less scroll on mobile
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Extra scroll after the neon (moves the logo back up on mobile)
      if (scrollY > maxScroll) {
        const postScroll = (scrollY - maxScroll) / 500; // 500px to fully move up
        setPostNeonScroll(Math.min(postScroll, 1));
      } else {
        setPostNeonScroll(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // Responsive values
  const logoWidthFraction = isSmallMobile ? 0.7 : isMobile ? 0.6 : 0.25;
  const logoWidth = `${logoWidthFraction * 100}%`;

  // Starting zoom: computed so the logo is guaranteed invisible at scroll 0
  // (the -15vh small-mobile offset shifts the viewport, hence the extra reach)
  const initialScale = computeInitialScale(
    viewport.width,
    viewport.height,
    logoWidthFraction,
    isMobile,
    isSmallMobile ? 0.15 : 0
  );

  // Star scale: from initialScale down to 1 (final size)
  const starScale = initialScale - scrollProgress * (initialScale - 1);

  // White filter opacity: progressive during scroll (0 -> 1), starts at 20%
  const whiteFilterOpacity = Math.max(0, (scrollProgress - 0.2) / 0.8);

  // Black overlay: appears once the white filter reaches ~80%
  const blackOverlayOpacity = whiteFilterOpacity >= 0.8 ? 1 : 0;

  // On mobile: Y translation to move the logo up after the neon appears.
  // On small screens: initial upward offset that fades out with scroll.
  // 25vh (not 35) so the final position stays below the navbar.
  const smallMobileInitialOffset = isSmallMobile ? -15 * (1 - scrollProgress) : 0;
  const mobileTranslateY = isMobile
    ? `${smallMobileInitialOffset - postNeonScroll * 25}vh`
    : '0';

  // Desktop final settle: over the last 15% of the zoom, ease the logo down
  // below the transparent navbar. Zero effect on the rest of the animation.
  const navSettle = Math.min(1, Math.max(0, (scrollProgress - 0.85) / 0.15));
  const logoTranslateY = isMobile ? mobileTranslateY : `${(navSettle * 104).toFixed(1)}px`;

  // Text end zone: bottom edge of the logo at its final resting position.
  // Desktop: top-aligned + 104px settle. Mobile: centered then moved up 25vh.
  const logoContainerHeight = viewport.width * logoWidthFraction * LOGO_ASPECT;
  const logoFinalBottom = Math.round(
    isMobile
      ? viewport.height * 0.25 + logoContainerHeight / 2
      : 104 + logoContainerHeight
  );
  const endZoneFade = 40;
  const endZoneHeight = logoFinalBottom + endZoneFade;

  // Reduced motion: skip the scroll animation, show the final state directly
  if (prefersReducedMotion) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: pageBg }}>
        <div className="flex justify-center pt-24">
          <img
            src={isDark ? neonSrc : lightSrc}
            alt="Logo"
            style={{ width: 'min(60vw, 400px)', height: 'auto' }}
          />
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '2rem 1rem' }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, minHeight: isMobile ? '400vh' : '500vh' }}>
      <FixedBackground src={backgroundSrc} alt={backgroundAlt} />

      {/* Black overlay - appears when the zoom-out is done */}
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

      {/*
        Text end zone: invisible band (same colour as the page) covering
        navbar + logo area. Text scrolling up dissolves right under the logo.
        Above content (z2), below the logo layer (z6) and header (z10).
        Only active once the zoom is done, so it never covers the animation.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: `${endZoneHeight}px`,
          background: `linear-gradient(to bottom, ${pageBg} ${logoFinalBottom}px, ${pageBgTransparent} 100%)`,
          opacity: scrollProgress >= 1 ? 1 : 0,
          zIndex: 5,
          pointerEvents: 'none',
          transition: 'opacity 0.5s ease-in',
        }}
      />

      {/* Logo - sticky under the header, zooms at the center.
          z6: above the end-zone band (z5) so the neon stays visible;
          pointerEvents none so text below stays clickable/selectable. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 6,
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          // Mobile: always centered (the move-up happens via translateY)
          // Desktop: always at the top
          alignItems: isMobile ? 'center' : 'flex-start',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Container for the logo and the white filter */}
        <div
          style={{
            position: 'relative',
            width: logoWidth,
            transform: `translateY(${logoTranslateY}) scale(${starScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Cutout group: plate + ink backing fade out as ONE composited
              layer in light mode. Fading them separately lets the dark
              backing bleed through the semi-transparent plate mid-fade
              (the "dark rectangle" at the end of the animation). */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              opacity: scrollProgress >= 1 && !isDark ? 0 : 1,
              transition: 'opacity 0.5s ease-in',
            }}
          >
            {/* Ink backing - behind the logo, slightly inset; shows through
                the cutout holes. White ink in dark mode, dark in light. */}
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
            {/* Transparent cutout logo. Light mode uses the dedicated
                light-plate asset so it melts into the page background. */}
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
          {/* Neon logo - dark mode final state. Fades in at the end of the
              zoom, but disappears INSTANTLY on a dark->light theme switch:
              fading it out would show its opaque dark plate blended over the
              light page (dark rectangle during the transition). */}
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
          {/* Engraved logo - light mode final state, sized/offset so its ink
              matches the neon's ink exactly (different source paddings) */}
          {lightSrc && (
            <img
              src={lightSrc}
              alt="Logo gravé"
              style={{
                display: 'block',
                position: 'absolute',
                top: `${LIGHT_LOGO_TOP_PCT}%`,
                left: `${LIGHT_LOGO_LEFT_PCT}%`,
                width: `${LIGHT_LOGO_WIDTH_PCT}%`,
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

      {/* Spacer to delay the content until the scroll animation ends */}
      <div style={{ height: isMobile ? '2000px' : '3000px' }} />

      {/* Revealed content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          padding: isMobile ? '2rem 1rem' : '4rem',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}
