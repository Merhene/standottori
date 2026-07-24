export type ContactCategory = 'tattoo' | 'partnership' | 'invitation' | 'informations';
export type Currency = 'EUR' | 'USD' | 'CAD';

export const CATEGORIES: ContactCategory[] = [
  'tattoo',
  'partnership',
  'invitation',
  'informations',
];

export const CURRENCIES: { id: Currency; label: string }[] = [
  { id: 'EUR', label: '€' },
  { id: 'USD', label: '$ US' },
  { id: 'CAD', label: '$ CAD' },
];

export function formatBudget(amount: string, currency: Currency): string {
  const trimmed = amount.trim();
  if (!trimmed) return '';
  switch (currency) {
    case 'EUR':
      return `${trimmed} €`;
    case 'USD':
      return `US$ ${trimmed}`;
    case 'CAD':
      return `CA$ ${trimmed}`;
  }
}

interface TemplateInput {
  category: ContactCategory;
  zones: string[];
  budgetLabel: string;
  lang: 'fr' | 'en';
  /** When set, the visitor came from a flash in the gallery */
  flash?: { title: string | null } | null;
}

/** Professional starter message — visitor can edit freely afterward */
export function buildMessageTemplate({
  category,
  zones,
  budgetLabel,
  lang,
  flash,
}: TemplateInput): string {
  const zoneList =
    zones.length > 0
      ? zones.join(lang === 'fr' ? ', ' : ', ')
      : lang === 'fr'
        ? '[zone à préciser]'
        : '[placement to confirm]';

  const budgetLine = budgetLabel
    ? lang === 'fr'
      ? `Mon budget est d’environ ${budgetLabel}.`
      : `My budget is around ${budgetLabel}.`
    : lang === 'fr'
      ? 'Je n’ai pas encore de budget précis.'
      : 'I don’t have a fixed budget yet.';

  const flashName = flash?.title?.trim();
  const tattooLineFr = flash
    ? flashName
      ? `Je souhaite me renseigner pour ce flash « ${flashName} » (image jointe), sur la / les zone(s) suivante(s) : ${zoneList}.`
      : `Je souhaite me renseigner pour ce flash (image jointe), sur la / les zone(s) suivante(s) : ${zoneList}.`
    : `Je souhaite me renseigner pour un tatouage sur la / les zone(s) suivante(s) : ${zoneList}.`;
  const tattooLineEn = flash
    ? flashName
      ? `I would like to enquire about this flash “${flashName}” (image attached), on the following area(s): ${zoneList}.`
      : `I would like to enquire about this flash (image attached), on the following area(s): ${zoneList}.`
    : `I would like to enquire about a tattoo on the following area(s): ${zoneList}.`;

  if (lang === 'fr') {
    switch (category) {
      case 'tattoo':
        return [
          'Bonjour,',
          '',
          tattooLineFr,
          budgetLine,
          '',
          'Pourriez-vous me donner une idée de faisabilité, de délai et de tarif pour ce projet ?',
          'Je reste disponible pour échanger et vous transmettre davantage d’éléments si besoin.',
          '',
          'Merci d’avance pour votre retour,',
          'Bien cordialement,',
        ].join('\n');
      case 'partnership':
        return [
          'Bonjour,',
          '',
          'Je souhaiterais échanger avec vous au sujet d’un éventuel partenariat.',
          'Je vous propose de vous présenter brièvement mon projet / ma structure et de voir s’il existe un terrain d’entente.',
          '',
          'Seriez-vous disponible pour en discuter ?',
          '',
          'Merci d’avance,',
          'Bien cordialement,',
        ].join('\n');
      case 'invitation':
        return [
          'Bonjour,',
          '',
          'Je me permets de vous contacter pour vous adresser une invitation.',
          'Je serais ravi(e) de vous en présenter les détails et de savoir si cela pourrait vous intéresser.',
          '',
          'Merci d’avance pour votre attention,',
          'Bien cordialement,',
        ].join('\n');
      case 'informations':
        return [
          'Bonjour,',
          '',
          zones.length > 0
            ? `Je souhaite obtenir des informations concernant un projet de tatouage sur : ${zoneList}.`
            : 'Je souhaite obtenir des informations générales sur vos prestations et votre disponibilité.',
          budgetLabel ? budgetLine : '',
          '',
          'Pourriez-vous m’indiquer comment procéder et quels éléments vous seraient utiles de mon côté ?',
          '',
          'Merci d’avance,',
          'Bien cordialement,',
        ]
          .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
          .join('\n');
    }
  }

  switch (category) {
    case 'tattoo':
      return [
        'Hello,',
        '',
        tattooLineEn,
        budgetLine,
        '',
        'Could you please let me know about feasibility, timeline and pricing for this project?',
        'I am happy to share more details or references if helpful.',
        '',
        'Thank you in advance for your reply,',
        'Kind regards,',
      ].join('\n');
    case 'partnership':
      return [
        'Hello,',
        '',
        'I would like to discuss a potential partnership with you.',
        'I would be glad to briefly introduce my project / organisation and see whether there is a good fit.',
        '',
        'Would you be open to a short conversation?',
        '',
        'Thank you in advance,',
        'Kind regards,',
      ].join('\n');
    case 'invitation':
      return [
        'Hello,',
        '',
        'I am reaching out to share an invitation with you.',
        'I would be delighted to give you more details and hear whether this might interest you.',
        '',
        'Thank you for your time,',
        'Kind regards,',
      ].join('\n');
    case 'informations':
      return [
        'Hello,',
        '',
        zones.length > 0
          ? `I would like some information about a tattoo project on: ${zoneList}.`
          : 'I would like some general information about your work and availability.',
        budgetLabel ? budgetLine : '',
        '',
        'Could you please let me know how to proceed and what details would be useful on your side?',
        '',
        'Thank you in advance,',
        'Kind regards,',
      ]
        .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
        .join('\n');
  }
}

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024; // 4 MB each
export const ACCEPT_ATTACHMENTS =
  'image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf';
