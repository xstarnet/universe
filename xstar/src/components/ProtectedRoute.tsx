import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { preferences } from '../utils/preferences';

const ProtectedRoute: React.FC<{ element?: React.ReactNode }> = ({ element }) => {
  // Check if user is authenticated (token exists)
  const token = preferences.get('token');

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected element
  return element ? <>{element}</> : <Outlet />;
};

export default ProtectedRoute;
