// Notification Permission Dialog Component
// Shows when app loads to request notification permission

import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBell, cilCheckCircle, cilX } from '@coreui/icons';

const NotificationPermissionDialog = ({ show: showProp, onPermissionGranted, onPermissionDenied }) => {
  const [show, setShow] = useState(showProp || false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [currentPermission, setCurrentPermission] = useState(() => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Update show state when prop changes - always show when prop is true
  useEffect(() => {
    console.log('NotificationPermissionDialog - showProp changed:', showProp);
    if (showProp !== undefined) {
      setShow(showProp);
      console.log('NotificationPermissionDialog - set show to:', showProp);
    }
  }, [showProp]);

  // Update current permission when dialog shows
  useEffect(() => {
    if (show && 'Notification' in window) {
      const perm = Notification.permission;
      setCurrentPermission(perm);
      console.log('Current notification permission:', perm);
    }
  }, [show]);

  // Debug: log when show state changes
  useEffect(() => {
    console.log('NotificationPermissionDialog - show state:', show);
  }, [show]);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const currentPermission = Notification.permission;
      console.log('Current notification permission:', currentPermission);
      
      // If permission is already granted, browser won't show prompt again
      // Just register service worker and close
      if (currentPermission === 'granted') {
        console.log('Permission already granted - browser will not show prompt again');
        // Still register service worker
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered for notifications');
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        }
        setShow(false);
        if (onPermissionGranted) {
          onPermissionGranted();
        }
        setIsRequesting(false);
        return;
      }
      
      // Request permission - this will show the native browser prompt if permission is 'default'
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      localStorage.setItem('notification-permission-requested', 'true');
      localStorage.setItem('notification-permission', permission);
      
      setShow(false);
      
      if (permission === 'granted') {
        // Register service worker for background notifications
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered for notifications');
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        }
        
        if (onPermissionGranted) {
          onPermissionGranted();
        }
      } else {
        if (onPermissionDenied) {
          onPermissionDenied();
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setShow(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    localStorage.setItem('notification-permission-requested', 'true');
    localStorage.setItem('notification-permission', 'denied');
    setShow(false);
    
    if (onPermissionDenied) {
      onPermissionDenied();
    }
  };

  const handleClose = () => {
    // User closed without choosing - mark as requested but don't set permission
    localStorage.setItem('notification-permission-requested', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <CModal 
      visible={show} 
      onClose={handleClose}
      backdrop="static"
      keyboard={false}
      className="notification-permission-modal"
    >
      <CModalHeader>
        <CModalTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CIcon icon={cilBell} size="lg" style={{ color: '#3b91ed' }} />
            <span>Enable Notifications</span>
          </div>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div style={{ padding: '1rem 0' }}>
          {currentPermission === 'granted' && (
            <div style={{ 
              backgroundColor: '#fef3c7', 
              padding: '0.75rem', 
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#92400e',
              marginBottom: '1rem'
            }}>
              <strong>Note:</strong> Notifications are already enabled. The browser prompt only appears once. To see it again, reset notification permission in your browser settings (click the lock/info icon in the address bar).
            </div>
          )}
          <p style={{ fontSize: '1rem', marginBottom: '1rem', color: '#333' }}>
            Stay updated with important updates from your Talent Management System!
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.5rem' }}>
              <CIcon icon={cilCheckCircle} size="sm" style={{ color: '#16a34a', marginTop: '4px' }} />
              <span style={{ fontSize: '0.9rem' }}>Receive instant notifications about new candidates, job updates, and reminders</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.5rem' }}>
              <CIcon icon={cilCheckCircle} size="sm" style={{ color: '#16a34a', marginTop: '4px' }} />
              <span style={{ fontSize: '0.9rem' }}>Get notified even when the app is closed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CIcon icon={cilCheckCircle} size="sm" style={{ color: '#16a34a', marginTop: '4px' }} />
              <span style={{ fontSize: '0.9rem' }}>Desktop notifications work across all browsers</span>
            </div>
          </div>
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            padding: '0.75rem', 
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#0369a1'
          }}>
            <strong>Note:</strong> You can change this setting anytime in your browser settings.
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton 
          color="secondary" 
          variant="outline" 
          onClick={handleDeny}
          disabled={isRequesting}
        >
          Not Now
        </CButton>
        <CButton 
          color="primary" 
          onClick={handleAllow}
          disabled={isRequesting}
        >
          {isRequesting ? 'Enabling...' : 'Allow Notifications'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default NotificationPermissionDialog;
