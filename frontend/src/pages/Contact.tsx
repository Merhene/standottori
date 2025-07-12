import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{t('contact.title')}</h1>
      <div className="bg-[#171617]/5 dark:bg-[#EAE7D3]/5 rounded-lg p-8 text-center">
        <p className="text-lg">{t('contact.coming_soon')}</p>
      </div>
    </div>
  );
} 