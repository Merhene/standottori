import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isSupabaseConfigured } from '../lib/supabase';
import { listEvents } from '../lib/content';
import type { SiteEvent } from '../lib/types';

export default function Events() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listEvents()
      .then((all) => setEvents(all.filter((e) => e.status !== 'cancelled')))
      .catch(() => {
        // Backend unavailable: the placeholder is shown instead
      })
      .finally(() => setIsLoading(false));
  }, []);

  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-GB';
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= today && e.status === 'upcoming');
  const past = events.filter((e) => e.event_date < today || e.status === 'past');

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  const renderEvent = (event: SiteEvent) => (
    <li
      key={event.id}
      className="border border-light-text/10 dark:border-dark-text/10 rounded-lg p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        <time dateTime={event.event_date} className="text-sm opacity-70">
          {formatDate(event.event_date)}
        </time>
      </div>
      {event.location && (
        <p className="text-sm opacity-70 mt-1">
          <i className="pi pi-map-marker text-xs mr-1" aria-hidden="true" />
          {event.location}
        </p>
      )}
      {event.description && <p className="mt-3">{event.description}</p>}
    </li>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">{t('events.title')}</h1>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-light-text/5 dark:bg-dark-text/5 rounded-lg p-8 text-center">
          <p className="text-lg">{t('events.coming_soon')}</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{t('events.upcoming')}</h2>
              <ul className="flex flex-col gap-4 list-none m-0 p-0">{upcoming.map(renderEvent)}</ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('events.past')}</h2>
              <ul className="flex flex-col gap-4 list-none m-0 p-0 opacity-70">
                {past.map(renderEvent)}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
