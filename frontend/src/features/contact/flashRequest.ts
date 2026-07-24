/** Navigation state passed from the flash gallery lightbox → Contact */
export interface FlashRequestPayload {
  id: string;
  storage_path: string;
  title: string | null;
}

export interface FlashRequestLocationState {
  flash?: FlashRequestPayload;
}

export function flashFilename(storagePath: string, id: string): string {
  const base = storagePath.split('/').pop()?.trim();
  if (base && base.includes('.')) return base;
  return `flash-${id}.jpg`;
}
