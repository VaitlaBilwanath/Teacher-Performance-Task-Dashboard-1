import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        color: 'var(--text-primary)',
        background: 'var(--bg-main)'
      }}>
        Loading Intellitots Portal...
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    // Redirect to login if not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If logged in but doesn't have role access, redirect to their home dashboard
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    if (role === 'parent') {
      return <Navigate to="/parent/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
