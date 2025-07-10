import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Dot {
  id: number;
  x: number;
  y: number;
}

const DOTS: Dot[] = [
  { id: 1, x: 50, y: 0 },
  { id: 2, x: 100, y: 50 },
  { id: 3, x: 75, y: 100 },
  { id: 4, x: 25, y: 100 },
  { id: 5, x: 0, y: 50 },
  { id: 6, x: 50, y: 0 }, // repeat first for closing path
];

const STORAGE_KEY = 'lockscreen-completed';

export default function LockScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // auto complete after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      onComplete();
    }, 30000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleDotClick = (index: number) => {
    if (index !== progress) return; // must click in order
    if (index === DOTS.length - 1) {
      // finished
      localStorage.setItem(STORAGE_KEY, '1');
      onComplete();
      return;
    }
    setProgress(index + 1);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#171617] text-[#F4EDDE] select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-64 h-64"
        stroke="#F4EDDE"
        strokeWidth={2}
        fill="none"
      >
        {/* draw lines */}
        <polyline
          points={DOTS.slice(0, progress + 1)
            .map((d) => `${d.x},${d.y}`)
            .join(' ')}
        />
        {/* render dots */}
        {DOTS.slice(0, 5).map((dot, idx) => (
          <circle
            key={dot.id}
            cx={dot.x}
            cy={dot.y}
            r={3}
            className="cursor-pointer"
            onClick={() => handleDotClick(idx)}
          />
        ))}
      </svg>
      <p className="mt-4 animate-pulse text-center uppercase tracking-wider">
        {t('connect_dots')}
      </p>
    </div>
  );
} 