import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EventsMap from '../features/events/EventsMap';
import { hasCoordinates } from '../features/events/geocode';
import { isSupabaseConfigured } from '../lib/supabase';
import { listEvents } from '../lib/content';
import type { SiteEvent } from '../lib/types';
import './Events.css';

export default function Events() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

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

  const visible =
    filter === 'upcoming' ? upcoming : filter === 'past' ? past : [...upcoming, ...past];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  const selectEvent = (id: string | null) => {
    setSelectedId(id);
    if (!id) return;
    const el = document.getElementById(`event-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const renderEvent = (event: SiteEvent) => {
    const isSelected = event.id === selectedId;
    const onMap = hasCoordinates(event);

    return (
      <li key={event.id}>
        <button
          type="button"
          id={`event-${event.id}`}
          className={`events-page__item${isSelected ? ' is-selected' : ''}${
            onMap ? '' : ' is-unmapped'
          }`}
          onClick={() => selectEvent(isSelected ? null : event.id)}
          aria-pressed={isSelected}
        >
          <div className="events-page__item-head">
            <h3 className="events-page__item-title">{event.title}</h3>
            <time dateTime={event.event_date} className="events-page__item-date">
              {formatDate(event.event_date)}
            </time>
          </div>
          {event.location && (
            <p className="events-page__item-loc">
              <i className="pi pi-map-marker text-xs" aria-hidden="true" />
              {event.location}
              {!onMap && (
                <span className="events-page__item-nomap"> · {t('events.not_on_map')}</span>
              )}
            </p>
          )}
          {event.description && <p className="events-page__item-desc">{event.description}</p>}
        </button>
      </li>
    );
  };

  return (
    <div className="events-page">
      <header className="events-page__intro">
        <h1 className="events-page__title">{t('events.title')}</h1>
        <p className="events-page__lead">{t('events.lead')}</p>
      </header>

      {isLoading ? (
        <div className="events-page__loading">
          <i className="pi pi-spinner pi-spin text-2xl" aria-label="Chargement" />
        </div>
      ) : events.length === 0 ? (
        <div className="events-page__empty">
          <p>{t('events.coming_soon')}</p>
        </div>
      ) : (
        <>
          <EventsMap
            events={visible}
            selectedId={selectedId}
            onSelect={selectEvent}
            formatDate={formatDate}
            emptyLabel={t('events.map_empty')}
            closeLabel={t('events.map_close')}
            upcomingLabel={t('events.upcoming')}
            pastLabel={t('events.past')}
            today={today}
          />

          <div className="events-page__filters" role="tablist" aria-label={t('events.filter_label')}>
            {(
              [
                ['all', t('events.filter_all')],
                ['upcoming', t('events.upcoming')],
                ['past', t('events.past')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={`events-page__filter${filter === id ? ' is-active' : ''}`}
                onClick={() => {
                  setFilter(id);
                  setSelectedId(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="events-page__lists">
            {filter !== 'past' && upcoming.length > 0 && (
              <section className="events-page__section">
                <h2 className="events-page__section-title">{t('events.upcoming')}</h2>
                <ul className="events-page__list">
                  {(filter === 'all' ? upcoming : visible).map(renderEvent)}
                </ul>
              </section>
            )}
            {filter !== 'upcoming' && past.length > 0 && (
              <section className="events-page__section events-page__section--past">
                <h2 className="events-page__section-title">{t('events.past')}</h2>
                <ul className="events-page__list">
                  {(filter === 'all' ? past : visible).map(renderEvent)}
                </ul>
              </section>
            )}
            {visible.length === 0 && (
              <p className="events-page__empty-filter">{t('events.filter_empty')}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
