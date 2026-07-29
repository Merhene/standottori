import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LockScreen from './features/lockscreen/LockScreen';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Biography from './pages/Biography';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import YouTube from './pages/YouTube';
import Playground from './pages/Playground';
import Legal from './pages/Legal';
import Privacy from './pages/Privacy';
import GalleryBook from './pages/gallery/GalleryBook';
import GalleryFlash from './pages/gallery/GalleryFlash';
import ThemeProvider from './context/ThemeProvider';
import AuthProvider from './context/AuthProvider';
import RequireAdmin from './components/admin/RequireAdmin';
import { UnlockContext, OVERLAY_FADE_MS } from './hooks/useUnlock';
import { isSupabaseConfigured } from './lib/supabase';
import { getSiteSettings } from './lib/content';

// Admin pages are code-split: visitors never download them
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminBiography = lazy(() => import('./pages/admin/AdminBiography'));
const AdminInfo = lazy(() => import('./pages/admin/AdminInfo'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminGalleryTattoo = lazy(() => import('./pages/admin/gallery/AdminGalleryTattoo'));
const AdminGalleryFlash = lazy(() => import('./pages/admin/gallery/AdminGalleryFlash'));
const AdminGalleryWallpaper = lazy(() => import('./pages/admin/gallery/AdminGalleryWallpaper'));
const AdminGalleryCover = lazy(() => import('./pages/admin/gallery/AdminGalleryCover'));

const STORAGE_KEY = 'lockscreen-completed';

function AdminFallback() {
  return (
    <div className="p-6 flex justify-center">
      <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
    </div>
  );
}

/** Auto-dismiss the lockscreen if the visitor doesn't interact */
const LOCKSCREEN_TIMEOUT_MS = 20000;

function App() {
  const [unlocked, setUnlocked] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === '1'
  );
  // The overlay stays mounted during its fade-out, then unmounts entirely
  const [overlayGone, setOverlayGone] = useState<boolean>(unlocked);

  const dismissLockscreen = () => {
    // Always persist — pattern success AND timeout both count as completed
    localStorage.setItem(STORAGE_KEY, '1');
    setUnlocked(true);
    window.setTimeout(() => setOverlayGone(true), OVERLAY_FADE_MS);
  };

  // The artist can disable the lock screen from the admin settings
  useEffect(() => {
    if (unlocked || !isSupabaseConfigured) return;
    getSiteSettings()
      .then((settings) => {
        if (!settings.lockscreen_enabled) dismissLockscreen();
      })
      .catch(() => {
        // Settings unavailable: keep the lock screen (default behaviour)
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  // Auto-dismiss after idle: same persistence as a successful pattern
  useEffect(() => {
    if (unlocked) return;
    const id = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
      window.setTimeout(() => setOverlayGone(true), OVERLAY_FADE_MS);
    }, LOCKSCREEN_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [unlocked]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <UnlockContext.Provider value={{ unlocked }}>
        {/* The app always renders underneath: unlocking crossfades into it
            with no route change. The homepage logo lights up in the exact
            spot where the lockscreen reveal left it (see Home.tsx), so the
            app itself must not move - no zoom entrance here. */}
        <div>
          <BrowserRouter>
              <Suspense fallback={<AdminFallback />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="biography" element={<Biography />} />
                    <Route path="events" element={<Events />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="gallery/book" element={<GalleryBook />} />
                    <Route path="gallery/flash" element={<GalleryFlash />} />
                    <Route path="info" element={<Navigate to="/contact" replace />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="youtube" element={<YouTube />} />
                    <Route path="legal" element={<Legal />} />
                    <Route path="privacy" element={<Privacy />} />

                    <Route path="admin/login" element={<AdminLogin />} />
                    <Route element={<RequireAdmin />}>
                      {/* Dev sandbox — admin only, hidden from public nav */}
                      <Route path="playground" element={<Playground />} />
                      <Route path="admin" element={<Admin />} />
                      <Route path="admin/events" element={<AdminEvents />} />
                      <Route path="admin/gallery" element={<AdminGallery />} />
                      <Route path="admin/gallery/tattoo" element={<AdminGalleryTattoo />} />
                      <Route path="admin/gallery/flash" element={<AdminGalleryFlash />} />
                      <Route path="admin/gallery/wallpaper" element={<AdminGalleryWallpaper />} />
                      <Route path="admin/gallery/cover" element={<AdminGalleryCover />} />
                      <Route path="admin/biography" element={<AdminBiography />} />
                      <Route path="admin/info" element={<AdminInfo />} />
                      <Route path="admin/settings" element={<AdminSettings />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
          </BrowserRouter>
        </div>

        {/* Lockscreen overlay: dissolves into the page underneath on unlock */}
        {!overlayGone && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              opacity: unlocked ? 0 : 1,
              transition: `opacity ${OVERLAY_FADE_MS}ms ease-out`,
              pointerEvents: unlocked ? 'none' : 'auto',
            }}
          >
            <LockScreen onComplete={dismissLockscreen} />
          </div>
        )}
        </UnlockContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
