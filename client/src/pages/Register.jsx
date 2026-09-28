import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GraduationCap, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    major: '',
    semester: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran via Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-xl font-bold text-zinc-900 tracking-tight">
          Buat Akun Mahasiswa
        </h2>
        <p className="text-center text-xs text-zinc-500 mt-0.5">
          Kelola jadwal, tugas, dan keuangan dalam satu platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 border border-zinc-200 rounded-xl sm:px-8">
          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Anda"
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@kampus.ac.id"
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Kampus
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="Nama Universitas"
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Jurusan
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="Program Studi"
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
              >
                {[...Array(14)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semester {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading && (
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar Akun'}</span>
            </button>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-white text-zinc-400">atau</span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Daftar Google gagal dibuka.')}
                shape="rectangular"
                width="100%"
                text="signup_with"
              />
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-zinc-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-medium text-zinc-900 hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
