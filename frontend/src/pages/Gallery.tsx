import { useState } from 'react';
import { Link } from 'react-router-dom';

interface GallerySectionProps {
  image: string;
  title: string;
  link: string;
}

function GallerySection({ image, title, link }: GallerySectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={link}
      className="block relative overflow-hidden no-underline"
      style={{ 
        flex: 1,
        width: '100%',
        height: '100%',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      />

      {/* Dark overlay on hover */}
      <div
        className="absolute top-0 left-0 w-full h-full transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          opacity: isHovered ? 1 : 0,
          zIndex: 1,
        }}
      />

      {/* Title - appears on hover */}
      <div
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          zIndex: 2,
        }}
      >
        <h2
          className="text-white text-5xl md:text-7xl lg:text-8xl font-bold tracking-widest uppercase drop-shadow-lg transition-transform duration-300"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {title}
        </h2>
      </div>
    </Link>
  );
}

export default function Gallery() {
  return (
    <div 
      className="flex flex-col md:flex-row"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    >
      <GallerySection
        image="/images/merhene.png"
        title="Book"
        link="/gallery/book"
      />
      <GallerySection
        image="/images/ausse.png"
        title="Flash"
        link="/gallery/flash"
      />
    </div>
  );
}
