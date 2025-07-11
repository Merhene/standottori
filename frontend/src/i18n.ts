import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      connect_dots: 'Reliez les points',
      theme: {
        toggle: 'Basculer le thème clair/sombre'
      },
      nav: {
        biography: 'Biographie',
        events: 'Événements',
        gallery: 'Galerie',
        info: 'Info',
        contact: 'Contact',
        youtube: 'YouTube',
        menu: 'Menu'
      },
      footer: {
        rights: 'Tous droits réservés.',
        legal: 'Mentions légales',
        privacy: 'Politique de confidentialité'
      },
      home: {
        title: 'Standottori',
        carousel_coming_soon: 'Carrousel en construction...'
      },
      biography: {
        title: 'Biographie',
        coming_soon: 'Biographie en construction...',
        portrait_placeholder: 'Portrait à venir'
      },
      events: {
        title: 'Événements',
        coming_soon: 'Calendrier en construction...'
      },
      gallery: {
        title: 'Galerie',
        coming_soon: 'Galerie en construction...'
      },
      info: {
        title: 'Informations',
        coming_soon: 'Informations en construction...'
      },
      contact: {
        title: 'Contact',
        coming_soon: 'Formulaire en construction...'
      },
      youtube: {
        title: 'YouTube',
        coming_soon: 'Chaîne YouTube en construction...'
      },
      legal: {
        title: 'Mentions légales',
        coming_soon: 'Page en construction...'
      },
      privacy: {
        title: 'Politique de confidentialité',
        coming_soon: 'Page en construction...'
      }
    }
  },
  en: {
    translation: {
      connect_dots: 'Connect the dots',
      theme: {
        toggle: 'Toggle light/dark theme'
      },
      nav: {
        biography: 'Biography',
        events: 'Events',
        gallery: 'Gallery',
        info: 'Info',
        contact: 'Contact',
        youtube: 'YouTube',
        menu: 'Menu'
      },
      footer: {
        rights: 'All rights reserved.',
        legal: 'Legal Notice',
        privacy: 'Privacy Policy'
      },
      home: {
        title: 'Standottori',
        carousel_coming_soon: 'Carousel coming soon...'
      },
      biography: {
        title: 'Biography',
        coming_soon: 'Biography coming soon...',
        portrait_placeholder: 'Portrait coming soon'
      },
      events: {
        title: 'Events',
        coming_soon: 'Calendar coming soon...'
      },
      gallery: {
        title: 'Gallery',
        coming_soon: 'Gallery coming soon...'
      },
      info: {
        title: 'Information',
        coming_soon: 'Information coming soon...'
      },
      contact: {
        title: 'Contact',
        coming_soon: 'Form coming soon...'
      },
      youtube: {
        title: 'YouTube',
        coming_soon: 'YouTube channel coming soon...'
      },
      legal: {
        title: 'Legal Notice',
        coming_soon: 'Page coming soon...'
      },
      privacy: {
        title: 'Privacy Policy',
        coming_soon: 'Page coming soon...'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n; 