import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
//import AppSidebar from './AppSidebar';
//import { AppSidebarNav } from './AppSidebarNav';
//import AppHeader from './AppHeader';
//import AppFooter from './AppFooter';
//import AppContent from './AppContent';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'


const ProtectedRoute = ({ allowedRoles, role, children }) => {

    const userRole = localStorage.getItem('role')
    console.log("user role:", userRole)
    if (!role) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
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
