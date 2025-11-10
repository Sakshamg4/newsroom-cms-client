import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowed = [] }) {
  const { auth } = useContext(AuthContext);
  if (!auth?.user) return <Navigate to="/login" />;
  if (allowed.length && !allowed.includes(auth.user.role)) return <div>Unauthorized</div>;
  return children;
}
