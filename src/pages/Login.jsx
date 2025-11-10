import React, { useState, useContext } from 'react';
import API from '../Api/api';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Login successful! Redirecting...');
      setTimeout(() => nav('/'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed. Try again.');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Toaster for showing toast notifications */}
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
