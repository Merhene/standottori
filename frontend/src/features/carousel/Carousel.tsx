import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CarouselImage {
  src: string;
  alt: string;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlayInterval?: number;
  className?: string;
}

export default function Carousel({ images, autoPlayInterval = 5000, className = '' }: CarouselProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  const previousSlide = useCallback(() => {
    setCurrentIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide, autoPlayInterval]);

  // Pause on hover/focus
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) { // minimum swipe distance
      if (diff > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        previousSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        break;
      case 'Space':
        e.preventDefault();
        setIsPlaying(!isPlaying);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={t('carousel.label')}
    >
      {/* Images */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full cursor-pointer"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onClick={nextSlide}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="min-w-full h-full"
            aria-hidden={index !== currentIndex}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-white'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={t('carousel.goto_slide', { number: index + 1 })}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Play/Pause button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={isPlaying ? t('carousel.pause') : t('carousel.play')}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
} 