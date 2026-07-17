import { Outlet, useLocation } from 'react-router-dom';
import PrimeHeader from './PrimeHeader';
import { useTheme } from '../../hooks/useTheme';

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;
  const { theme } = useTheme();

  const isHomePage = path === '/';
  const isGalleryPage = path === '/gallery';
  // Pages with their own scroll-driven layout keep a sticky header
  const isStickyHeaderPage =
    path === '/gallery/book' || path === '/gallery/flash' || path === '/biography';
  const isPlayground = path === '/playground';
  const isFullscreenPage =
    isHomePage || isGalleryPage || isStickyHeaderPage || isPlayground;

  // Fullscreen pages: transparent header over the page content
  if (isFullscreenPage) {
    return (
      <div className="relative min-h-screen">
        <div className={`${isStickyHeaderPage ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-10 w-full max-w-[100vw] overflow-x-hidden`}>
          <PrimeHeader transparent darkChrome={isPlayground && theme === 'light'} />
        </div>

        <Outlet />
      </div>
    );
  }

  // Other pages: classic layout
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <PrimeHeader />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-light-text/10 dark:border-dark-text/10">
        <div className="container mx-auto px-4 py-6 text-sm">
          <p className="text-center">
            &copy; {new Date().getFullYear()} Standottori. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
