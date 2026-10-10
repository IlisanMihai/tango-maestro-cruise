export const MAX_IMAGE_SIDE = 1600;

/**
 * Shrinks a photo in the browser before upload: longest side at most 1600 px,
 * WebP (JPEG where the browser cannot encode WebP). Keeps phone photos of
 * several MB down to a few hundred KB.
 */
export async function resizeImage(file: Blob, maxSide = MAX_IMAGE_SIDE): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await toBlob("image/webp", 0.82);
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg", 0.85);
  if (!jpeg) throw new Error("Could not encode the image");
  return jpeg;
}

export const extensionFor = (blob: Blob) => (blob.type === "image/webp" ? "webp" : "jpg");
