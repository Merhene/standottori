import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">{t('home.title')}</h1>
      <div className="aspect-[16/9] bg-[#171617]/5 dark:bg-[#EAE7D3]/5 rounded-lg">
        {/* Carousel placeholder */}
        <div className="h-full flex items-center justify-center">
          <p className="text-lg">{t('home.carousel_coming_soon')}</p>
        </div>
      </div>
    </div>
  );
} 