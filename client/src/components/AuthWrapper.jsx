import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

function AuthWrapper({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check if token exists on mount
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 2. Setup inactivity timer
    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(() => {
        // Logout due to inactivity
        localStorage.removeItem('token');
        navigate('/login');
      }, INACTIVITY_TIMEOUT);
    };

    // Events that reset the timer
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup on unmount
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  return <>{children}</>;
}

export default AuthWrapper;
