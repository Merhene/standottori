import { Outlet, useLocation } from 'react-router-dom';
import PrimeHeader from './PrimeHeader';
// import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isGalleryPage = location.pathname === '/gallery';
  const isGalleryBookPage = location.pathname === '/gallery/book';
  const isGalleryFlashPage = location.pathname === '/gallery/flash';
  const isFullscreenPage = isHomePage || isGalleryPage || isGalleryBookPage || isGalleryFlashPage;
  const isStickyHeaderPage = isGalleryBookPage || isGalleryFlashPage;

  // Fullscreen pages: header transparent par-dessus le contenu
  if (isFullscreenPage) {
    return (
      <div className="relative min-h-screen">
        {/* Header - sticky pour book/flash, fixed pour les autres */}
        <div className={`${isStickyHeaderPage ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-10`}>
          <PrimeHeader transparent />
        </div>

        {/* Contenu en fond (rendu par la page) */}
        <Outlet />
      </div>
    );
  }

  // Autres pages: layout classique
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <PrimeHeader />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-light-text/10 dark:border-dark-text/10">
        <div className="container mx-auto px-4 py-6 text-sm">
          <p className="text-center">&copy; {new Date().getFullYear()} Standottori. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 