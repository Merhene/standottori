import { Outlet, useLocation } from 'react-router-dom';
import PrimeHeader from './PrimeHeader';

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;

  const isHomePage = path === '/';
  const isGalleryHub = path === '/gallery';
  const isGalleryGrid = path === '/gallery/book' || path === '/gallery/flash';
  // Pages with their own scroll-driven layout keep a sticky header
  const isStickyHeaderPage = isGalleryGrid || path === '/biography';
  const isPlayground = path === '/playground';
  const isYouTube = path === '/youtube';
  const isEvents = path === '/events';
  const isFullscreenPage =
    isHomePage || isGalleryHub || isStickyHeaderPage || isPlayground || isYouTube;

  // Transparent everywhere; YouTube keeps white chrome on its dark arcade.
  const header = <PrimeHeader transparent forceLightChrome={isYouTube} />;

  // Fullscreen pages: header overlays the page (no classic footer chrome)
  if (isFullscreenPage) {
    return (
      <div className="relative min-h-screen">
        <div
          className={`${isStickyHeaderPage ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-10 w-full max-w-[100vw] overflow-x-hidden`}
        >
          {header}
        </div>

        <Outlet />
      </div>
    );
  }

  // Events: full-bleed map hero (no narrow container)
  if (isEvents) {
    return (
      <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <div className="sticky top-0 z-10 w-full max-w-[100vw] overflow-x-hidden">{header}</div>
        <main className="flex-grow w-full pt-6 md:pt-8">
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

  // Other pages: same transparent navbar, classic content + footer
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <div className="sticky top-0 z-10 w-full max-w-[100vw] overflow-x-hidden">{header}</div>

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
