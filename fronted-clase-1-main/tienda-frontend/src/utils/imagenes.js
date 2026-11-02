/**
 * src/utils/imagenes.js
 * Función para resolver la URL de la imagen de un producto según el contrato DSI2:
 * - Si no hay imagen (imagen_url llega en null/undefined), devuelve null.
 * - Si la hay, concatena la variable de entorno VITE_API_URL adelante de la ruta relativa (/static/productos/...).
 */

export function urlImagen(producto) {
  if (!producto) {
    return null;
  }

  const rawUrl = (producto.imagen_url || producto.imagen || '').trim();
  if (!rawUrl) return null;

  // Si ya es una URL completa (http/https), devolverla directamente
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  // Si apunta directamente a un asset público local (comienza con /flan_)
  if (rawUrl.startsWith('/flan_') || rawUrl.startsWith('flan_')) {
    return rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  }

  const baseUrl = import.meta.env.VITE_API_URL ?? '';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;

  return `${cleanBase}${cleanPath}`;
}
