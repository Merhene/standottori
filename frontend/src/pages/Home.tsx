import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">{t('home.title')}</h1>
      <div className="aspect-[16/9] bg-[#171617]/5 dark:bg-[#EAE7D3]/5 rounded-lg">
        <Carousel images={carouselImages} className="h-full" />
      </div>
    </div>
  );
} 