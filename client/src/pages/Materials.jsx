import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Folder,
} from 'lucide-react';
import api from '../services/api';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    subjectName: '',
    title: '',
    notes: '',
    links: [{ title: 'Google Drive / Slide', url: '' }],
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/materials');
      if (res.data.success) {
        setMaterials(res.data.materials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['all', ...new Set(materials.map((m) => m.subjectName).filter(Boolean))];

  const openModal = (mat = null) => {
    if (mat) {
      setEditingMaterial(mat);
      setFormData({
        subjectName: mat.subjectName,
        title: mat.title,
        notes: mat.notes || '',
        links: mat.links && mat.links.length > 0 ? mat.links : [{ title: 'Tautan Materi', url: '' }],
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        subjectName: '',
        title: '',
        notes: '',
        links: [{ title: 'Google Drive / Referensi', url: '' }],
      });
    }
    setModalOpen(true);
  };

  const handleLinkChange = (index, field, value) => {
    const updated = [...formData.links];
    updated[index][field] = value;
    setFormData({ ...formData, links: updated });
  };

  const addLinkRow = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { title: 'Tautan Tambahan', url: '' }],
    });
  };

  const removeLinkRow = (index) => {
    const updated = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const cleanedLinks = formData.links.filter((l) => l.url.trim() !== '');

    try {
      if (editingMaterial) {
        const res = await api.put(`/materials/${editingMaterial._id}`, {
          ...formData,
          links: cleanedLinks,
        });
        if (res.data.success) {
          setMaterials(materials.map((m) => (m._id === editingMaterial._id ? res.data.material : m)));
        }
      } else {
        const res = await api.post('/materials', {
          ...formData,
          links: cleanedLinks,
        });
        if (res.data.success) {
          setMaterials([res.data.material, ...materials]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan materi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus materi ini?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
    } catch (err) {
      alert('Gagal menghapus materi');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || m.subjectName === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Materi & Catatan Kuliah</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Dokumentasi resume perkuliahan dan tautan materi dosen</p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Simpan Catatan Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-0.5">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {sub === 'all' ? 'Semua Matkul' : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Material Cards */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
          <p className="text-xs font-medium text-zinc-600">Belum ada catatan materi</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Catat ringkasan materi atau simpan link Google Drive slide dosen di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat._id}
              className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <Folder className="w-3 h-3 text-zinc-400" />
                    {mat.subjectName}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => openModal(mat)}
                      className="p-1 text-zinc-400 hover:text-zinc-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(mat._id)}
                      className="p-1 text-zinc-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 mt-2.5">{mat.title}</h3>

                {mat.notes && (
                  <p className="text-xs text-zinc-600 mt-2 whitespace-pre-line bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 max-h-32 overflow-y-auto leading-relaxed">
                    {mat.notes}
                  </p>
                )}
              </div>

              {/* Links and Attachments */}
              {mat.links && mat.links.length > 0 && (
                <div className="mt-3.5 pt-2.5 border-t border-zinc-100 space-y-1">
                  <p className="text-[10px] uppercase font-semibold text-zinc-400">
                    Tautan:
                  </p>
                  <div className="space-y-1">
                    {mat.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-1.5 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 transition-colors"
                      >
                        <span className="truncate pr-2 font-medium">{link.title || link.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Materi */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm">
                {editingMaterial ? 'Edit Materi' : 'Simpan Materi Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-600 mb-1">Mata Kuliah *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Basis Data"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Judul Materi / Bab *</label>
                <input
                  type="text"
                  required
                  placeholder="Normalisasi 1NF s/d 3NF"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Catatan / Rangkuman</label>
                <textarea
                  rows="3"
                  placeholder="Poin penting perkuliahan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-zinc-600">Tautan File / Google Drive</label>
                  <button
                    type="button"
                    onClick={addLinkRow}
                    className="text-xs text-zinc-600 hover:text-zinc-900 font-medium"
                  >
                    + Link
                  </button>
                </div>

                <div className="space-y-1.5">
                  {formData.links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Nama tautan"
                        value={link.title}
                        onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                        className="w-1/3 px-2 py-1 bg-white border border-zinc-200 rounded-md text-xs"
                      />
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={link.url}
                        onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-zinc-200 rounded-md text-xs"
                      />
                      {formData.links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLinkRow(idx)}
                          className="p-1 text-zinc-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
