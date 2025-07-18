import { Outlet } from 'react-router-dom';
import Header from './Header';
// import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">

      <Header />

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