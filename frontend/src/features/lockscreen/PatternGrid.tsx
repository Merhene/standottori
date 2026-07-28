import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './PatternGrid.css';

interface PatternGridProps {
  onPatternSuccess?: () => void; // Callback for successful pattern validation
}

interface Point {
  id: string;
  x: number;
  y: number;
}

// Define point coordinates (matching CSS positions)
const POINTS: Point[] = [
  { id: 'a', x: 50, y: 5 },
  { id: 'b', x: 85, y: 30 },
  { id: 'c', x: 85, y: 70 },
  { id: 'd', x: 50, y: 95 },
  { id: 'e', x: 15, y: 70 },
  { id: 'f', x: 15, y: 30 },
];

// Correct pattern sequence
const CORRECT_PATTERN = ['a', 'c', 'f', 'd', 'b', 'e', 'a'];

// Duration of the neon energy flowing through the completed pattern.
// Keep in sync with the energyFill/energyHead animations in PatternGrid.css.
const ENERGY_FILL_MS = 1500;

// Discreet guide numbers: order in which the nodes must be connected
const NODE_ORDER: Record<string, number> = {};
CORRECT_PATTERN.forEach((id) => {
  if (!(id in NODE_ORDER)) NODE_ORDER[id] = Object.keys(NODE_ORDER).length + 1;
});

// Lines stop just short of the dots (in viewBox units, i.e. % of container)
const NODE_GAP = 2;

// Idle time before the "slide to connect" finger hint appears
const HINT_DELAY_MS = 5000;

// Helper function to compare two arrays
function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index]);
}

const PatternGrid: React.FC<PatternGridProps> = ({ onPatternSuccess }) => {
  const { t } = useTranslation();
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPointer, setCurrentPointer] = useState<{ x: number; y: number } | null>(null);
  const [validationState, setValidationState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Refs mirror state so move/up handlers see the latest values synchronously
  // (touchmove often fires before React re-renders after pointerdown).
  const isDrawingRef = useRef(false);
  const selectedPointsRef = useRef<string[]>([]);

  useEffect(() => {
    selectedPointsRef.current = selectedPoints;
  }, [selectedPoints]);

  // Finger hint after a few idle seconds; hides on interaction, re-arms
  // whenever the pattern is empty again (e.g. after a reset)
  useEffect(() => {
    if (isDrawing || selectedPoints.length > 0 || validationState !== 'idle') {
      setShowHint(false);
      return;
    }
    const id = window.setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [isDrawing, selectedPoints.length, validationState]);

  const resetPattern = () => {
    isDrawingRef.current = false;
    selectedPointsRef.current = [];
    setSelectedPoints([]);
    setIsDrawing(false);
    setCurrentPointer(null);
    setValidationState('idle');
    setErrorMessage('');
    setIsShaking(false);
  };

  // Validate the pattern
  const validatePattern = useCallback((pattern: string[]) => {
    const isCorrect = arraysEqual(pattern, CORRECT_PATTERN);
    
    if (isCorrect) {
      setValidationState('success');
      // Trigger success callback after a short delay to show success state
      setTimeout(() => {
        onPatternSuccess?.();
      }, 500);
    } else {
      setValidationState('error');
      setErrorMessage(t('lockscreen.error'));
      setIsShaking(true);
      
      // Auto-clear error after 2 seconds
      setTimeout(() => {
        resetPattern();
      }, 2000);
      
      // Stop shaking after animation completes
      setTimeout(() => {
        setIsShaking(false);
      }, 600);
    }
  }, [onPatternSuccess, t]);

  // Convert screen coordinates to container-relative percentages
  const getContainerCoordinates = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    return { x, y };
  }, []);

  // Check if pointer is over a specific point (with some tolerance)
  const getPointUnderPointer = useCallback((pointerX: number, pointerY: number): string | null => {
    // Slightly larger on coarse pointers (fingers) via CSS media is harder here;
    // 12% of the container ≈ generous finger hit target on phones.
    const tolerance = 12;

    for (const point of POINTS) {
      const dx = Math.abs(pointerX - point.x);
      const dy = Math.abs(pointerY - point.y);

      if (dx <= tolerance && dy <= tolerance) {
        return point.id;
      }
    }

    return null;
  }, []);

  const handlePointInteraction = useCallback((pointId: string) => {
    setSelectedPoints((prev) => {
      if (prev.length === 0) {
        isDrawingRef.current = true;
        setIsDrawing(true);
        const next = [pointId];
        selectedPointsRef.current = next;
        return next;
      }

      const isAlreadySelected = prev.includes(pointId);

      // Allow selecting the first point again to close the loop
      if (isAlreadySelected && pointId === prev[0] && prev.length > 1) {
        isDrawingRef.current = false;
        setIsDrawing(false);
        setCurrentPointer(null);
        const completedPattern = [...prev, pointId];
        selectedPointsRef.current = completedPattern;

        setTimeout(() => {
          validatePattern(completedPattern);
        }, 100);

        return completedPattern;
      }

      if (isAlreadySelected) {
        return prev;
      }

      const next = [...prev, pointId];
      selectedPointsRef.current = next;
      return next;
    });
  }, [validatePattern]);

  // Unified Pointer Events (mouse + touch + pen). Capture on the container so
  // move/up keep firing even when the finger leaves the starting node.
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, pointId: string) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      e.stopPropagation();

      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // Older browsers may reject capture; move still works while over the container
      }

      isDrawingRef.current = true;
      setIsDrawing(true);
      handlePointInteraction(pointId);

      const coords = getContainerCoordinates(e.clientX, e.clientY);
      if (coords) setCurrentPointer(coords);
    },
    [handlePointInteraction, getContainerCoordinates]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();

      const coords = getContainerCoordinates(e.clientX, e.clientY);
      if (!coords) return;

      setCurrentPointer(coords);

      const pointUnder = getPointUnderPointer(coords.x, coords.y);
      if (pointUnder) handlePointInteraction(pointUnder);
    },
    [getContainerCoordinates, getPointUnderPointer, handlePointInteraction]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();

      try {
        if (containerRef.current?.hasPointerCapture(e.pointerId)) {
          containerRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }

      isDrawingRef.current = false;
      setIsDrawing(false);
      setCurrentPointer(null);

      const pattern = selectedPointsRef.current;
      window.setTimeout(() => {
        if (pattern.length > 1) {
          const lastPoint = pattern[pattern.length - 1];
          const firstPoint = pattern[0];
          if (lastPoint !== firstPoint) {
            validatePattern(pattern);
          }
        }
      }, 100);
    },
    [validatePattern]
  );

  // Get coordinates for a point by ID
  const getPointById = (id: string): Point | undefined => {
    return POINTS.find(point => point.id === id);
  };

  // Drawn lines as separate hairline segments, each trimmed so it starts and
  // ends at the edge of the node rings (never crossing them)
  const generatePath = (): string => {
    if (selectedPoints.length < 2) return '';

    const parts: string[] = [];
    for (let i = 0; i < selectedPoints.length - 1; i++) {
      const p1 = getPointById(selectedPoints[i]);
      const p2 = getPointById(selectedPoints[i + 1]);
      if (!p1 || !p2) continue;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len <= NODE_GAP * 2) continue;

      const ux = dx / len;
      const uy = dy / len;
      parts.push(
        `M ${(p1.x + ux * NODE_GAP).toFixed(2)} ${(p1.y + uy * NODE_GAP).toFixed(2)} ` +
          `L ${(p2.x - ux * NODE_GAP).toFixed(2)} ${(p2.y - uy * NODE_GAP).toFixed(2)}`
      );
    }
    return parts.join(' ');
  };

  // Generate preview line from last selected point to current pointer
  const generatePreviewPath = (): string => {
    if (!isDrawing || selectedPoints.length === 0 || !currentPointer) return '';

    const lastPoint = getPointById(selectedPoints[selectedPoints.length - 1]);
    if (!lastPoint) return '';

    const dx = currentPointer.x - lastPoint.x;
    const dy = currentPointer.y - lastPoint.y;
    const len = Math.hypot(dx, dy);
    if (len <= NODE_GAP) return '';

    const ux = dx / len;
    const uy = dy / len;
    return (
      `M ${(lastPoint.x + ux * NODE_GAP).toFixed(2)} ${(lastPoint.y + uy * NODE_GAP).toFixed(2)} ` +
      `L ${currentPointer.x.toFixed(2)} ${currentPointer.y.toFixed(2)}`
    );
  };

  // Energy path: same figure but traced from the LAST touched node backwards,
  // so the neon flows from where the finger lifted through the whole pattern
  const generateEnergyPath = (): string => {
    if (selectedPoints.length < 2) return '';

    return [...selectedPoints]
      .reverse()
      .map((id, index) => {
        const point = getPointById(id);
        if (!point) return '';
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ');
  };

  // For each node: at which fraction of the energy travel the head reaches it,
  // so the dots ignite exactly when the light passes through them
  const getIgnitionDelays = (): Record<string, number> => {
    const reversed = [...selectedPoints].reverse();
    const cumulative: number[] = [0];
    let total = 0;

    for (let i = 1; i < reversed.length; i++) {
      const a = getPointById(reversed[i - 1]);
      const b = getPointById(reversed[i]);
      if (a && b) total += Math.hypot(b.x - a.x, b.y - a.y);
      cumulative.push(total);
    }

    const delays: Record<string, number> = {};
    reversed.forEach((id, i) => {
      if (!(id in delays)) delays[id] = total > 0 ? cumulative[i] / total : 0;
    });
    return delays;
  };

  const isSuccess = validationState === 'success';
  const ignitionDelays = isSuccess ? getIgnitionDelays() : null;

  return (
    <div className="full-screen">
      <div
        className={`pattern-container ${validationState} ${isShaking ? 'shake' : ''}`}
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* SVG overlay for drawing lines */}
        <svg
          className="drawing-overlay"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Drawn path: a wide soft halo under a crisp hairline core
              (stroke colours/effects come from the theme CSS) */}
          <path d={generatePath()} className="drawn-line-halo" />
          <path d={generatePath()} className="drawn-line" />
          {/* Preview line during dragging */}
          <path d={generatePreviewPath()} className="preview-line" />
          {/* Success: neon energy flows through the figure from the last
              touched node. pathLength=100 normalises the geometry so the
              CSS dash animations work in percentages. */}
          {isSuccess && (
            <>
              <path d={generateEnergyPath()} className="energy-trail" pathLength={100} />
              <path d={generateEnergyPath()} className="energy-head" pathLength={100} />
            </>
          )}
        </svg>

        {/* Interactive Points */}
        {POINTS.map((point) => {
          const isSelected = selectedPoints.includes(point.id);
          const isFirst = selectedPoints[0] === point.id;
          const canCloseLoop = selectedPoints.length > 1 && isFirst;
          
          return (
            <div
              key={point.id}
              className={`pattern-point pattern-point--${point.id} ${isSelected ? 'selected' : ''} ${canCloseLoop ? 'can-close' : ''}`}
              data-id={point.id}
              onPointerDown={(e) => handlePointerDown(e, point.id)}
              style={{
                top: `${point.y}%`,
                left: `${point.x}%`,
                cursor: 'pointer',
                touchAction: 'none',
                // Each node ignites the moment the energy head reaches it
                ...(ignitionDelays && point.id in ignitionDelays
                  ? { '--ignite-delay': `${Math.round(ignitionDelays[point.id] * ENERGY_FILL_MS)}ms` }
                  : {}),
              } as React.CSSProperties}
            >
              {/* Discreet order guide - fades out once the node is reached */}
              <span className="pattern-point__num" aria-hidden="true">
                {NODE_ORDER[point.id]}
              </span>
            </div>
          );
        })}

        {/* Idle hint: a finger sliding from node 1 to node 2 */}
        {showHint && (
          <div className="pattern-hint" aria-hidden="true">
            <span className="pattern-hint__touch" />
            <svg className="pattern-hint__hand" viewBox="0 0 24 24">
              <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z" />
            </svg>
          </div>
        )}

        {/* Reset Button */}
        <button
          className="reset-button"
          onClick={resetPattern}
          disabled={selectedPoints.length === 0}
        >
          {t('lockscreen.reset')}
        </button>

        {/* Error message */}
        {errorMessage && (
          <div className="error-message" role="alert">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Accessible alternative: the pattern requires a pointer, so keyboard
          and assistive-technology users need a way in */}
      <button className="skip-button" onClick={() => onPatternSuccess?.()}>
        {t('lockscreen.skip')}
      </button>
    </div>
  );
};

export default PatternGrid;
