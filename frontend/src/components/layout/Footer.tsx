import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#F4EDDE] dark:bg-[#171617] border-t border-[#171617]/10 dark:border-[#EAE7D3]/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm">
            © {currentYear} Standottori. {t('footer.rights')}
          </div>
          
          <div className="flex space-x-6 text-sm">
            <Link to="/legal" className="hover:opacity-75 transition-opacity">
              {t('footer.legal')}
            </Link>
            <Link to="/privacy" className="hover:opacity-75 transition-opacity">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 