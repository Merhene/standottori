import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

interface PrimeHeaderProps {
  transparent?: boolean;
  hideOnScroll?: boolean;
}

/* Animated burger icon: three bars morphing into a cross */
function BurgerIcon({ isOpen }: { isOpen: boolean }) {
  const barStyle = (top: string, transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: '24px',
    height: '2px',
    backgroundColor: 'currentColor',
    top,
    left: 0,
    transformOrigin: 'center center',
    transform,
    transition: 'transform 0.3s ease-out',
  });

  return (
    <div className="relative" style={{ width: '24px', height: '20px' }}>
      <span style={barStyle('0px', isOpen ? 'rotate(90deg) translateX(5px)' : 'none')} />
      <span style={barStyle('9px', isOpen ? 'translateY(5px)' : 'none')} />
      <span style={barStyle('18px', isOpen ? 'rotate(90deg) translateX(-5px)' : 'none')} />
    </div>
  );
}

export default function PrimeHeader({ transparent = false, hideOnScroll = false }: PrimeHeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderVisible(currentScrollY <= lastScrollY.current || currentScrollY <= 100);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  const changeLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');

  const menuItems = [
    { label: t('nav.biography'), path: '/biography' },
    { label: t('nav.events'), path: '/events' },
    { label: t('nav.gallery'), path: '/gallery' },
    { label: t('nav.info'), path: '/info' },
    { label: t('nav.contact'), path: '/contact' },
    { label: t('nav.youtube'), path: '/youtube' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const getLogoSrc = (isMobile: boolean) => {
    if (transparent) return '/images/logo.png'; // Fullscreen pages: always white
    if (isMobile && isMenuOpen) return '/images/logo.png'; // Mobile menu open = white
    return theme === 'dark' ? '/images/logo.png' : '/images/blacklogo.png';
  };

  // Desktop text is only white when the header is transparent
  const desktopTextClass = transparent ? 'text-white drop-shadow-lg' : 'prime-header-link';

  // Mobile text is white when transparent OR menu is open (dark overlay)
  const mobileTextClass = transparent || isMenuOpen ? 'text-white drop-shadow-lg' : 'prime-header-link';

  const shadowClass = transparent && !isMenuOpen ? '' : 'shadow-md';

  const getDesktopBgColor = () => {
    if (transparent) return 'transparent';
    return theme === 'dark' ? '#000000' : '#ffffff';
  };

  const getMobileBgColor = () => {
    if (isMenuOpen) return 'rgba(0, 0, 0, 0.85)';
    if (transparent) return 'transparent';
    return theme === 'dark' ? '#000000' : '#ffffff';
  };

  const headerTransformStyle = hideOnScroll
    ? {
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-out',
      }
    : {};

  const navButtonClass =
    'bg-transparent border-none cursor-pointer text-sm font-medium uppercase tracking-wide hover:opacity-70 transition-opacity';

  return (
    <>
      {/* Desktop Header */}
      <header
        className={`hidden lg:block sticky top-0 z-10 ${transparent ? '' : 'shadow-md'} transition-colors duration-300`}
        style={{ backgroundColor: getDesktopBgColor(), ...headerTransformStyle }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo + Burger + Navigation tabs */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center no-underline">
              <img
                src={getLogoSrc(false)}
                alt="Standottori logo"
                style={{ height: '2.25rem', width: 'auto' }}
                className={transparent ? 'drop-shadow-lg' : ''}
              />
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center justify-center bg-transparent border-none cursor-pointer ${desktopTextClass}`}
              style={{ width: '40px', height: '40px' }}
              aria-label={isMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
              aria-expanded={isMenuOpen}
            >
              <BurgerIcon isOpen={isMenuOpen} />
            </button>

            {/* Navigation tabs - inline, visible only when menu is open */}
            <nav
              className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
                isMenuOpen ? 'max-w-[100vw] opacity-100' : 'max-w-0 opacity-0'
              }`}
            >
              <ul className="flex items-center gap-4 list-none m-0 p-0 whitespace-nowrap">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`${navButtonClass} ${desktopTextClass}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right: Language toggle + Theme toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={changeLang}
              className={`bg-transparent border-none cursor-pointer text-sm font-semibold ${desktopTextClass}`}
            >
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle transparent={transparent || isMenuOpen} />
          </div>
        </div>
      </header>

      {/* Mobile/Tablet header */}
      <header
        className={`lg:hidden sticky top-0 z-10 ${shadowClass} transition-colors duration-300`}
        style={{ backgroundColor: getMobileBgColor(), ...headerTransformStyle }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left: Logo + Burger */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center no-underline">
              <img
                src={getLogoSrc(true)}
                alt="Standottori logo"
                style={{ height: '2.25rem', width: 'auto' }}
                className={transparent ? 'drop-shadow-lg' : ''}
              />
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center justify-center bg-transparent border-none cursor-pointer ${mobileTextClass}`}
              style={{ width: '40px', height: '40px' }}
              aria-label={isMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
              aria-expanded={isMenuOpen}
            >
              <BurgerIcon isOpen={isMenuOpen} />
            </button>
          </div>

          {/* Right: Language toggle + Theme toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={changeLang}
              className={`bg-transparent border-none cursor-pointer text-sm font-semibold ${mobileTextClass}`}
            >
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
          <ul className="flex flex-col gap-0 list-none m-0 p-0">
            {menuItems.map((item, index) => (
              <li
                key={item.path}
                style={{
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                }}
              >
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`${navButtonClass} block text-white w-full text-left px-4 py-3`}
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
