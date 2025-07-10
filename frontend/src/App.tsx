import { useEffect, useState } from 'react';
import LockScreen from './features/lockscreen/LockScreen';

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
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold">Welcome to Standottori Portfolio</h1>
      <p className="mt-4">Site content coming soon…</p>
    </div>
  );
}

export default App;
