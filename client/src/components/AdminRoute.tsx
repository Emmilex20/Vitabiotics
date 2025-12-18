// /client/src/components/AdminRoute.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from 'lucide-react';

const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  // While auth is initializing, show a loader to avoid premature redirects
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-vita-primary animate-spin mr-3" />
        <span className="text-xl text-gray-600 font-medium">Loading authentication...</span>
      </div>
    );
  }

  // Check if user exists and their role is 'admin'
  if (user && user.role === 'admin') {
    // Render the child routes/components if authenticated as admin
    return <Outlet />;
  }

  // Redirect non-admin or unauthenticated users to the login page
  return <Navigate to="/login" replace />;
};

export default AdminRoute;