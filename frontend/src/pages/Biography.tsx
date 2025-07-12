import { useTranslation } from 'react-i18next';

export default function Biography() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{t('biography.title')}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="prose dark:prose-invert">
          <p className="text-lg">{t('biography.coming_soon')}</p>
        </div>
        <div className="aspect-square bg-[#171617]/5 dark:bg-[#EAE7D3]/5 rounded-lg flex items-center justify-center">
          <p>{t('biography.portrait_placeholder')}</p>
        </div>
      </div>
    </div>
  );
} 