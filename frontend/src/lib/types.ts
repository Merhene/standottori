export type GalleryCategory = 'tattoo' | 'flash' | 'wallpaper' | 'biography';

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
  created_at: string;
}

export interface Biography {
  id: number;
  title: string | null;
  content: string | null;
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
  opening_hours: string | null;
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
