const API_BASE = 'http://localhost:5000';

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return res;
};