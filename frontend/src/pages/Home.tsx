import { useTranslation } from 'react-i18next';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Standottori</h1>
      {/* Carousel will go here */}
      <div className="h-96 bg-light-text/5 dark:bg-dark-text/5 rounded-lg flex items-center justify-center">
        Carousel placeholder
      </div>
    </div>
  );
} 