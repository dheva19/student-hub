import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
  Columns,
  List,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const COLUMNS = [
  { id: 'todo', title: 'Belum Mulai' },
  { id: 'in_progress', title: 'Sedang Dikerjakan' },
  { id: 'completed', title: 'Selesai' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    subjectName: '',
    deadline: '',
    priority: 'medium',
    status: 'todo',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks?sort=deadline');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      const deadlineDate = task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '';
      setTaskForm({
        title: task.title,
        description: task.description || '',
        subjectName: task.subjectName || '',
        deadline: deadlineDate,
        priority: task.priority || 'medium',
        status: task.status || 'todo',
      });
    } else {
      setEditingTask(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 0, 0);
      setTaskForm({
        title: '',
        description: '',
        subjectName: '',
        deadline: tomorrow.toISOString().slice(0, 16),
        priority: 'medium',
        status: 'todo',
      });
    }
    setModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, taskForm);
        if (res.data.success) {
          setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data.task : t)));
        }
      } else {
        const res = await api.post('/tasks', taskForm);
        if (res.data.success) {
          setTasks([...tasks, res.data.task]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan tugas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setTasks(tasks.map((t) => (t._id === taskId ? res.data.task : t)));

        if (newStatus === 'completed') {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 },
          });
        }
      }
    } catch (err) {
      alert('Gagal mengubah status tugas');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Hapus tugas ini?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      alert('Gagal menghapus tugas');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">Tinggi</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Sedang</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">Rendah</span>;
      default:
        return null;
    }
  };

  const getDeadlineBadge = (deadline) => {
    const now = new Date();
    const d = new Date(deadline);
    const diffHours = (d - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return (
        <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Terlambat
        </span>
      );
    }
    if (diffHours <= 24) {
      return (
        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" /> Hari ini
        </span>
      );
    }
    const days = Math.ceil(diffHours / 24);
    return (
      <span className="text-[10px] text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded flex items-center gap-1">
        <Clock className="w-3 h-3" /> {days} hari lagi
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Tugas Kuliah</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Tracking deadline dan prioritas tugas akademik</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-zinc-100 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Tugas
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700"
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">Prioritas Tinggi</option>
            <option value="medium">Prioritas Sedang</option>
            <option value="low">Prioritas Rendah</option>
          </select>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div key={col.id} className="bg-zinc-100/60 rounded-xl p-3 border border-zinc-200/80 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-200">
                  <h3 className="font-semibold text-zinc-800 text-xs">{col.title}</h3>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-white text-zinc-600 border border-zinc-200">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-xs text-zinc-400">
                      Kosong
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-white p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors relative group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                              {task.subjectName}
                            </span>
                            <div className="flex items-center gap-1">
                              {getPriorityBadge(task.priority)}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                <button
                                  onClick={() => openModal(task)}
                                  className="p-1 text-zinc-400 hover:text-zinc-700"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="p-1 text-zinc-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <h4 className="font-medium text-zinc-900 text-xs mt-1.5">{task.title}</h4>
                          {task.description && (
                            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between">
                          {getDeadlineBadge(task.deadline)}

                          <div className="flex items-center gap-0.5">
                            {task.status === 'in_progress' && (
                              <button
                                onClick={() => handleStatusChange(task._id, 'todo')}
                                title="Kembalikan"
                                className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {task.status === 'todo' && (
                              <button
                                onClick={() => handleStatusChange(task._id, 'in_progress')}
                                title="Kerjakan"
                                className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(task._id, 'completed')}
                                title="Tandai Selesai"
                                className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">Tidak ada tugas ditemukan.</div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="p-3 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        task._id,
                        task.status === 'completed' ? 'todo' : 'completed'
                      )
                    }
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      task.status === 'completed'
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'border-zinc-300 text-transparent hover:border-zinc-500'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {task.subjectName}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <h4
                      className={`text-xs font-medium mt-0.5 truncate ${
                        task.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getDeadlineBadge(task.deadline)}
                  <button
                    onClick={() => openModal(task)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Tugas */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm">
                {editingTask ? 'Edit Tugas' : 'Tambah Tugas'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-600 mb-1">Judul Tugas *</label>
                <input
                  type="text"
                  required
                  placeholder="Laporan Bab 1 / Tugas Coding"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Mata Kuliah</label>
                <input
                  type="text"
                  placeholder="Misal: Pemrograman Web"
                  value={taskForm.subjectName}
                  onChange={(e) => setTaskForm({ ...taskForm, subjectName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Tenggat Waktu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Prioritas</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                >
                  <option value="todo">Belum Mulai</option>
                  <option value="in_progress">Sedang Dikerjakan</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Catatan Tambahan</label>
                <textarea
                  rows="2"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-md disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{submitting ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
