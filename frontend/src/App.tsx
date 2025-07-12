import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LockScreen from './features/lockscreen/LockScreen';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Biography from './pages/Biography';

const STORAGE_KEY = 'lockscreen-completed';

function App() {
  const [unlocked, setUnlocked] = useState<boolean>(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY) === '1';
    setUnlocked(done);
  }, []);

  if (!unlocked) {
    return <LockScreen onComplete={() => setUnlocked(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="biography" element={<Biography />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
