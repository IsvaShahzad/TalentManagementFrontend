import { jwtDecode } from "jwt-decode";

// export const getUserRoleFromToken = () => {
//   const token = localStorage.getItem("authToken");
//   if (!token) return null;

//   try {
//     const decoded = jwtDecode(token);
//     return decoded.role; 
//   } catch (err) {
//     console.error("Invalid token", err);
//     return null;
//   }
// };

export const getUserFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    return null;
  }
};


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
