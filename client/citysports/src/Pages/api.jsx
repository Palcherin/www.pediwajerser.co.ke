export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Expired or invalid token: clear the session and send the user to login
  if (res.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login?expired=1'; // change to your login route if different
    throw new Error('Session expired. Please log in again.');
  }
  return res;
};