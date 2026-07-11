import React, { useState, useRef, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const resetPattern = () => {
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
    const tolerance = 8; // Percentage tolerance for point detection
    
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
    setSelectedPoints(prev => {
      // If no points selected, or this is a new point, add it
      if (prev.length === 0) {
        setIsDrawing(true);
        return [pointId];
      }

      // Check if this point is already selected
      const isAlreadySelected = prev.includes(pointId);
      
      // Allow selecting the first point again to close the loop
      if (isAlreadySelected && pointId === prev[0] && prev.length > 1) {
        setIsDrawing(false);
        setCurrentPointer(null);
        const completedPattern = [...prev, pointId];
        
        // Validate the completed pattern
        setTimeout(() => {
          validatePattern(completedPattern);
        }, 100); // Small delay to show final line
        
        return completedPattern;
      }

      // Don't allow selecting the same point twice (except closing loop)
      if (isAlreadySelected) {
        return prev;
      }

      // Add new point to selection
      return [...prev, pointId];
    });
  }, [validatePattern]);

  // Drag-based event handlers
  const handleDragStart = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent, pointId: string) => {
    e.preventDefault();
    handlePointInteraction(pointId);
    
    // Get initial pointer position
    let clientX: number, clientY: number;
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      return;
    }
    
    const coords = getContainerCoordinates(clientX, clientY);
    if (coords) {
      setCurrentPointer(coords);
    }
  }, [handlePointInteraction, getContainerCoordinates]);

  const handleDragMove = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    
    // Get current pointer position
    let clientX: number, clientY: number;
    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      return;
    }
    
    const coords = getContainerCoordinates(clientX, clientY);
    if (!coords) return;
    
    setCurrentPointer(coords);
    
    // Check if we're over a new point
    const pointUnder = getPointUnderPointer(coords.x, coords.y);
    if (pointUnder) {
      handlePointInteraction(pointUnder);
    }
  }, [isDrawing, getContainerCoordinates, getPointUnderPointer, handlePointInteraction]);

  const handleDragEnd = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    setIsDrawing(false);
    setCurrentPointer(null);
    
    // If pattern has points but is not closed (doesn't end with starting point), validate it
    setTimeout(() => {
      if (selectedPoints.length > 0) {
        const lastPoint = selectedPoints[selectedPoints.length - 1];
        const firstPoint = selectedPoints[0];
        
        // If pattern is not closed but has multiple points, it's likely incomplete
        if (selectedPoints.length > 1 && lastPoint !== firstPoint) {
          // Auto-validate incomplete patterns as incorrect
          validatePattern(selectedPoints);
        }
      }
    }, 100);
  }, [isDrawing, selectedPoints, validatePattern]);

  // Get coordinates for a point by ID
  const getPointById = (id: string): Point | undefined => {
    return POINTS.find(point => point.id === id);
  };

  // Generate SVG path for drawn lines
  const generatePath = (): string => {
    if (selectedPoints.length < 2) return '';
    
    const pathCommands: string[] = [];
    
    for (let i = 0; i < selectedPoints.length - 1; i++) {
      const currentPoint = getPointById(selectedPoints[i]);
      const nextPoint = getPointById(selectedPoints[i + 1]);
      
      if (currentPoint && nextPoint) {
        if (i === 0) {
          pathCommands.push(`M ${currentPoint.x} ${currentPoint.y}`);
        }
        pathCommands.push(`L ${nextPoint.x} ${nextPoint.y}`);
      }
    }
    
    return pathCommands.join(' ');
  };

  // Generate preview line from last selected point to current pointer
  const generatePreviewPath = (): string => {
    if (!isDrawing || selectedPoints.length === 0 || !currentPointer) return '';
    
    const lastPoint = getPointById(selectedPoints[selectedPoints.length - 1]);
    if (!lastPoint) return '';
    
    return `M ${lastPoint.x} ${lastPoint.y} L ${currentPointer.x} ${currentPointer.y}`;
  };

  return (
    <div className="full-screen">
      <div 
        className={`pattern-container ${validationState} ${isShaking ? 'shake' : ''}`}
        ref={containerRef}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* SVG overlay for drawing lines */}
        <svg
          className="drawing-overlay"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Main drawn path */}
          <path
            d={generatePath()}
            className="drawn-line"
            fill="none"
            stroke="black"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Preview line during dragging */}
          <path
            d={generatePreviewPath()}
            className="preview-line"
            fill="none"
            stroke="rgba(0, 0, 0, 0.4)"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 2"
          />
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
              onPointerDown={(e) => handleDragStart(e, point.id)}
              onMouseDown={(e) => handleDragStart(e, point.id)}
              onTouchStart={(e) => handleDragStart(e, point.id)}
              style={{
                top: `${point.y}%`,
                left: `${point.x}%`,
                cursor: 'pointer',
              }}
            />
          );
        })}

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
