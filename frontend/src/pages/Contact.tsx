import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export default function Contact() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sendState, setSendState] = useState<SendState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setSendState('sending');
    const { error } = await supabase.functions.invoke('contact-email', {
      body: { name, email, message },
    });

    if (error) {
      setSendState('error');
      return;
    }

    setSendState('sent');
    setName('');
    setEmail('');
    setMessage('');
  };

  const inputClass =
    'w-full px-4 py-2 border border-light-text/20 dark:border-dark-text/20 rounded-lg bg-transparent';

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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t('contact.title')}</h1>

      {sendState === 'sent' ? (
        <div role="status" className="border border-green-500 rounded-lg p-8 text-center">
          <i className="pi pi-check-circle text-3xl text-green-500 mb-4" style={{ display: 'block' }} />
          <p className="text-lg">{t('contact.sent')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label htmlFor="contact-message" className="block text-sm font-semibold mb-2">
              {t('contact.message')} *
            </label>
            <textarea
              id="contact-message"
              required
              maxLength={5000}
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
          </div>

          {sendState === 'error' && (
            <p role="alert" className="text-sm text-red-500">
              {t('contact.error')}
            </p>
          )}

          <button
            type="submit"
            disabled={sendState === 'sending'}
            className="self-start px-6 py-2 bg-light-text dark:bg-dark-text text-light-bg dark:text-dark-bg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sendState === 'sending' ? t('contact.sending') : t('contact.send')}
          </button>
        </form>
      )}
    </div>
  );
}
