import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{t('privacy.title')}</h1>
      <div className="bg-[#171617]/5 dark:bg-[#EAE7D3]/5 rounded-lg p-8 text-center">
        <p className="text-lg">{t('privacy.coming_soon')}</p>
      </div>
    </div>
  );
} 