import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LockScreen from './features/lockscreen/LockScreen';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Biography from './pages/Biography';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Info from './pages/Info';
import Contact from './pages/Contact';
import YouTube from './pages/YouTube';
import Legal from './pages/Legal';
import Privacy from './pages/Privacy';
import { ThemeProvider } from './hooks/useTheme';

const STORAGE_KEY = 'lockscreen-completed';

function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    const isUnlocked = localStorage.getItem(STORAGE_KEY) === '1';
    console.log('Initial unlock state:', isUnlocked);
    return isUnlocked;
  });

  const handleUnlock = () => {
    console.log('Unlocking app...');
    localStorage.setItem(STORAGE_KEY, '1');
    setUnlocked(true);
  };

  // Debug log when unlock state changes
  useEffect(() => {
    console.log('Unlock state changed:', unlocked);
  }, [unlocked]);

  return (
    <ThemeProvider>
      {unlocked ? (
        <div className="animate-fade-zoom-out">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}> 
                <Route index element={<Home />} />
                <Route path="biography" element={<Biography />} />
                <Route path="events" element={<Events />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="info" element={<Info />} />
                <Route path="contact" element={<Contact />} />
                <Route path="youtube" element={<YouTube />} />
                <Route path="legal" element={<Legal />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      ) : (
        <LockScreen onComplete={handleUnlock} />
      )}
    </ThemeProvider>
  );
}

export default App; 