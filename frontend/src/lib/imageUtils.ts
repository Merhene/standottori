const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;

/**
 * Downscales an image to MAX_DIMENSION on its longest side and re-encodes it
 * as JPEG (or keeps PNG for images with transparency hints). Runs fully in the
 * browser so the artist can upload phone photos without killing the bandwidth.
 */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, type === 'image/jpeg' ? JPEG_QUALITY : undefined)
  );

  // Keep the original if compression failed or made the file bigger
  if (!blob || blob.size >= file.size) return file;
  return blob;
}

export function fileExtension(type: string): string {
  return type === 'image/png' ? 'png' : 'jpg';
}
