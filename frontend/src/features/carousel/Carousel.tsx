import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Carousel.css';

interface CarouselImage {
  src: string;
  alt: string;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlayInterval?: number;
  className?: string;
  isFullscreen?: boolean;
  /** Optional custom first slide (e.g. the homepage brand stage) */
  leadingSlide?: React.ReactNode;
  /** Hold autoplay (e.g. while the entrance animation plays) */
  paused?: boolean;
}

/** Keep in sync with the animation durations in Carousel.css */
const TRANSITION_MS = 700;

/** The incoming slide covers the previous one from a random direction */
const VARIANTS = ['in-top', 'in-bottom', 'split'] as const;
type Variant = (typeof VARIANTS)[number] | 'fade';

function pickVariant(): Variant {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'fade';
  return VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
}

export default function Carousel({
  images,
  autoPlayInterval = 5000,
  className = '',
  isFullscreen = false,
  leadingSlide,
  paused = false,
}: CarouselProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Previous slide stays visible underneath while the new one animates in
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [variant, setVariant] = useState<Variant>('fade');
  // Respect reduced-motion preferences: no autoplay
  const [isPlaying, setIsPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const slideCount = images.length + (leadingSlide ? 1 : 0);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex((current) => {
        if (index === current || slideCount < 2) return current;
        setPrevIndex(current);
        setVariant(pickVariant());
        return index;
      });
    },
    [slideCount]
  );

  const nextSlide = useCallback(() => {
    setCurrentIndex((current) => {
      if (slideCount < 2) return current;
      setPrevIndex(current);
      setVariant(pickVariant());
      return (current + 1) % slideCount;
    });
  }, [slideCount]);

  const previousSlide = useCallback(() => {
    setCurrentIndex((current) => {
      if (slideCount < 2) return current;
      setPrevIndex(current);
      setVariant(pickVariant());
      return (current - 1 + slideCount) % slideCount;
    });
  }, [slideCount]);

  // Drop the previous slide once the incoming animation has landed
  useEffect(() => {
    if (prevIndex === null) return;
    const id = window.setTimeout(() => setPrevIndex(null), TRANSITION_MS + 50);
    return () => window.clearTimeout(id);
  }, [prevIndex, currentIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || paused) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, paused, nextSlide, autoPlayInterval]);

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
      case ' ':
        e.preventDefault();
        setIsPlaying(!isPlaying);
        break;
    }
  };

  const fullscreenClasses = isFullscreen
    ? 'fixed inset-0 w-screen h-screen z-0'
    : 'relative rounded-lg';

  // Unified slide list: optional custom slide first, then the images.
  // All slides stay mounted (images load once); only current/prev are visible.
  const slides: React.ReactNode[] = [
    ...(leadingSlide ? [leadingSlide] : []),
    ...images.map((image, i) => (
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-full object-cover"
        loading={i === 0 && !leadingSlide ? 'eager' : 'lazy'}
      />
    )),
  ];

  const renderSlide = (slide: React.ReactNode, index: number) => {
    const isCurrent = index === currentIndex;
    const isPrev = index === prevIndex;
    const isEntering = isCurrent && prevIndex !== null;

    if (!isCurrent && !isPrev) {
      return (
        <div key={index} className="absolute inset-0 invisible" aria-hidden="true">
          {slide}
        </div>
      );
    }

    // Split: the incoming slide is cut in half - the top half drops in
    // from above while the bottom half rises from below
    if (isEntering && variant === 'split') {
      return (
        <div key={index} className="absolute inset-0 z-20" aria-hidden={false}>
          <div className="absolute inset-0 carousel-slide--split-top">{slide}</div>
          <div className="absolute inset-0 carousel-slide--split-bottom" aria-hidden="true">
            {slide}
          </div>
        </div>
      );
    }

    const enterClass = isEntering
      ? variant === 'in-top'
        ? 'carousel-slide--in-top'
        : variant === 'in-bottom'
          ? 'carousel-slide--in-bottom'
          : 'carousel-slide--fade'
      : '';

    return (
      <div
        key={index}
        className={`absolute inset-0 ${isCurrent ? 'z-20' : 'z-10'} ${enterClass}`}
        aria-hidden={!isCurrent}
      >
        {slide}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${fullscreenClasses} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={t('carousel.label')}
    >
      {/* Slides */}
      <div className="relative w-full h-full cursor-pointer" onClick={nextSlide}>
        {slides.map(renderSlide)}
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
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
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/50 z-30"
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
