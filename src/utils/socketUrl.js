/**
 * Socket.IO must use the same origin as the REST API (no /api path).
 * Override with VITE_SOCKET_URL if the socket server differs from the API host.
 */
export function getSocketBaseUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit && String(explicit).trim()) {
    return String(explicit).replace(/\/$/, '');
  }
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  const apiBase = isLocal
    ? import.meta.env.VITE_API_BASE_URL_LOCAL
    : import.meta.env.VITE_API_BASE_URL;
  if (!apiBase) return '';
  return String(apiBase).replace(/\/api\/?$/, '');
}
