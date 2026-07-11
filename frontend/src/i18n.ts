import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      connect_dots: 'Reliez les points',
      lockscreen: {
        reset: 'Recommencer',
        error: 'Motif incorrect. Réessayez.',
        skip: 'Entrer sans le motif'
      },
      theme: {
        toggle: 'Basculer le thème clair/sombre'
      },
      carousel: {
        label: 'Galerie de photos',
        previous: 'Image précédente',
        next: 'Image suivante',
        goto_slide: 'Aller à l\'image {{number}}',
        play: 'Démarrer le diaporama',
        pause: 'Mettre en pause le diaporama'
      },
      nav: {
        biography: 'Biographie',
        events: 'Événements',
        gallery: 'Galerie',
        info: 'Info',
        contact: 'Contact',
        youtube: 'YouTube',
        menu: 'Menu',
        open_menu: 'Ouvrir le menu',
        close_menu: 'Fermer le menu'
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
        coming_soon: 'Calendrier en construction...',
        upcoming: 'À venir',
        past: 'Événements passés'
      },
      gallery: {
        title: 'Galerie',
        coming_soon: 'Galerie en construction...'
      },
      info: {
        title: 'Informations',
        coming_soon: 'Informations en construction...',
        contact_heading: 'Contact',
        hours_heading: 'Horaires d\'ouverture',
        socials_heading: 'Réseaux sociaux'
      },
      contact: {
        title: 'Contact',
        coming_soon: 'Formulaire en construction...',
        name: 'Nom',
        email: 'Email',
        message: 'Message',
        send: 'Envoyer',
        sending: 'Envoi en cours…',
        sent: 'Merci ! Votre message a bien été envoyé.',
        error: 'L\'envoi a échoué. Veuillez réessayer plus tard.'
      },
      youtube: {
        title: 'YouTube',
        coming_soon: 'Chaîne YouTube en construction...',
        visit_channel: 'Voir la chaîne YouTube'
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
      lockscreen: {
        reset: 'Reset',
        error: 'Incorrect pattern. Try again.',
        skip: 'Enter without the pattern'
      },
      theme: {
        toggle: 'Toggle light/dark theme'
      },
      carousel: {
        label: 'Photo gallery',
        previous: 'Previous image',
        next: 'Next image',
        goto_slide: 'Go to image {{number}}',
        play: 'Start slideshow',
        pause: 'Pause slideshow'
      },
      nav: {
        biography: 'Biography',
        events: 'Events',
        gallery: 'Gallery',
        info: 'Info',
        contact: 'Contact',
        youtube: 'YouTube',
        menu: 'Menu',
        open_menu: 'Open menu',
        close_menu: 'Close menu'
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
        coming_soon: 'Calendar coming soon...',
        upcoming: 'Upcoming',
        past: 'Past events'
      },
      gallery: {
        title: 'Gallery',
        coming_soon: 'Gallery coming soon...'
      },
      info: {
        title: 'Information',
        coming_soon: 'Information coming soon...',
        contact_heading: 'Contact',
        hours_heading: 'Opening hours',
        socials_heading: 'Social media'
      },
      contact: {
        title: 'Contact',
        coming_soon: 'Form coming soon...',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send',
        sending: 'Sending…',
        sent: 'Thank you! Your message has been sent.',
        error: 'Sending failed. Please try again later.'
      },
      youtube: {
        title: 'YouTube',
        coming_soon: 'YouTube channel coming soon...',
        visit_channel: 'Visit the YouTube channel'
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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Keep <html lang> in sync for accessibility and SEO
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n; 