import { supabase, GALLERY_BUCKET } from './supabase';
import { compressImage, fileExtension } from './imageUtils';
import type {
  Biography,
  GalleryCategory,
  GalleryImage,
  SiteEvent,
  SiteInfo,
  SiteSettings,
} from './types';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// ============================================================
// Gallery
// ============================================================

export async function listGalleryImages(category: GalleryCategory): Promise<GalleryImage[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('gallery_images')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function uploadGalleryImage(category: GalleryCategory, file: File): Promise<void> {
  const client = requireClient();
  const blob = await compressImage(file);
  const path = `${category}/${crypto.randomUUID()}.${fileExtension(blob.type || file.type)}`;

  const { error: uploadError } = await client.storage
    .from(GALLERY_BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await client.from('gallery_images').insert({
    category,
    storage_path: path,
    title: file.name.replace(/\.[^.]+$/, ''),
  });
  if (insertError) {
    // Avoid orphan files if the metadata insert fails
    await client.storage.from(GALLERY_BUCKET).remove([path]);
    throw new Error(insertError.message);
  }
}

export async function deleteGalleryImage(image: GalleryImage): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('gallery_images').delete().eq('id', image.id);
  if (error) throw new Error(error.message);
  await client.storage.from(GALLERY_BUCKET).remove([image.storage_path]);
}

// ============================================================
// Events
// ============================================================

export async function listEvents(): Promise<SiteEvent[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });
  if (error) throw new Error(error.message);

  // Coerce lat/lng — PostgREST may return numerics as strings
  return (data ?? []).map((row) => {
    const event = row as SiteEvent;
    const lat = event.latitude == null ? null : Number(event.latitude);
    const lng = event.longitude == null ? null : Number(event.longitude);
    return {
      ...event,
      latitude: lat != null && Number.isFinite(lat) ? lat : null,
      longitude: lng != null && Number.isFinite(lng) ? lng : null,
    };
  });
}

export type EventInput = Omit<SiteEvent, 'id' | 'created_at'>;

export async function createEvent(input: EventInput): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('events').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('events').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteEvent(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('events').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================
// Single-row content (biography, site info, settings)
// ============================================================

async function getSingleRow<T>(table: string): Promise<T> {
  const client = requireClient();
  const { data, error } = await client.from(table).select('*').eq('id', 1).single();
  if (error) throw new Error(error.message);
  return data as T;
}

async function saveSingleRow<T extends object>(table: string, values: Partial<T>): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from(table)
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw new Error(error.message);
}

export const getBiography = () => getSingleRow<Biography>('biography');
export const saveBiography = (values: Partial<Biography>) => saveSingleRow('biography', values);

export const getSiteInfo = () => getSingleRow<SiteInfo>('site_info');
export const saveSiteInfo = (values: Partial<SiteInfo>) => saveSingleRow('site_info', values);

export const getSiteSettings = () => getSingleRow<SiteSettings>('site_settings');
export const saveSiteSettings = (values: Partial<SiteSettings>) =>
  saveSingleRow('site_settings', values);

export async function uploadBiographyPhoto(file: File): Promise<string> {
  const client = requireClient();
  const blob = await compressImage(file);
  const path = `biography/${crypto.randomUUID()}.${fileExtension(blob.type || file.type)}`;
  const { error } = await client.storage
    .from(GALLERY_BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type });
  if (error) throw new Error(error.message);
  return path;
}
