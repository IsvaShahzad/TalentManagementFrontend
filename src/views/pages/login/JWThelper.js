// src/views/login/JWThelper.js
// NOTE: This file is deprecated. Use AuthContext instead.
// Keeping for backward compatibility.

/**
 * Decode JWT token without external library (browser-safe)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired or invalid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

/**
 * Get user info from stored JWT token
 * @returns {Object|null} User info from token
 */
export const getUserFromToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  return decodeJWT(token);
};

/**
 * Get role from JWT token
 * @returns {string|null} User role
 */
export const getRoleFromToken = () => {
  const user = getUserFromToken();
  return user?.role || null;
};

// Legacy export for backward compatibility
export const generateJWT = () => {
  console.warn('generateJWT is deprecated. JWT generation should happen on the server.');
  return null;
};
