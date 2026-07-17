import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

interface PrimeHeaderProps {
  transparent?: boolean;
  hideOnScroll?: boolean;
  /** Dark icons/text over a light surface (e.g. playground light mode) */
  darkChrome?: boolean;
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

export default function PrimeHeader({
  transparent = false,
  hideOnScroll = false,
  darkChrome = false,
}: PrimeHeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

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
    { label: t('nav.playground'), path: '/playground' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Mobile open menu uses a dark overlay → white chrome there only.
  // Desktop open menu stays on the light playground surface → keep dark chrome.
  const desktopDarkChrome = darkChrome;
  const mobileDarkChrome = darkChrome && !isMenuOpen;

  const getLogoSrc = (isMobile: boolean) => {
    if (isMobile && isMenuOpen) return '/images/logo.png';
    if (darkChrome) return '/images/blacklogo.png';
    if (transparent) return '/images/logo.png';
    return theme === 'dark' ? '/images/logo.png' : '/images/blacklogo.png';
  };

  const lightTextClass = 'text-white drop-shadow-lg';
  const darkTextClass = 'text-neutral-900';

  const desktopTextClass = transparent
    ? desktopDarkChrome
      ? darkTextClass
      : lightTextClass
    : 'prime-header-link';

  const mobileTextClass =
    transparent || isMenuOpen
      ? mobileDarkChrome
        ? darkTextClass
        : lightTextClass
      : 'prime-header-link';

  const shadowClass = transparent && !isMenuOpen ? '' : 'shadow-md';
  const desktopLogoShadow = transparent && !desktopDarkChrome ? 'drop-shadow-lg' : '';
  const mobileLogoShadow = transparent && !mobileDarkChrome ? 'drop-shadow-lg' : '';
  const desktopThemeToggleLight = transparent && !desktopDarkChrome;
  const mobileThemeToggleLight = (transparent && !mobileDarkChrome) || isMenuOpen;

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
        className={`hidden lg:block sticky top-0 z-10 w-full max-w-full overflow-x-hidden ${transparent ? '' : 'shadow-md'} transition-colors duration-300`}
        style={{ backgroundColor: getDesktopBgColor(), ...headerTransformStyle }}
      >
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden">
            <Link to="/" className="flex shrink-0 items-center no-underline">
              <img
                src={getLogoSrc(false)}
                alt="Standottori logo"
                style={{ height: '2.25rem', width: 'auto' }}
                className={desktopLogoShadow}
              />
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex shrink-0 items-center justify-center bg-transparent border-none cursor-pointer ${desktopTextClass}`}
              style={{ width: '40px', height: '40px' }}
              aria-label={isMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
              aria-expanded={isMenuOpen}
            >
              <BurgerIcon isOpen={isMenuOpen} />
            </button>

            {/*
              min-w-0 is required: without it, collapsed nav labels still
              contribute min-content width and push lang/theme off-screen
              (common on tablet widths that use this desktop header).
            */}
            <nav
              className={`flex min-w-0 items-center overflow-hidden transition-[max-width,opacity] duration-300 ease-out ${
                isMenuOpen ? 'max-w-[min(100%,70vw)] opacity-100' : 'max-w-0 opacity-0'
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

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={changeLang}
              className={`bg-transparent border-none cursor-pointer text-sm font-semibold ${desktopTextClass}`}
            >
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle transparent={desktopThemeToggleLight} />
          </div>
        </div>
      </header>

      {/* Mobile/Tablet header */}
      <header
        className={`lg:hidden sticky top-0 z-10 w-full max-w-full overflow-x-hidden ${shadowClass} transition-colors duration-300`}
        style={{ backgroundColor: getMobileBgColor(), ...headerTransformStyle }}
      >
        <div className="flex w-full items-center justify-between gap-2 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/" className="flex shrink-0 items-center no-underline">
              <img
                src={getLogoSrc(true)}
                alt="Standottori logo"
                style={{ height: '2.25rem', width: 'auto', maxWidth: '9rem' }}
                className={mobileLogoShadow}
              />
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex shrink-0 items-center justify-center bg-transparent border-none cursor-pointer ${mobileTextClass}`}
              style={{ width: '40px', height: '40px' }}
              aria-label={isMenuOpen ? t('nav.close_menu') : t('nav.open_menu')}
              aria-expanded={isMenuOpen}
            >
              <BurgerIcon isOpen={isMenuOpen} />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={changeLang}
              className={`bg-transparent border-none cursor-pointer text-sm font-semibold ${mobileTextClass}`}
            >
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <ThemeToggle transparent={mobileThemeToggleLight} />
          </div>
        </div>

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
