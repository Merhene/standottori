import { useState, useEffect } from 'react';
import FixedBackground from '../../components/FixedBackground';

export default function GalleryBook() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [postNeonScroll, setPostNeonScroll] = useState(0); // Scroll après l'apparition du néon
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Détection mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Scroll handler
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = isMobile ? 2000 : 3000; // Moins de scroll sur mobile
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      // Scroll supplémentaire après le néon (pour la remontée du logo sur mobile)
      if (scrollY > maxScroll) {
        const postScroll = (scrollY - maxScroll) / 500; // 500px pour remonter complètement
        setPostNeonScroll(Math.min(postScroll, 1)); // Max 1 (= remonté complètement)
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

  // Valeurs responsive
  const logoWidth = isMobile ? '60%' : '25%'; // Logo plus grand sur mobile
  const initialScale = isMobile ? 200 : 165; // Zoom plus fort sur mobile
  
  // Scale de l'étoile : de initialScale à 1 (taille finale)
  const starScale = initialScale - (scrollProgress * (initialScale - 1));

  // Opacité du filtre blanc : progressif pendant le scroll (0 → 1), ralenti
  // Commence à 20% du scroll et atteint 100% à la fin
  const whiteFilterOpacity = Math.max(0, (scrollProgress - 0.2) / 0.8);

  // Opacité du fond noir : apparaît quand le filtre blanc atteint ~80%
  const blackOverlayOpacity = whiteFilterOpacity >= 0.8 ? 1 : 0;

  // Sur mobile : translation Y pour remonter le logo après l'apparition du néon
  // postNeonScroll va de 0 à 1 progressivement après que le néon soit apparu
  const mobileTranslateY = isMobile ? `${-postNeonScroll * 35}vh` : '0'; // 35vh = distance pour remonter sous le header

  return (
    <div style={{ margin: 0, padding: 0, minHeight: isMobile ? '400vh' : '500vh' }}>
      <FixedBackground src="/images/tattoingStan.png" alt="Tattooing Stan" />

      {/* Overlay noir - apparaît quand le dézoom est fini */}
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

      {/* Logo - sticky sous le header, zoom au centre */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          // Sur mobile : toujours centré (la remontée se fait via translateY)
          // Sur PC : toujours en haut
          alignItems: isMobile ? 'center' : 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Container pour le logo et le filtre blanc */}
        <div
          style={{
            position: 'relative',
            width: logoWidth,
            transform: `translateY(${mobileTranslateY}) scale(${starScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Filtre blanc - derrière le logo, légèrement réduit */}
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
          {/* Logo transparent (toujours visible) */}
          <img
            src="/images/logotrans-cutout.png"
            alt="Logo"
            style={{
              display: 'block',
              position: 'relative',
              width: '100%',
              height: 'auto',
              zIndex: 1,
            }}
          />
          {/* Logo néon (apparaît en fondu quand scrollProgress >= 1) */}
          <img
            src="/images/logoneon.png"
            alt="Logo Néon"
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

      {/* Spacer pour retarder l'apparition du texte jusqu'à la fin du scroll */}
      <div style={{ height: isMobile ? '2000px' : '3000px' }} />

      {/* Section avec texte */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          padding: isMobile ? '2rem 1rem' : '4rem',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ color: '#ffffff', fontSize: isMobile ? '2rem' : '3rem', marginBottom: isMobile ? '1rem' : '2rem' }}>
          Standottori
        </h2>
        <p style={{ color: '#ffffff', fontSize: isMobile ? '1rem' : '1.25rem', lineHeight: '1.8', maxWidth: '800px' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p style={{ color: '#ffffff', fontSize: isMobile ? '1rem' : '1.25rem', lineHeight: '1.8', maxWidth: '800px', marginTop: '1.5rem' }}>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>
  );
}
