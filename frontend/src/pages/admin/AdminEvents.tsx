import { useEffect, useState } from 'react';
import { AdminBreadcrumb } from '../../components/admin';
import StatusBanner, { type Status } from '../../components/admin/StatusBanner';
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

  const openCreate = () => {
    setForm(EMPTY_FORM);
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
    });
    setEditingId(event.id);
    setIsFormOpen(true);
    setStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      if (editingId) {
        await updateEvent(editingId, form);
        setStatus({ kind: 'success', message: 'Événement mis à jour.' });
      } else {
        await createEvent(form);
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
            <div>
              <label htmlFor="event-location" className="block text-sm font-semibold mb-2">
                Lieu
              </label>
              <input
                id="event-location"
                type="text"
                value={form.location ?? ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
              />
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
              <th className="text-left px-4 py-3 font-semibold">Statut</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-center opacity-50" colSpan={5}>
                  Chargement…
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4 text-center opacity-50" colSpan={5}>
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
