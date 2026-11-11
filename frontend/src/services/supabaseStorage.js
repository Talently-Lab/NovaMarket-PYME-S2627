/**
 * Servicio de upload de imágenes a Supabase Storage.
 * Bucket: product-images (público)
 */

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET        = 'product-images';

/**
 * Sube un archivo de imagen a Supabase Storage.
 * @param {File} file - Archivo a subir
 * @param {string} folder - Carpeta dentro del bucket (ej: 'productos')
 * @returns {Promise<string>} URL pública de la imagen
 */
export async function uploadImage(file, folder = 'productos') {
  const ext      = file.name.split('.').pop().toLowerCase();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
    {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'apikey':        SUPABASE_ANON,
        'Content-Type':  file.type,
        'x-upsert':      'true',
      },
      body: file,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error al subir imagen (${res.status})`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

/**
 * Elimina una imagen de Supabase Storage dado su path relativo.
 * @param {string} url - URL pública de la imagen
 */
export async function deleteImage(url) {
  const path = url.split(`/object/public/${BUCKET}/`)[1];
  if (!path) return;

  await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
    {
      method:  'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'apikey':        SUPABASE_ANON,
      },
    }
  );
}

export const ACCEPTED_TYPES = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';
export const MAX_SIZE_MB     = 5;
export const MAX_IMAGES      = 5;

/**
 * Valida un archivo de imagen antes de subirlo.
 * @returns {string|null} mensaje de error o null si es válido
 */
export function validateImageFile(file) {
  const accepted = ['image/png','image/jpeg','image/jpg','image/webp','image/gif'];
  if (!accepted.includes(file.type)) {
    return `Formato no soportado: ${file.type}. Usá PNG, JPG, WebP o GIF.`;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `La imagen supera el límite de ${MAX_SIZE_MB}MB.`;
  }
  return null;
}
