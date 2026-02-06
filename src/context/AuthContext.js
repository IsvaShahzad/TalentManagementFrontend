import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

// JWT token key in localStorage
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

/**
 * Decode JWT token without external library
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload
 */
const decodeJWT = (token) => {
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
const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
};

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Decode token and get user info
  const decodedToken = useMemo(() => {
    if (!token) return null;
    return decodeJWT(token);
  }, [token]);

  // Check if authenticated
  const isAuthenticated = useMemo(() => {
    return token && !isTokenExpired(token);
  }, [token]);

  // Get user role from JWT token (preferred) or user object
  const role = useMemo(() => {
    if (decodedToken?.role) return decodedToken.role;
    if (user?.role) return user.role;
    return null;
  }, [decodedToken, user]);

  // Get user info from JWT token
  const userInfo = useMemo(() => {
    if (decodedToken) {
      return {
        user_id: decodedToken.user_id,
        email: decodedToken.email,
        role: decodedToken.role,
        full_name: decodedToken.full_name,
      };
    }
    return user;
  }, [decodedToken, user]);

  // Login function
  const login = useCallback((newToken, userData) => {
    // Ensure notifications_enabled is included in userData
    const userWithNotifications = {
      ...userData,
      notifications_enabled: userData.notifications_enabled !== undefined ? userData.notifications_enabled : true
    };
    
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithNotifications));
    localStorage.setItem('user', JSON.stringify(userWithNotifications)); // Also set 'user' for backward compatibility
    // Keep legacy localStorage items for backward compatibility
    localStorage.setItem('role', userData.role);
    localStorage.setItem('user_id', userData.user_id);
    localStorage.setItem('user_email', userData.email);
    
    setToken(newToken);
    setUser(userWithNotifications);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('showLoginToast');
    localStorage.removeItem('loggedInRole');
    
    setToken(null);
    setUser(null);
  }, []);

  // Check token validity on mount and periodically
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken && isTokenExpired(storedToken)) {
        console.log('Token expired, logging out...');
        logout();
      }
      setLoading(false);
    };

    checkAuth();

    // Check every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [logout]);

  // Get authorization header for API requests
  const getAuthHeader = useCallback(() => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, [token]);

  // Helper to check if user has specific role
  const hasRole = useCallback((requiredRole) => {
    if (!role) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.map(r => r.toLowerCase()).includes(role.toLowerCase());
    }
    return role.toLowerCase() === requiredRole.toLowerCase();
  }, [role]);

  // Helper to check if user is admin
  const isAdmin = useMemo(() => hasRole('Admin'), [hasRole]);
  
  // Helper to check if user is recruiter
  const isRecruiter = useMemo(() => hasRole('Recruiter'), [hasRole]);
  
  // Helper to check if user is client
  const isClient = useMemo(() => hasRole('Client'), [hasRole]);

  const value = {
    // State
    token,
    user: userInfo,
    role,
    loading,
    isAuthenticated,
    
    // Role helpers
    isAdmin,
    isRecruiter,
    isClient,
    hasRole,
    
    // Actions
    login,
    logout,
    getAuthHeader,
    
    // Utilities
    decodeJWT,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * HOC to protect routes based on roles
 */
export const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function WithAuthComponent(props) {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      window.location.href = '/#/login';
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.map(r => r.toLowerCase()).includes(role?.toLowerCase())) {
      return <div>Access Denied</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthContext;
