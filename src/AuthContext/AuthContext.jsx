import React, { createContext, useState, useEffect } from 'react';
import { setAuthHeader } from '../Api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token) setAuthHeader(token);
    return { token, user: user ? JSON.parse(user) : null };
  });



  useEffect(() => {
    if (auth?.token) setAuthHeader(auth.token);
  }, [auth]);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthHeader(token);
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthHeader(null);
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
