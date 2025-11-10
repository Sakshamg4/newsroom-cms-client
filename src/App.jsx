import React, { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext/AuthContext';
import Login from './pages/Login';
import ReaderList from './pages/ReaderList';
import WriterDashboard from './pages/WriterDashboard';
import EditorDashboard from './pages/EditorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const { auth, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    toast.success('Logged out');
  }

  const linkClass =
    'block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition';
  const activeClass = 'bg-blue-50 text-blue-600';

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: brand */}
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold text-gray-800">News Room</div>
              <nav className="hidden md:flex items-center space-x-2">
                <NavLink to="/reader" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                  Reader
                </NavLink>
                {(auth?.user?.role === 'Writer' || auth?.user?.role === 'Admin' || auth?.user?.role === 'Editor') && (
                  <NavLink to="/writer" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                    Writer
                  </NavLink>
                )}
                {(auth?.user?.role === 'Editor' || auth?.user?.role === 'Admin') && (
                  <NavLink to="/editor" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                    Editor
                  </NavLink>
                )}
                {auth?.user?.role === 'Admin' && (
                  <NavLink to="/admin" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                    Admin
                  </NavLink>
                )}
              </nav>
            </div>

            {/* Right: user / actions */}
            <div className="flex items-center">
              {auth?.user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-sm text-gray-700">
                    {auth.user.name} <span className="text-xs text-gray-500">({auth.user.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink to="/login" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                  Login
                </NavLink>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(s => !s)}
                className="ml-3 inline-flex items-center justify-center p-2 rounded-md md:hidden hover:bg-gray-100"
                aria-label="Main menu"
              >
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/reader" onClick={() => setMobileOpen(false)} className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                Reader
              </NavLink>

              {(auth?.user?.role === 'Writer' || auth?.user?.role === 'Admin' || auth?.user?.role === 'Editor') && (
                <NavLink to="/writer" onClick={() => setMobileOpen(false)} className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                  Writer
                </NavLink>
              )}

              {(auth?.user?.role === 'Editor' || auth?.user?.role === 'Admin') && (
                <NavLink to="/editor" onClick={() => setMobileOpen(false)} className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                  Editor
                </NavLink>
              )}

              {auth?.user?.role === 'Admin' && (
                <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={({ isActive }) => `${linkClass} ${isActive ? activeClass : 'text-gray-600'}`}>
                  Admin
                </NavLink>
              )}

              <div className="border-t pt-2">
                {auth?.user ? (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {auth.user.name} <div className="text-xs text-gray-500">{auth.user.role}</div>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <NavLink to="/login" onClick={() => setMobileOpen(false)} className={`${linkClass} text-gray-600`}>
                    Login
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/reader" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reader" element={<ReaderList />} />

          <Route
            path="/writer"
            element={
              <ProtectedRoute allowed={['Writer', 'Admin', 'Editor']}>
                <WriterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor"
            element={
              <ProtectedRoute allowed={['Editor', 'Admin']}>
                <EditorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowed={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div className="text-center py-20 text-gray-500">Not Found</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
