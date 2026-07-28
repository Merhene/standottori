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
        contact: 'Contact',
        youtube: 'YouTube',
        playground: 'Playground',
        menu: 'Menu',
        open_menu: 'Ouvrir le menu',
        close_menu: 'Fermer le menu'
      },
      footer: {
        rights: 'Tous droits réservés.',
        socials: 'Réseaux sociaux',
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
        portrait_placeholder: 'Portrait à venir',
        scroll_to_content: 'Aller au texte'
      },
      events: {
        title: 'Événements',
        lead: 'Retrouvez les conventions, guest spots et dates à venir sur la carte.',
        coming_soon: 'Calendrier en construction...',
        upcoming: 'À venir',
        past: 'Événements passés',
        filter_label: 'Filtrer les événements',
        filter_all: 'Tous',
        filter_empty: 'Aucun événement dans ce filtre.',
        map_empty: 'Aucun événement géolocalisé pour l’instant. Ajoutez un lieu depuis l’admin.',
        map_close: 'Fermer la fiche',
        not_on_map: 'pas sur la carte'
      },
      gallery: {
        title: 'Galerie',
        coming_soon: 'Galerie en construction...',
        ask_flash: 'Demander ce flash',
        ask_flash_confirm: 'Voulez-vous demander ce flash ?',
        ask_flash_yes: 'Oui',
        ask_flash_no: 'Non'
      },
      contact: {
        title: 'Contact',
        intro:
          'Si vous souhaitez un tatouage, choisissez une zone du corps et laissez votre message. Vous pouvez aussi <formLink>joindre le formulaire</formLink> une fois rempli.',
        studio_heading: 'Coordonnées',
        form_title: 'Votre message',
        coming_soon: 'Formulaire en construction...',
        name: 'Nom',
        email: 'Email',
        category: 'Objet',
        categories: {
          tattoo: 'Tatouage',
          partnership: 'Partenariat',
          invitation: 'Invitation',
          informations: 'Informations'
        },
        budget: 'Budget',
        budget_placeholder: 'Ex. 400',
        currency: 'Devise',
        message: 'Message',
        message_hint: 'Le texte est prérempli — vous pouvez le personnaliser librement.',
        reset_template: 'Réinitialiser le modèle',
        attachments: 'Pièces jointes',
        attachments_hint: 'Photos de référence, formulaire rempli (PDF) — 5 fichiers max, 4 Mo chacun.',
        attach: 'Joindre un fichier',
        open_form: 'Ouvrir le formulaire',
        remove_attachment: 'Retirer {{name}}',
        attach_too_many: 'Maximum {{max}} fichiers.',
        attach_too_large: '« {{name}} » dépasse {{max}} Mo.',
        flash_attached: 'Flash sélectionné — image jointe automatiquement.',
        flash_attach_failed: 'Impossible de joindre le flash automatiquement. Vous pouvez l’ajouter manuellement.',
        send: 'Envoyer',
        sending: 'Envoi en cours…',
        sent: 'Merci ! Votre message a bien été envoyé.',
        error: 'L\'envoi a échoué. Veuillez réessayer plus tard.'
      },
      bodymap: {
        title: 'Emplacement',
        hint: 'Touchez une zone pour la sélectionner. On vous demandera si le motif tourne autour.',
        view_label: 'Vue du corps',
        view_front: 'Face',
        view_back: 'Dos',
        stage_label: 'Silhouette — {{face}}',
        selected_title: 'Zones choisies',
        selected_empty: 'Aucune zone pour l\'instant — cliquez sur le corps.',
        clear: 'Tout effacer',
        remove: 'Retirer {{part}}',
        wrap_prompt: 'Est-ce que ça tourne autour de toute la zone ({{part}}) ?',
        wrap_yes: 'Oui, tout autour',
        wrap_no: 'Non, ce côté',
        wrap_suffix: 'autour',
        parts: {
          neck: 'Cou',
          head: 'Tête',
          chest: 'Poitrine',
          belly: 'Ventre',
          left_ribs: 'Côtes gauches',
          right_ribs: 'Côtes droites',
          pubis: 'Pubis',
          back: 'Dos',
          booty: 'Fesses',
          left_shoulder: 'Épaule gauche',
          left_top_arm: 'Bras gauche (haut)',
          left_bottom_arm: 'Avant-bras gauche',
          left_hand: 'Main gauche',
          right_shoulder: 'Épaule droite',
          right_top_arm: 'Bras droit (haut)',
          right_bottom_arm: 'Avant-bras droit',
          right_hand: 'Main droite',
          left_thigh: 'Cuisse gauche',
          left_knee: 'Genou gauche',
          left_shin: 'Tibia gauche',
          left_foot: 'Pied gauche',
          right_thigh: 'Cuisse droite',
          right_knee: 'Genou droit',
          right_shin: 'Tibia droit',
          right_foot: 'Pied droit'
        },
        combos: {
          full_sleeve_left: 'Manche complète gauche',
          full_sleeve_right: 'Manche complète droite',
          full_top_body: 'Haut du corps complet',
          full_leg_left: 'Jambe complète gauche',
          full_leg_right: 'Jambe complète droite'
        }
      },
      youtube: {
        title: 'Turbo Tattoo',
        tagline: '3000',
        eyebrow: 'System online',
        insert_coin: 'INSERT COIN',
        press_start: 'PRESS START',
        logo_alt: 'Standottori — Turbo Tattoo 3000',
        featured_badge: 'Featured · Channel star',
        featured_title: 'Vidéo officielle Turbo Tattoo 3000',
        episode_1: 'Episode · Level 1',
        episode_2: 'Episode · Level 2',
        carousel_label: 'Épisodes Turbo Tattoo 3000',
        prev: 'Épisode précédent',
        next: 'Épisode suivant',
        sound_on: 'SFX ON',
        sound_off: 'SFX OFF',
        coming_soon: 'Chaîne YouTube en construction...',
        visit_channel: 'Enter the channel'
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
        contact: 'Contact',
        youtube: 'YouTube',
        playground: 'Playground',
        menu: 'Menu',
        open_menu: 'Open menu',
        close_menu: 'Close menu'
      },
      footer: {
        rights: 'All rights reserved.',
        socials: 'Social media',
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
        portrait_placeholder: 'Portrait coming soon',
        scroll_to_content: 'Go to the text'
      },
      events: {
        title: 'Events',
        lead: 'Find conventions, guest spots and upcoming dates on the map.',
        coming_soon: 'Calendar coming soon...',
        upcoming: 'Upcoming',
        past: 'Past events',
        filter_label: 'Filter events',
        filter_all: 'All',
        filter_empty: 'No events in this filter.',
        map_empty: 'No geolocated events yet. Add a place from the admin.',
        map_close: 'Close details',
        not_on_map: 'not on map'
      },
      gallery: {
        title: 'Gallery',
        coming_soon: 'Gallery coming soon...',
        ask_flash: 'Ask for this flash',
        ask_flash_confirm: 'Do you want to ask for this flash?',
        ask_flash_yes: 'Yes',
        ask_flash_no: 'No'
      },
      contact: {
        title: 'Contact',
        intro:
          'If you want a tattoo, choose a body part and leave your message. You can also <formLink>attach the form</formLink> once you’ve filled it in.',
        studio_heading: 'Details',
        form_title: 'Your message',
        coming_soon: 'Form coming soon...',
        name: 'Name',
        email: 'Email',
        category: 'Subject',
        categories: {
          tattoo: 'Tattoo',
          partnership: 'Partnership',
          invitation: 'Invitation',
          informations: 'Information'
        },
        budget: 'Budget',
        budget_placeholder: 'e.g. 400',
        currency: 'Currency',
        message: 'Message',
        message_hint: 'The message is pre-filled — feel free to personalise it.',
        reset_template: 'Reset template',
        attachments: 'Attachments',
        attachments_hint: 'Reference photos, filled form (PDF) — max 5 files, 4 MB each.',
        attach: 'Attach a file',
        open_form: 'Open the form',
        remove_attachment: 'Remove {{name}}',
        attach_too_many: 'Maximum {{max}} files.',
        attach_too_large: '“{{name}}” exceeds {{max}} MB.',
        flash_attached: 'Flash selected — image attached automatically.',
        flash_attach_failed: 'Could not attach the flash automatically. You can add it manually.',
        send: 'Send',
        sending: 'Sending…',
        sent: 'Thank you! Your message has been sent.',
        error: 'Sending failed. Please try again later.'
      },
      bodymap: {
        title: 'Placement',
        hint: 'Tap a zone to select it. You’ll be asked if the piece wraps around.',
        view_label: 'Body view',
        view_front: 'Front',
        view_back: 'Back',
        stage_label: 'Silhouette — {{face}}',
        selected_title: 'Selected areas',
        selected_empty: 'No area yet — click the body.',
        clear: 'Clear all',
        remove: 'Remove {{part}}',
        wrap_prompt: 'Does this wrap around the whole area ({{part}})?',
        wrap_yes: 'Yes, wrap around',
        wrap_no: 'No, this side',
        wrap_suffix: 'wrap',
        parts: {
          neck: 'Neck',
          head: 'Head',
          chest: 'Chest',
          belly: 'Belly',
          left_ribs: 'Left ribs',
          right_ribs: 'Right ribs',
          pubis: 'Pubis',
          back: 'Back',
          booty: 'Glutes',
          left_shoulder: 'Left shoulder',
          left_top_arm: 'Left upper arm',
          left_bottom_arm: 'Left forearm',
          left_hand: 'Left hand',
          right_shoulder: 'Right shoulder',
          right_top_arm: 'Right upper arm',
          right_bottom_arm: 'Right forearm',
          right_hand: 'Right hand',
          left_thigh: 'Left thigh',
          left_knee: 'Left knee',
          left_shin: 'Left shin',
          left_foot: 'Left foot',
          right_thigh: 'Right thigh',
          right_knee: 'Right knee',
          right_shin: 'Right shin',
          right_foot: 'Right foot'
        },
        combos: {
          full_sleeve_left: 'Full left sleeve',
          full_sleeve_right: 'Full right sleeve',
          full_top_body: 'Full upper body',
          full_leg_left: 'Full left leg',
          full_leg_right: 'Full right leg'
        }
      },
      youtube: {
        title: 'Turbo Tattoo',
        tagline: '3000',
        eyebrow: 'System online',
        insert_coin: 'INSERT COIN',
        press_start: 'PRESS START',
        logo_alt: 'Standottori — Turbo Tattoo 3000',
        featured_badge: 'Featured · Channel star',
        featured_title: 'Official Turbo Tattoo 3000 video',
        episode_1: 'Episode · Level 1',
        episode_2: 'Episode · Level 2',
        carousel_label: 'Turbo Tattoo 3000 episodes',
        prev: 'Previous episode',
        next: 'Next episode',
        sound_on: 'SFX ON',
        sound_off: 'SFX OFF',
        coming_soon: 'YouTube channel coming soon...',
        visit_channel: 'Enter the channel'
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