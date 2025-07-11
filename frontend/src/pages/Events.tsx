import { useTranslation } from 'react-i18next';

export default function Events() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{t('events.title')}</h1>
      <div className="bg-[#171617]/5 dark:bg-[#EAE7D3]/5 rounded-lg p-8 text-center">
        <p className="text-lg">{t('events.coming_soon')}</p>
      </div>
    </div>
  );
} 