import { useEffect, useRef, useState } from 'react';
import { AdminBreadcrumb } from '../../components/admin';
import StatusBanner, { type Status } from '../../components/admin/StatusBanner';
import { searchPlaces, type GeocodeResult } from '../../features/events/geocode';
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type EventInput,
} from '../../lib/content';
import type { SiteEvent, EventStatus } from '../../lib/types';

const EMPTY_FORM: EventInput = {
  title: '',
  event_date: '',
  location: '',
  description: '',
  status: 'upcoming',
  latitude: null,
  longitude: null,
};

const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'À venir',
  past: 'Passé',
  cancelled: 'Annulé',
};

export default function AdminEvents() {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);
  const [form, setForm] = useState<EventInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geoTimer = useRef<number | null>(null);

  const refresh = async () => {
    try {
      setEvents(await listEvents());
    } catch (error) {
      setStatus({ kind: 'error', message: `Chargement impossible : ${(error as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    return () => {
      if (geoTimer.current) window.clearTimeout(geoTimer.current);
    };
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setPlaceQuery('');
    setSuggestions([]);
    setEditingId(null);
    setIsFormOpen(true);
    setStatus(null);
  };

  const openEdit = (event: SiteEvent) => {
    setForm({
      title: event.title,
      event_date: event.event_date,
      location: event.location ?? '',
      description: event.description ?? '',
      status: event.status,
      latitude: event.latitude ?? null,
      longitude: event.longitude ?? null,
    });
    setPlaceQuery(event.location ?? '');
    setSuggestions([]);
    setEditingId(event.id);
    setIsFormOpen(true);
    setStatus(null);
  };

  const scheduleGeocode = (query: string) => {
    setPlaceQuery(query);
    setForm((prev) => ({ ...prev, location: query }));
    if (geoTimer.current) window.clearTimeout(geoTimer.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    geoTimer.current = window.setTimeout(async () => {
      setIsGeocoding(true);
      try {
        setSuggestions(await searchPlaces(query, 'fr'));
      } catch {
        setSuggestions([]);
      } finally {
        setIsGeocoding(false);
      }
    }, 550);
  };

  const pickPlace = (place: GeocodeResult) => {
    setForm((prev) => ({
      ...prev,
      location: place.label,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
    setPlaceQuery(place.label);
    setSuggestions([]);
  };

  const clearCoords = () => {
    setForm((prev) => ({ ...prev, latitude: null, longitude: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    const payload: EventInput = {
      ...form,
      location: form.location?.trim() || null,
      description: form.description?.trim() || null,
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        setStatus({ kind: 'success', message: 'Événement mis à jour.' });
      } else {
        await createEvent(payload);
        setStatus({ kind: 'success', message: 'Événement créé.' });
      }
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await refresh();
    } catch (error) {
      setStatus({ kind: 'error', message: `Enregistrement impossible : ${(error as Error).message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (event: SiteEvent) => {
    if (!window.confirm(`Supprimer définitivement « ${event.title} » ?`)) return;

    try {
      await deleteEvent(event.id);
      setStatus({ kind: 'success', message: 'Événement supprimé.' });
      await refresh();
    } catch (error) {
      setStatus({ kind: 'error', message: `Suppression impossible : ${(error as Error).message}` });
    }
  };

  const inputClass =
    'w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent';

  const hasPin =
    typeof form.latitude === 'number' &&
    typeof form.longitude === 'number' &&
    Number.isFinite(form.latitude) &&
    Number.isFinite(form.longitude);

  return (
    <div className="p-6">
      <AdminBreadcrumb items={[{ label: 'Événements' }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Événements</h1>
        <button onClick={openCreate} className="admin-btn">
          <i className="pi pi-plus" />
          Ajouter un événement
        </button>
      </div>

      <StatusBanner status={status} />

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Modifier l'événement" : 'Nouvel événement'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="event-title" className="block text-sm font-semibold mb-2">
                Titre *
              </label>
              <input
                id="event-title"
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="event-date" className="block text-sm font-semibold mb-2">
                Date *
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2 relative">
              <label htmlFor="event-location" className="block text-sm font-semibold mb-2">
                Lieu (recherche carte)
              </label>
              <input
                id="event-location"
                type="text"
                value={placeQuery}
                onChange={(e) => scheduleGeocode(e.target.value)}
                placeholder="Ex. Paris, Lyon, Bruxelles…"
                className={inputClass}
                autoComplete="off"
              />
              <p className="text-xs opacity-50 mt-1.5 m-0">
                Tapez une ville puis choisissez une suggestion pour placer l’épingle sur la carte
                publique.
              </p>
              {isGeocoding && (
                <p className="text-xs opacity-60 mt-1 m-0">Recherche en cours…</p>
              )}
              {suggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-auto list-none m-0 p-0 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-lg">
                  {suggestions.map((place) => (
                    <li key={`${place.latitude}-${place.longitude}-${place.label}`}>
                      <button
                        type="button"
                        onClick={() => pickPlace(place)}
                        className="w-full text-left px-3 py-2 text-sm bg-transparent border-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        {place.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label htmlFor="event-status" className="block text-sm font-semibold mb-2">
                Statut
              </label>
              <select
                id="event-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
                className={inputClass}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              {hasPin ? (
                <p className="text-sm m-0 mb-2">
                  <i className="pi pi-map-marker mr-1" aria-hidden="true" />
                  Pin : {form.latitude!.toFixed(4)}, {form.longitude!.toFixed(4)}{' '}
                  <button
                    type="button"
                    onClick={clearCoords}
                    className="underline opacity-70 hover:opacity-100 bg-transparent border-none cursor-pointer text-inherit p-0"
                  >
                    retirer
                  </button>
                </p>
              ) : (
                <p className="text-sm opacity-50 m-0 mb-2">Pas encore d’épingle carte</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="event-description" className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              id="event-description"
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="admin-btn disabled:opacity-50">
              <i className={`pi ${isSaving ? 'pi-spinner pi-spin' : 'pi-save'}`} />
              {isSaving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:opacity-70 transition-opacity"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Titre</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Lieu</th>
              <th className="text-left px-4 py-3 font-semibold">Carte</th>
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-center opacity-50" colSpan={6}>
                  Chargement…
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4 text-center opacity-50" colSpan={6}>
                  Aucun événement pour le moment
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">{event.title}</td>
                  <td className="px-4 py-3">
                    {new Date(event.event_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">{event.location}</td>
                  <td className="px-4 py-3">
                    {event.latitude != null && event.longitude != null ? (
                      <span title={`${event.latitude}, ${event.longitude}`}>
                        <i className="pi pi-map-marker" aria-label="Sur la carte" />
                      </span>
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{STATUS_LABELS[event.status]}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(event)}
                      className="p-2 hover:opacity-70 transition-opacity"
                      aria-label={`Modifier ${event.title}`}
                    >
                      <i className="pi pi-pencil" />
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="p-2 text-red-500 hover:opacity-70 transition-opacity"
                      aria-label={`Supprimer ${event.title}`}
                    >
                      <i className="pi pi-trash" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
