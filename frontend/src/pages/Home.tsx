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

export default function Home() {
  return (
    <Carousel 
      images={carouselImages} 
      isFullscreen={true}
    />
  );
} 