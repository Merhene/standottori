import { useState, useEffect } from 'react';
import FixedBackground from './FixedBackground';

interface ZoomRevealProps {
  backgroundSrc: string;
  backgroundAlt?: string;
  logoSrc: string;
  neonSrc: string;
  /** Content revealed after the zoom-out completes */
  children: React.ReactNode;
}

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
  neonSrc,
  children,
}: ZoomRevealProps) {
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
  const smallMobileInitialOffset = isSmallMobile ? -15 * (1 - scrollProgress) : 0;
  const mobileTranslateY = isMobile
    ? `${smallMobileInitialOffset - postNeonScroll * 35}vh`
    : '0';

  // Reduced motion: skip the scroll animation, show the final state directly
  if (prefersReducedMotion) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#171717' }}>
        <div className="flex justify-center pt-8">
          <img src={neonSrc} alt="Logo" style={{ width: 'min(60vw, 400px)', height: 'auto' }} />
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
          backgroundColor: '#171717',
          opacity: blackOverlayOpacity,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.1s ease-out',
        }}
      />

      {/* Logo - sticky under the header, zooms at the center */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          // Mobile: always centered (the move-up happens via translateY)
          // Desktop: always at the top
          alignItems: isMobile ? 'center' : 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Container for the logo and the white filter */}
        <div
          style={{
            position: 'relative',
            width: logoWidth,
            transform: `translateY(${mobileTranslateY}) scale(${starScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* White filter - behind the logo, slightly inset */}
          <div
            style={{
              position: 'absolute',
              top: '1px',
              left: '1px',
              right: '1px',
              bottom: '1px',
              backgroundColor: '#ffffff',
              opacity: whiteFilterOpacity,
              zIndex: 0,
              transition: 'opacity 0.05s ease-out',
            }}
          />
          {/* Transparent logo (always visible) */}
          <img
            src={logoSrc}
            alt="Logo"
            style={{
              display: 'block',
              position: 'relative',
              width: '100%',
              height: 'auto',
              zIndex: 1,
            }}
          />
          {/* Neon logo (fades in when scrollProgress >= 1) */}
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
              opacity: scrollProgress >= 1 ? 1 : 0,
              transition: 'opacity 0.5s ease-in',
              pointerEvents: 'none',
            }}
          />
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
