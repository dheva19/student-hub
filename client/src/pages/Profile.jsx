import React, { useState } from 'react';
import { User, School, BookOpen, GraduationCap, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    university: user?.university || '',
    major: user?.major || '',
    semester: user?.semester || 1,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccessMsg('Profil berhasil diperbarui!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-xl font-bold text-zinc-900">Profil Mahasiswa</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Pengaturan identitas akademik dan akun</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left: Simple Student Identity Badge */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col justify-between h-48">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-zinc-700" />
                <span className="text-xs font-semibold text-zinc-800 tracking-tight">
                  Identitas Mahasiswa
                </span>
              </div>
              <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">
                Aktif
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-zinc-900 truncate">{formData.name || 'Nama Mahasiswa'}</h3>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{formData.university || 'Perguruan Tinggi'}</p>
              <p className="text-xs text-zinc-400 truncate">{formData.major || 'Program Studi'}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
              <span>Semester {formData.semester}</span>
              <span className="text-[11px] text-zinc-400 font-mono">STUDENT-HUB</span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 p-5">
          {successMsg && (
            <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs text-zinc-600 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-600 mb-1">Email</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-600 mb-1">Universitas / Kampus</label>
              <input
                type="text"
                placeholder="Universitas Negeri Surabaya"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-600 mb-1">Jurusan / Program Studi</label>
              <input
                type="text"
                placeholder="Sistem Informasi / Teknik Informatika"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-600 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
              >
                {[...Array(14)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Semester {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
