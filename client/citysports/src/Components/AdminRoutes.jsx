// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Wait for the context to read localStorage, otherwise a refresh sends admins to login
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Checking access...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};

export default AdminRoute;