import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <header className="sticky top-0 z-50 border-b border-light-text/10 dark:border-dark-text/10">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-medium">Standottori</h1>
          {/* Language toggle will go here */}
        </nav>
      </header>

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