import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowed = [] }) {
  const { auth } = useContext(AuthContext);
  if (!auth?.user) return <Navigate to="/login" />;
  if (allowed.length && !allowed.includes(auth.user.role)) return <div className='text-center py-20 text-gray-500'>

    <h2>Unauthorized</h2>
    <p>You are not authorized to access this page.</p>
  </div>;
  return children;
}
