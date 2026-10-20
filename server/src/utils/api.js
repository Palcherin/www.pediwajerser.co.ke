const PROD_API = 'https://api.pediwajersey.co.ke';
const LOCAL_API = 'http://localhost:5000';

// Picks the API from the address the site is opened on, so one build works everywhere
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API = import.meta.env.VITE_API_URL || (isLocal ? LOCAL_API : PROD_API);

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login?expired=1';   // change to your login route
    throw new Error('Session expired. Please log in again.');
  }
  return res;
};