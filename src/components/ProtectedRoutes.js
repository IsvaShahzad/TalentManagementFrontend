import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
//import AppSidebar from './AppSidebar';
//import { AppSidebarNav } from './AppSidebarNav';
//import AppHeader from './AppHeader';
//import AppFooter from './AppFooter';
//import AppContent from './AppContent';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useAuth } from '../context/AuthContext';


const ProtectedRoute = ({ allowedRoles, role: propRole, children }) => {
    const { role: authRole, isAuthenticated, loading } = useAuth();
    
    // Use JWT role from auth context, with prop fallback for backward compatibility
    const userRole = authRole || propRole || localStorage.getItem('role');
    
    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    
    console.log("user role (JWT):", userRole);
    
    if (!userRole) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    // Normalize role comparison (case-insensitive)
    const normalizedAllowedRoles = Array.isArray(allowedRoles) 
        ? allowedRoles.map(r => r.toLowerCase())
        : [allowedRoles.toLowerCase()];
    
    if (!normalizedAllowedRoles.includes(userRole.toLowerCase())) {
        // Logged in but not allowed
        return <Navigate to="/not-authorized" replace />;
    }
    
    return (
        <div className="d-flex">
            <AppSidebar />
            <div className="wrapper d-flex flex-column flex-grow-1 min-vh-100">
                <AppHeader />
                <div className="body flex-grow-1">
                    {children ? children : <Outlet />}
                </div>
                <AppFooter />
            </div>
        </div>
    );
};

export default ProtectedRoute;
