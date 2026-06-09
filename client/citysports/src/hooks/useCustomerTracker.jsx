import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const API = 'http://localhost:5000/api';

export const getSessionId = () => {
  let id = localStorage.getItem('pwj_session');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('pwj_session', id);
  }
  return id;
};

// Safe tracking hook (fails silently)
const useCustomerTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch(`${API}/customers/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: getSessionId(),
            page: location.pathname,
            referrer: document.referrer || '',
          }),
        });
      } catch (err) {
        // Fail silently - don't break the UI
        console.warn('Customer tracking failed (non-critical)');
      }
    };

    trackVisit();
  }, [location.pathname]);
};

export default useCustomerTracker;