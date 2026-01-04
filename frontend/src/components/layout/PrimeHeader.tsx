import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

interface PrimeHeaderProps {
  transparent?: boolean;
  hideOnScroll?: boolean;
}

export default function PrimeHeader({ transparent = false, hideOnScroll = false }: PrimeHeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsHeaderVisible(false);
      } else {
        // Scrolling up
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, lastScrollY]);

  const changeLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');

  const menuItems = [
    { label: t('nav.biography'), path: '/biography' },
    { label: t('nav.events'), path: '/events' },
    { label: t('nav.gallery'), path: '/gallery' },
    { label: t('nav.info'), path: '/info' },
    { label: t('nav.contact'), path: '/contact' },
    { label: t('nav.youtube'), path: '/youtube' },
    { label: 'Creation', path: '/creation' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Logo selon le contexte
  const getLogoSrc = (isMobile: boolean) => {
    if (transparent) return '/images/logo.png'; // Homepage toujours blanc
    if (isMobile && isMenuOpen) return '/images/logo.png'; // Mobile menu ouvert = blanc
    return theme === 'dark' ? '/images/logo.png' : '/images/blacklogo.png';
  };
  
  // Classes pour le texte DESKTOP (jamais blanc sauf si transparent)
  const desktopTextClass = transparent
    ? 'text-white drop-shadow-lg' 
    : 'prime-header-link';

  // Classes pour le texte MOBILE (blanc si transparent OU menu ouvert)
  const mobileTextClass = (transparent || isMenuOpen)
    ? 'text-white drop-shadow-lg' 
    : 'prime-header-link';

  const shadowClass = (transparent && !isMenuOpen) ? '' : 'shadow-1';

  // Couleur de fond pour DESKTOP (jamais de filtre foncé)
  const getDesktopBgColor = () => {
    if (transparent) return 'transparent';
    return theme === 'dark' ? '#000000' : '#ffffff';
  };

  // Couleur de fond pour MOBILE/TABLETTE (filtre foncé quand menu ouvert)
  const getMobileBgColor = () => {
    if (isMenuOpen) return 'rgba(0, 0, 0, 0.85)';
    if (transparent) return 'transparent';
    return theme === 'dark' ? '#000000' : '#ffffff';
  };

  // Style de transformation pour hide on scroll
  const headerTransformStyle = hideOnScroll
    ? {
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-out',
      }
    : {};

  return (
    <>
      {/* Desktop Header */}
      <header 
        className={`hidden lg:block sticky top-0 z-5 ${transparent ? '' : 'shadow-1'} transition-colors duration-300`}
        style={{ backgroundColor: getDesktopBgColor(), ...headerTransformStyle }}
      >
        {/* Main header bar */}
        <div className="flex align-items-center justify-content-between px-4 py-3">
          {/* Left: Logo + Burger + Navigation tabs */}
          <div className="flex align-items-center gap-4">
            <Link to="/" className="flex align-items-center no-underline">
              <img 
                src={getLogoSrc(false)} 
                alt="Standottori logo" 
                style={{ height: '2.25rem', width: 'auto' }} 
                className={transparent ? 'drop-shadow-lg' : ''} 
              />
            </Link>
            
            {/* Animated Burger toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex align-items-center justify-content-center bg-transparent border-none cursor-pointer ${desktopTextClass}`}
              style={{ width: '40px', height: '40px' }}
              aria-label={isMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
              aria-expanded={isMenuOpen}
            >
              <div 
                className="relative"
                style={{ width: '24px', height: '20px' }}
              >
                {/* Trait 1 : en haut → devient vertical (partie haute de la croix) */}
                <span 
                  style={{ 
                    position: 'absolute',
                    width: '24px', 
                    height: '2px', 
                    backgroundColor: 'currentColor',
                    top: '0px',
                    left: '0px',
                    transformOrigin: 'center center',
                    transform: isMenuOpen 
                      ? 'rotate(90deg) translateX(5px)' 
                      : 'rotate(0deg) translateX(0)',
                    transition: 'transform 0.3s ease-out'
                  }} 
                />
                {/* Trait 2 : au milieu → reste horizontal, descend légèrement */}
                <span 
                  style={{ 
                    position: 'absolute',
                    width: '24px', 
                    height: '2px', 
                    backgroundColor: 'currentColor',
                    top: '9px',
                    left: '0px',
                    transformOrigin: 'center center',
                    transform: isMenuOpen 
                      ? 'translateY(5px)' 
                      : 'translateY(0)',
                    transition: 'transform 0.3s ease-out'
                  }} 
                />
                {/* Trait 3 : en bas → devient vertical (partie basse de la croix) */}
                <span 
                  style={{ 
                    position: 'absolute',
                    width: '24px', 
                    height: '2px', 
                    backgroundColor: 'currentColor',
                    top: '18px',
                    left: '0px',
                    transformOrigin: 'center center',
                    transform: isMenuOpen 
                      ? 'rotate(90deg) translateX(-5px)' 
                      : 'rotate(0deg) translateX(0)',
                    transition: 'transform 0.3s ease-out'
                  }} 
                />
              </div>
            </button>

            {/* Navigation tabs - inline, visible only when menu is open */}
            <nav 
              className={`flex align-items-center overflow-hidden transition-all duration-300 ease-out ${
                isMenuOpen ? 'max-w-screen opacity-100' : 'max-w-0 opacity-0'
              }`}
            >
              <ul className="flex align-items-center gap-4 list-none m-0 p-0 whitespace-nowrap">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`p-link text-sm font-medium uppercase tracking-wide hover:opacity-70 transition-opacity ${desktopTextClass}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right: Language toggle + Theme toggle */}
          <div className="flex align-items-center gap-3">
            <button onClick={changeLang} className={`p-link text-sm font-semibold ${desktopTextClass}`}>
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle transparent={transparent || isMenuOpen} />
          </div>
        </div>
      </header>

      {/* Mobile/Tablet header */}
      <header 
        className={`lg:hidden sticky top-0 z-5 ${shadowClass} transition-colors duration-300`}
        style={{ backgroundColor: getMobileBgColor(), ...headerTransformStyle }}
      >
        <div className="flex align-items-center justify-content-between px-3 py-2">
          {/* Left: Logo + Burger */}
          <div className="flex align-items-center gap-2">
            <Link to="/" className="flex align-items-center no-underline">
              <img 
                src={getLogoSrc(true)} 
                alt="Standottori logo" 
                style={{ height: '2.25rem', width: 'auto' }} 
                className={transparent ? 'drop-shadow-lg' : ''} 
              />
            </Link>
            
            {/* Animated Burger toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex align-items-center justify-content-center bg-transparent border-none cursor-pointer ${mobileTextClass}`}
              style={{ width: '40px', height: '40px' }}
              aria-label={isMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
              aria-expanded={isMenuOpen}
            >
              <div 
                className="relative"
                style={{ width: '24px', height: '20px' }}
              >
                {/* Trait 1 : en haut → devient vertical (partie haute de la croix) */}
                <span 
                  style={{ 
                    position: 'absolute',
                    width: '24px', 
                    height: '2px', 
                    backgroundColor: 'currentColor',
                    top: '0px',
                    left: '0px',
                    transformOrigin: 'center center',
                    transform: isMenuOpen 
                      ? 'rotate(90deg) translateX(5px)' 
                      : 'rotate(0deg) translateX(0)',
                    transition: 'transform 0.3s ease-out'
                  }} 
                />
                {/* Trait 2 : au milieu → reste horizontal, descend légèrement */}
                <span 
                  style={{ 
                    position: 'absolute',
                    width: '24px', 
                    height: '2px', 
                    backgroundColor: 'currentColor',
                    top: '9px',
                    left: '0px',
                    transformOrigin: 'center center',
                    transform: isMenuOpen 
                      ? 'translateY(5px)' 
                      : 'translateY(0)',
                    transition: 'transform 0.3s ease-out'
                  }} 
                />
                {/* Trait 3 : en bas → devient vertical (partie basse de la croix) */}
                <span 
                  style={{ 
                    position: 'absolute',
                    width: '24px', 
                    height: '2px', 
                    backgroundColor: 'currentColor',
                    top: '18px',
                    left: '0px',
                    transformOrigin: 'center center',
                    transform: isMenuOpen 
                      ? 'rotate(90deg) translateX(-5px)' 
                      : 'rotate(0deg) translateX(0)',
                    transition: 'transform 0.3s ease-out'
                  }} 
                />
              </div>
            </button>
          </div>

          {/* Right: Language toggle + Theme toggle */}
          <div className="flex align-items-center gap-3">
            <button onClick={changeLang} className={`p-link text-sm font-semibold ${mobileTextClass}`}>
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle transparent={transparent || isMenuOpen} />
          </div>
        </div>

        {/* Navigation tabs - visible only when menu is open */}
        <nav 
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isMenuOpen ? 'max-h-screen' : 'max-h-0'
          }`}
        >
          <ul className="flex flex-column gap-0 list-none m-0 p-0">
            {menuItems.map((item, index) => (
              <li 
                key={item.path}
                style={{
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.3s ease-out, transform 0.3s ease-out`,
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                <button
                  onClick={() => handleNavClick(item.path)}
                  className="p-link text-sm font-medium uppercase tracking-wide hover:opacity-70 transition-opacity text-white w-full text-left px-4 py-3 border-none bg-transparent"
                  style={{ display: 'block' }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
