import { useState } from 'react';
import { Menubar } from 'primereact/menubar';
import { Sidebar } from 'primereact/sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';

export default function PrimeHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const changeLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');

  const menuItems = [
    { label: t('nav.biography'), command: () => navigate('/biography') },
    { label: t('nav.events'), command: () => navigate('/events') },
    { label: t('nav.gallery'), command: () => navigate('/gallery') },
    { label: t('nav.info'), command: () => navigate('/info') },
    { label: t('nav.contact'), command: () => navigate('/contact') },
    { label: t('nav.youtube'), command: () => navigate('/youtube') },
  ];

  const start = (
    <Link to="/" className="flex align-items-center gap-2 text-xl font-bold no-underline text-color">
      <img src="/images/logo.png" alt="logo" height={32} />
      <span>Standottori</span>
    </Link>
  );

  const end = (
    <div className="flex align-items-center gap-3">
      <button onClick={changeLang} className="p-link text-sm font-semibold text-color">
        {i18n.language === 'fr' ? 'EN' : 'FR'}
      </button>
      <ThemeToggle />
      {/* burger icon visible on small screens */}
      <button onClick={() => setVisible(true)} className="p-button p-button-text p-0 md:hidden">
        <i className="pi pi-bars text-xl" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Menubar */}
      <div className="hidden md:block sticky top-0 z-5">
        <Menubar model={menuItems} start={start} end={end} className="shadow-1" />
      </div>

      {/* Mobile header (logo + burger) */}
      <div className="flex md:hidden align-items-center justify-between px-3 py-2 shadow-1 sticky top-0 z-5 bg-primary-50 dark:bg-gray-900">
        {start}
        <div className="flex align-items-center gap-3">
          <button onClick={changeLang} className="p-link text-sm font-semibold text-color">
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>
          <ThemeToggle />
          <button onClick={() => setVisible(true)} className="p-button p-button-text p-0">
            <i className="pi pi-bars text-xl" />
          </button>
        </div>
      </div>

      {/* Sidebar navigation for mobile */}
      <Sidebar visible={visible} onHide={() => setVisible(false)} position="right" className="w-20rem">
        <ul className="list-none p-0 m-0 flex flex-column gap-3">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => {
                  item.command?.();
                  setVisible(false);
                }}
                className="p-button p-button-link w-full text-left"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </Sidebar>
    </>
  );
} 