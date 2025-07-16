import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

interface Dot {
  id: number;
  x: number;
  y: number;
  /**
   * Optional flag to display the moon icon on this dot. Only the first dot uses it.
   */
  hasMoon?: boolean;
}

const DOTS: Dot[] = [
  { id: 1, x: 50, y: -5 },
  { id: 2, x: 90, y: 85 },
  { id: 3, x: 10, y: 25 },
  { id: 4, x: 50, y: 120 },
  { id: 5, x: 90, y: 25 },
  { id: 6, x: 10, y: 85 },
  { id: 1, x: 50, y: -5 },
];

const STORAGE_KEY = 'lockscreen-completed';

// Toggle this to re-enable the 30-second auto-unlock timer
const ENABLE_AUTO_UNLOCK_TIMER = false;
// -----------------------
//  Customisation knobs
// -----------------------
const SHOW_NUMBERS = true; // set to false for a cleaner look
const DOT_RADIUS = 1; // svg units (out of 100) – smaller dot size
const GLOW_STD_DEVIATION = 2; // blur spread for neon effect

export default function LockScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number[]>([]); // indices of dots visited in order
  const { theme, toggleTheme } = useTheme();
  const strokeCol = theme === 'light' ? '#171617' : '#F4EDDE';
  const baseFill = theme === 'light' ? '#F4EDDE' : '#171617';
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    console.log('Lock screen mounted, progress:', selected.length);

    if (!ENABLE_AUTO_UNLOCK_TIMER) return; // skip timer in dev

    const timer = setTimeout(() => {
      console.log('Auto-complete timer triggered');
      localStorage.setItem(STORAGE_KEY, '1');
      onComplete();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onComplete, selected]);

  /* -----------------------
     Helpers
  ----------------------- */
  /**
   * Convert the pointer position from viewport (client) coordinates into the
   * SVG viewBox coordinate space (0-100). Using the native SVG point & CTM
   * utilities avoids small rounding errors that caused a visible gap between
   * the cursor and the preview line.
   */
  const getSvgCoords = useCallback((e: PointerEvent | React.PointerEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    // Transform to the SVG's coordinate system
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    return { x: svgPt.x, y: svgPt.y };
  }, []);

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const hitTestDot = useCallback((pos: { x: number; y: number }): number | null => {
    // Return index of hit dot (0-5) or null
    const HIT_RADIUS = 6; // in svg units (percent)
    for (let i = 0; i < 6; i++) {
      if (distance(pos, { x: DOTS[i].x, y: DOTS[i].y }) < HIT_RADIUS) return i;
    }
    return null;
  }, []);

  /* -----------------------
     Pointer handlers
  ----------------------- */
  const startDrag = (idx: number, e: React.PointerEvent) => {
    if (idx !== 0) return; // Must start with first dot according to expected pattern
    setSelected([0]);
    setIsDragging(true);
    setPointerPos(getSvgCoords(e));
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const pos = getSvgCoords(e);
    const idx = hitTestDot(pos);
    if (idx !== null) startDrag(idx, e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const pos = getSvgCoords(e);
    setPointerPos(pos);

    const idx = hitTestDot(pos);
    if (idx === null) return;

    // Case 1 – close the loop: after visiting all 6 unique dots, the user must
    // return to the starting dot (index 0). We do NOT require the pointer to
    // lift; as soon as they reach dot 1 again, we unlock.
    if (selected.length === 6 && idx === 0) {
      svgRef.current?.releasePointerCapture(e.pointerId);
      triggerUnlockSequence();
      return;
    }

    // Case 2 – progress through the star in strict order (0 → 1 → … → 5).
    if (!selected.includes(idx) && idx === selected.length) {
      setSelected((prev) => [...prev, idx]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointerPos(null);
    svgRef.current?.releasePointerCapture(e.pointerId);
    // Reset if pattern not complete (didn’t close the loop)
    if (selected.length < 6) {
      setSelected([]);
    }
  };

  /* -----------------------
     Click / key fallback (existing behaviour)
  ----------------------- */
  const handleDotClick = (index: number) => {
    if (isDragging) return; // ignore clicks during drag

    // Closing click (after visiting all six dots, click again on dot 1)
    if (selected.length === 6 && index === 0) {
      triggerUnlockSequence();
      return;
    }

    // Regular progression click (strict sequential order 0 → 5)
    if (index !== selected.length) return;
    setSelected((prev) => [...prev, index]);
  };

  const handleKeyPress = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDotClick(index);
    }
  };

  const renderMoon = (x: number, y: number) => (
    <path
      d="M -6,0 A 6,6 0 0 1 6,0 A 6,6 0 0 0 -6,0"
      transform={`translate(${x},${y - 12}) rotate(-30)`}
      style={{ fill: strokeCol }}
    />
  );

  /* -----------------------
     Unlock animation
  ----------------------- */
  const [isAnimating, setIsAnimating] = useState(false);
  const ANIMATION_DURATION = 600; // ms

  const triggerUnlockSequence = useCallback(() => {
    if (isAnimating) return; // avoid multiple triggers
    setIsAnimating(true);
    // After the short animation, notify parent to mount the app
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1');
      onComplete();
    }, ANIMATION_DURATION);
  }, [isAnimating, onComplete]);

  return (
    <div className="fixed inset-0 select-none flex items-center justify-center overflow-hidden relative" style={{ color: strokeCol }}>
      {/* Theme toggle */}
      {/* <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 md:top-6 md:right-6 text-3xl z-50 focus:outline-none bg-transparent"
        aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activate light mode'}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button> */}
      {/* Effet lumineux radial */}
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(100,100,100,0.15)_0%,transparent_70%)] rounded-full blur-2xl z-0"></div>

      <main
        className={`relative flex flex-col items-center px-6 py-8 z-10 transition-all duration-500
          ${isAnimating ? 'fixed inset-0 w-screen h-screen max-w-none' : 'w-full max-w-[400px] sm:max-w-[480px] md:max-w-[600px]'}`}
      >
        {/* Overlay to darken background during unlock animation */}
        <div className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'} z-0`} />

        <div
          className={`${isAnimating ? 'fixed inset-0 w-screen h-screen' : 'w-full aspect-[1/1.618]'}
            relative flex items-center justify-center z-10 overflow-visible`}
        >
          <svg
            style={{
              transform: isAnimating ? 'scale(4)' : 'scale(1)',
              opacity: isAnimating ? 0 : 1,
              transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
              width: isAnimating ? '100vw' : undefined,
              height: isAnimating ? '100vh' : undefined,
            }}
            ref={svgRef}
            viewBox="0 0 100 100"
            className="w-full h-full"
            stroke={strokeCol}
            strokeWidth={0.2}
            fill="none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="img"
            aria-label={t('connect_dots')}
          >
            {/* Neon glow filter */}
            <defs>
              <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={GLOW_STD_DEVIATION} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={`M ${DOTS.map((d) => `${d.x},${d.y}`).join(' L ')}`}
              className="opacity-5"
              strokeWidth={0.2}
            />

            {/* Draw lines for visited points */}
            <polyline
              points={selected.map((i) => `${DOTS[i].x},${DOTS[i].y}`).join(' ')}
              className={selected.length > 0 && !prefersReducedMotion ? 'animate-draw' : ''}
              strokeWidth={1}
              filter="url(#neon)"
            />

            {/* Preview line following the pointer */}
            {isDragging && pointerPos && selected.length > 0 && (
              <line
                x1={DOTS[selected[selected.length - 1]].x}
                y1={DOTS[selected[selected.length - 1]].y}
                x2={pointerPos.x}
                y2={pointerPos.y}
                stroke={strokeCol}
                strokeWidth={0.5}
                strokeLinecap="round"
                filter="url(#neon)"
              />
            )}

            {DOTS.slice(0, 6).map((dot, idx) => (
              <g key={`${dot.id}-${idx}`} className={idx === selected.length ? 'animate-pulse' : ''}>
                {dot.hasMoon && renderMoon(dot.x, dot.y)}

                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={DOT_RADIUS}
                  style={{ fill: idx <= selected.length ? strokeCol : 'transparent', stroke: strokeCol, strokeWidth: 0.1 }}
                  className="cursor-pointer transition-opacity hover:opacity-75"
                  onPointerDown={(e) => startDrag(idx, e)}
                  onClick={() => handleDotClick(idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  role="button"
                  aria-label={`Point ${dot.id}${idx === selected.length ? ' (next point to connect)' : ''}`}
                  tabIndex={0}
                />

                {SHOW_NUMBERS && (
                  <text
                    x={dot.x}
                    y={dot.y}
                    dy="-8"
                    textAnchor="middle"
                    className="text-[6px] font-light fill-current select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    {dot.id}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        <p className="mt-8 text-center uppercase tracking-[0.25em] font-light text-base text-[#aaa] animate-fade-in">
          {t('connect_dots')}
        </p>
      </main>
    </div>
  );
}