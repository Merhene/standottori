import React, { useEffect, useRef } from 'react';
import Carousel from '../features/carousel/Carousel';

const carouselImages = [
  { src: '/images/image1.jpg', alt: 'Tattoo artwork 1' },
  { src: '/images/image2.jpg', alt: 'Tattoo artwork 2' },
  { src: '/images/image3.jpg', alt: 'Tattoo artwork 3' },
  { src: '/images/image4.jpg', alt: 'Tattoo artwork 4' },
  { src: '/images/image5.jpg', alt: 'Tattoo artwork 5' },
  { src: '/images/inkSd.jpg', alt: 'Ink artwork' },
  { src: '/images/tattoingStan.png', alt: 'Stan tattooing' },
];

export default function Hero() {
  const leftLogoRef = useRef<HTMLImageElement>(null);
  const rightLogoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const intensity = 0.08; // Adjust for subtleness
      if (leftLogoRef.current) {
        leftLogoRef.current.style.transform = `translateY(${scrollY * -intensity}px)`;
      }
      if (rightLogoRef.current) {
        rightLogoRef.current.style.transform = `translateY(${scrollY * intensity}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background carousel */}
      <Carousel images={carouselImages} className="h-full" />

      {/* Overlay split logo */}
      <div className="pointer-events-none absolute inset-0 flex justify-end items-center pr-6 md:pr-16">
        <div className="flex items-center">
          <img
            ref={leftLogoRef}
            src="/images/GSDBG.png"
            alt="Monogram left part"
            className="w-24 sm:w-32 md:w-44 lg:w-56 filter brightness-0 transition-transform duration-300 ease-out"
          />
          <img
            ref={rightLogoRef}
            src="/images/GSDBD.png"
            alt="Monogram right part"
            className="w-24 sm:w-32 md:w-44 lg:w-56 transition-transform duration-300 ease-out"
          />
        </div>
      </div>
    </section>
  );
} 