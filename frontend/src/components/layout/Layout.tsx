import { Outlet, useLocation } from 'react-router-dom';
import PrimeHeader from './PrimeHeader';
// import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Homepage: carousel en fond, header transparent par-dessus
  if (isHomePage) {
    return (
      <div className="relative min-h-screen">
        {/* Carousel en fond (rendu par Home.tsx) */}
        <Outlet />
        
        {/* Header flottant par-dessus */}
        <div className="fixed top-0 left-0 right-0 z-10">
          <PrimeHeader transparent />
        </div>
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