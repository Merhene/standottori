export type GalleryCategory = 'tattoo' | 'flash' | 'wallpaper' | 'biography' | 'cover';

/** Fixed slots for the /gallery hub panels */
export type GalleryCoverSlot = 'book' | 'flash';

export interface GalleryImage {
  id: string;
  category: GalleryCategory;
  storage_path: string;
  title: string | null;
  sort_order: number;
  created_at: string;
}

export type EventStatus = 'upcoming' | 'past' | 'cancelled';

export interface SiteEvent {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  description: string | null;
  status: EventStatus;
  /** WGS84 — null when the event has no map pin yet */
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Biography {
  id: number;
  /** @deprecated Prefer title_fr — kept in sync as French mirror */
  title: string | null;
  /** @deprecated Prefer content_fr — kept in sync as French mirror */
  content: string | null;
  title_fr: string | null;
  title_en: string | null;
  content_fr: string | null;
  content_en: string | null;
  photo_path: string | null;
  image_top_path: string | null;
  image_bottom_path: string | null;
  updated_at: string;
}

export interface SiteInfo {
  id: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  /** @deprecated No longer shown publicly; cleared on admin save */
  opening_hours: string | null;
  /** Public intake / booking form the visitor can fill and attach */
  form_url: string | null;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  default_theme: 'light' | 'dark' | 'system';
  lockscreen_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  updated_at: string;
}
