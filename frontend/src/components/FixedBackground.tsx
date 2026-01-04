import { createPortal } from 'react-dom';

interface FixedBackgroundProps {
  src: string;
  alt?: string;
}

export default function FixedBackground({ src, alt = 'Background' }: FixedBackgroundProps) {
  const backgroundElement = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </div>
  );

  return createPortal(backgroundElement, document.body);
}
