import { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BodyMap from '../features/bodymap/BodyMap';
import { formatPlacementLines, type SelectedPart } from '../features/bodymap/selection';
import {
  ACCEPT_ATTACHMENTS,
  buildMessageTemplate,
  CATEGORIES,
  CURRENCIES,
  formatBudget,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  type ContactCategory,
  type Currency,
} from '../features/contact/templates';
import { getSiteInfo } from '../lib/content';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

interface AttachmentFile {
  id: string;
  file: File;
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export default function Contact() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ContactCategory>('tattoo');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [message, setMessage] = useState('');
  const [messageDirty, setMessageDirty] = useState(false);
  const [placements, setPlacements] = useState<SelectedPart[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState<string | null>(null);
  const [sendState, setSendState] = useState<SendState>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zones = useMemo(() => formatPlacementLines(placements, t), [placements, t]);
  const budgetLabel = formatBudget(budget, currency);
  const showBudget = category === 'tattoo' || category === 'informations';
  const showBodyMap = category === 'tattoo' || category === 'informations';

  // Load artist form URL
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSiteInfo()
      .then((info) => setFormUrl(info.form_url?.trim() || null))
      .catch(() => setFormUrl(null));
  }, []);

  // Keep the starter message in sync until the visitor edits it
  useEffect(() => {
    if (messageDirty) return;
    setMessage(
      buildMessageTemplate({
        category,
        zones,
        budgetLabel: showBudget ? budgetLabel : '',
        lang,
      })
    );
  }, [category, zones, budgetLabel, showBudget, lang, messageDirty]);

  const handleCategoryChange = (next: ContactCategory) => {
    setCategory(next);
    setMessageDirty(false);
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    setMessageDirty(true);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setAttachError(null);

    const incoming = Array.from(fileList);
    const next = [...attachments];

    for (const file of incoming) {
      if (next.length >= MAX_ATTACHMENTS) {
        setAttachError(t('contact.attach_too_many', { max: MAX_ATTACHMENTS }));
        break;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setAttachError(t('contact.attach_too_large', { name: file.name, max: '4' }));
        continue;
      }
      next.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file });
    }

    setAttachments(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setAttachError(null);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setCategory('tattoo');
    setBudget('');
    setCurrency('EUR');
    setPlacements([]);
    setAttachments([]);
    setMessageDirty(false);
    setAttachError(null);
    setMessage(
      buildMessageTemplate({
        category: 'tattoo',
        zones: [],
        budgetLabel: '',
        lang,
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setSendState('sending');
    try {
      const encoded = await Promise.all(
        attachments.map(async ({ file }) => ({
          filename: file.name,
          content: await fileToBase64(file),
          contentType: file.type || 'application/octet-stream',
        }))
      );

      const { error } = await supabase.functions.invoke('contact-email', {
        body: {
          name,
          email,
          message,
          category,
          budget: showBudget ? budgetLabel || null : null,
          placements: showBodyMap ? zones : [],
          attachments: encoded,
        },
      });

      if (error) {
        setSendState('error');
        return;
      }

      setSendState('sent');
      resetForm();
    } catch {
      setSendState('error');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-light-text/20 dark:border-dark-text/20 bg-transparent focus:outline-none focus:border-light-text/50 dark:focus:border-dark-text/50 transition-colors';
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('contact.title')}</h1>
        <div className="bg-light-text/5 dark:bg-dark-text/5 rounded-lg p-8 text-center">
          <p className="text-lg">{t('contact.coming_soon')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">{t('contact.title')}</h1>
      <p className="mb-10 opacity-65 max-w-2xl leading-relaxed">
        <Trans
          i18nKey="contact.intro"
          components={{
            formLink: formUrl ? (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-light-text/40 dark:decoration-dark-text/40 hover:opacity-100 opacity-90"
              />
            ) : (
              <span className="underline underline-offset-4 opacity-50" />
            ),
          }}
        />
      </p>

      {sendState === 'sent' ? (
        <div role="status" className="border border-green-500/60 p-8 text-center max-w-xl">
          <i className="pi pi-check-circle text-3xl text-green-500 mb-4" style={{ display: 'block' }} />
          <p className="text-lg">{t('contact.sent')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-14">
          {showBodyMap && (
            <BodyMap selected={placements} onChange={setPlacements} />
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
            <p className="text-xs tracking-[0.18em] uppercase opacity-50 m-0">
              {t('contact.form_title')}
            </p>

            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold mb-2">
                {t('contact.name')} *
              </label>
              <input
                id="contact-name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold mb-2">
                {t('contact.email')} *
              </label>
              <input
                id="contact-email"
                type="email"
                required
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="contact-category" className="block text-sm font-semibold mb-2">
                {t('contact.category')} *
              </label>
              <select
                id="contact-category"
                required
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ContactCategory)}
                className={selectClass}
              >
                {CATEGORIES.map((id) => (
                  <option key={id} value={id}>
                    {t(`contact.categories.${id}`)}
                  </option>
                ))}
              </select>
            </div>

            {showBudget && (
              <div>
                <label htmlFor="contact-budget" className="block text-sm font-semibold mb-2">
                  {t('contact.budget')}
                </label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    id="contact-budget"
                    type="text"
                    inputMode="decimal"
                    maxLength={20}
                    placeholder={t('contact.budget_placeholder')}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full min-w-0 px-4 py-2.5 border border-light-text/20 dark:border-dark-text/20 bg-transparent focus:outline-none focus:border-light-text/50 dark:focus:border-dark-text/50 transition-colors"
                  />
                  <select
                    id="contact-currency"
                    aria-label={t('contact.currency')}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-auto min-w-[5.5rem] px-3 py-2.5 border border-light-text/20 dark:border-dark-text/20 bg-transparent appearance-none cursor-pointer focus:outline-none focus:border-light-text/50 dark:focus:border-dark-text/50 transition-colors"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <label htmlFor="contact-message" className="block text-sm font-semibold">
                  {t('contact.message')} *
                </label>
                {messageDirty && (
                  <button
                    type="button"
                    className="text-xs tracking-wide uppercase opacity-50 hover:opacity-90 underline underline-offset-2"
                    onClick={() => setMessageDirty(false)}
                  >
                    {t('contact.reset_template')}
                  </button>
                )}
              </div>
              <textarea
                id="contact-message"
                required
                maxLength={5000}
                rows={10}
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                className={inputClass}
              />
              <p className="text-xs opacity-45 mt-1.5 m-0">{t('contact.message_hint')}</p>
            </div>

            <div>
              <p className="block text-sm font-semibold mb-2">{t('contact.attachments')}</p>
              <p className="text-xs opacity-50 mb-2 m-0">{t('contact.attachments_hint')}</p>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_ATTACHMENTS}
                multiple
                className="sr-only"
                id="contact-attachments"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-light-text/25 dark:border-dark-text/25 text-sm tracking-wide uppercase hover:border-light-text/60 dark:hover:border-dark-text/60 transition-colors"
                >
                  <i className="pi pi-paperclip text-sm" aria-hidden />
                  {t('contact.attach')}
                </button>

                {formUrl && (
                  <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-light-text/25 dark:border-dark-text/25 text-sm tracking-wide uppercase hover:border-light-text/60 dark:hover:border-dark-text/60 transition-colors"
                  >
                    <i className="pi pi-external-link text-sm" aria-hidden />
                    {t('contact.open_form')}
                  </a>
                )}
              </div>

              {attachments.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5 list-none p-0 m-0">
                  {attachments.map(({ id, file }) => (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-3 text-sm border border-light-text/15 dark:border-dark-text/15 px-3 py-2"
                    >
                      <span className="truncate">
                        {file.name}
                        <span className="opacity-45 ml-2">
                          ({Math.max(1, Math.round(file.size / 1024))} Ko)
                        </span>
                      </span>
                      <button
                        type="button"
                        className="opacity-50 hover:opacity-100 text-lg leading-none"
                        aria-label={t('contact.remove_attachment', { name: file.name })}
                        onClick={() => removeAttachment(id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {attachError && (
                <p role="alert" className="text-sm text-red-500 mt-2 m-0">
                  {attachError}
                </p>
              )}
            </div>

            {sendState === 'error' && (
              <p role="alert" className="text-sm text-red-500">
                {t('contact.error')}
              </p>
            )}

            <button
              type="submit"
              disabled={sendState === 'sending'}
              className="self-start px-6 py-2.5 bg-light-text dark:bg-dark-text text-light-bg dark:text-dark-bg hover:opacity-90 transition-opacity disabled:opacity-50 tracking-wide"
            >
              {sendState === 'sending' ? t('contact.sending') : t('contact.send')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
