// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const PrivateRoute = ({ roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // Check if the user is logged in and has the correct role
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
