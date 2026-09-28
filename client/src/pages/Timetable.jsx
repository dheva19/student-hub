import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import api from '../services/api';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const COLOR_PRESETS = [
  '#09090b', // Zinc
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#475569', // Slate
];

export default function Timetable() {
  const [activeTab, setActiveTab] = useState('classes');
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Schedule
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    subjectName: '',
    lecturer: '',
    dayOfWeek: 'Senin',
    startTime: '08:00',
    endTime: '09:40',
    room: '',
    color: '#09090b',
    credits: 3,
  });

  // Modal State for Event
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'academic',
    location: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, eventRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/schedules/events/all'),
      ]);
      if (schedRes.data.success) setSchedules(schedRes.data.schedules);
      if (eventRes.data.success) setEvents(eventRes.data.events);
    } catch (err) {
      console.error('Error fetching schedules/events:', err);
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = (item = null) => {
    if (item) {
      setEditingSchedule(item);
      setScheduleForm({
        subjectName: item.subjectName,
        lecturer: item.lecturer || '',
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room || '',
        color: item.color || '#09090b',
        credits: item.credits || 3,
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({
        subjectName: '',
        lecturer: '',
        dayOfWeek: 'Senin',
        startTime: '08:00',
        endTime: '09:40',
        room: '',
        color: '#09090b',
        credits: 3,
      });
    }
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        const res = await api.put(`/schedules/${editingSchedule._id}`, scheduleForm);
        if (res.data.success) {
          setSchedules(schedules.map((s) => (s._id === editingSchedule._id ? res.data.schedule : s)));
        }
      } else {
        const res = await api.post('/schedules', scheduleForm);
        if (res.data.success) {
          setSchedules([...schedules, res.data.schedule]);
        }
      }
      setScheduleModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan jadwal');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Hapus jadwal ini?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
    } catch (err) {
      alert('Gagal menghapus jadwal');
    }
  };

  const openEventModal = (item = null) => {
    if (item) {
      setEditingEvent(item);
      setEventForm({
        title: item.title,
        description: item.description || '',
        date: item.date,
        time: item.time || '',
        type: item.type || 'academic',
        location: item.location || '',
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '13:00',
        type: 'academic',
        location: '',
      });
    }
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const res = await api.put(`/schedules/events/${editingEvent._id}`, eventForm);
        if (res.data.success) {
          setEvents(events.map((ev) => (ev._id === editingEvent._id ? res.data.event : ev)));
        }
      } else {
        const res = await api.post('/schedules/events', eventForm);
        if (res.data.success) {
          setEvents([...events, res.data.event]);
        }
      }
      setEventModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan acara');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Hapus acara ini?')) return;
    try {
      await api.delete(`/schedules/events/${id}`);
      setEvents(events.filter((ev) => ev._id !== id));
    } catch (err) {
      alert('Gagal menghapus acara');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
          <div className="space-y-2">
            <div className="h-6 w-36 bg-zinc-200 rounded-md"></div>
            <div className="h-3.5 w-64 bg-zinc-100 rounded-md"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-32 bg-zinc-200 rounded-lg"></div>
            <div className="h-8 w-28 bg-zinc-200 rounded-lg"></div>
          </div>
        </div>

        {/* Timetable Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 space-y-3 p-3.5 min-h-[220px]">
              <div className="h-4 w-20 bg-zinc-200 rounded"></div>
              {[1, 2].map((j) => (
                <div key={j} className="p-3 rounded-lg border border-zinc-100 bg-zinc-50 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-zinc-200 rounded"></div>
                    <div className="h-4 w-16 bg-zinc-200 rounded"></div>
                  </div>
                  <div className="h-3 w-40 bg-zinc-100 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Jadwal & Acara</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Pengelolaan jadwal kuliah mingguan dan agenda kegiatan</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-zinc-100 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'classes' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'events' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Kalender Acara
            </button>
          </div>

          {activeTab === 'classes' ? (
            <button
              onClick={() => openScheduleModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Matkul
            </button>
          ) : (
            <button
              onClick={() => openEventModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Acara
            </button>
          )}
        </div>
      </div>

      {/* View 1: Timetable Kuliah Mingguan */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map((day) => {
            const daySchedules = schedules
              .filter((s) => s.dayOfWeek === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={day} className="bg-white rounded-xl border border-zinc-200 flex flex-col">
                <div className="px-3.5 py-2.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-xl">
                  <h3 className="font-semibold text-zinc-800 text-xs">{day}</h3>
                  <span className="text-[11px] text-zinc-400">
                    {daySchedules.length} Kelas
                  </span>
                </div>

                <div className="p-3 flex-1 space-y-2">
                  {daySchedules.length === 0 ? (
                    <div className="h-20 flex items-center justify-center text-xs text-zinc-400">
                      Tidak ada kelas
                    </div>
                  ) : (
                    daySchedules.map((item) => (
                      <div
                        key={item._id}
                        className="p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors relative group"
                        style={{ borderLeftWidth: '3px', borderLeftColor: item.color || '#09090b' }}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-zinc-900 text-xs">{item.subjectName}</h4>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={() => openScheduleModal(item)}
                              className="p-1 text-zinc-400 hover:text-zinc-700 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(item._id)}
                              className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1.5 space-y-0.5 text-[11px] text-zinc-500">
                          <div className="flex items-center gap-1 font-medium text-zinc-700">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {item.startTime} - {item.endTime} ({item.credits} SKS)
                          </div>
                          {item.room && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              {item.room}
                            </div>
                          )}
                          {item.lecturer && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-zinc-400" />
                              {item.lecturer}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Kalender Acara */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-zinc-500" />
            Agenda Kampus
          </h3>

          {events.length === 0 ? (
            <div className="py-10 text-center text-zinc-400">
              <p className="text-xs font-medium text-zinc-600">Belum ada acara yang dicatat</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Catat agenda ujian atau kegiatan organisasi di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="p-3.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {ev.type}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={() => openEventModal(ev)}
                          className="p-1 text-zinc-400 hover:text-zinc-700"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev._id)}
                          className="p-1 text-zinc-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-semibold text-zinc-900 text-xs mt-2">{ev.title}</h4>
                    {ev.description && (
                      <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{ev.description}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-zinc-400" />
                      {ev.date} {ev.time && `• ${ev.time} WIB`}
                    </div>
                    {ev.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {ev.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Jadwal Kuliah */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm">
                {editingSchedule ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
              </h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-600 mb-1">Nama Mata Kuliah *</label>
                <input
                  type="text"
                  required
                  placeholder="Algoritma & Pemrograman"
                  value={scheduleForm.subjectName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subjectName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Hari</label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">SKS</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={scheduleForm.credits}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, credits: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Mulai</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Selesai</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Dosen</label>
                  <input
                    type="text"
                    placeholder="Nama dosen"
                    value={scheduleForm.lecturer}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, lecturer: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Ruangan</label>
                  <input
                    type="text"
                    placeholder="Lab 2 / Zoom"
                    value={scheduleForm.room}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Warna Garis</label>
                <div className="flex items-center gap-1.5">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setScheduleForm({ ...scheduleForm, color: c })}
                      className="w-5 h-5 rounded-full border"
                      style={{
                        backgroundColor: c,
                        borderColor: scheduleForm.color === c ? '#09090b' : 'transparent',
                        transform: scheduleForm.color === c ? 'scale(1.15)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Acara */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm">
                {editingEvent ? 'Edit Acara' : 'Tambah Acara'}
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-600 mb-1">Judul Acara *</label>
                <input
                  type="text"
                  required
                  placeholder="UTS / Webinar / Rapat"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Kategori</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                >
                  <option value="academic">Akademik (UTS/UAS)</option>
                  <option value="organization">Organisasi</option>
                  <option value="webinar">Webinar</option>
                  <option value="personal">Pribadi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Waktu</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Lokasi / Tautan</label>
                <input
                  type="text"
                  placeholder="Gedung / Zoom"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Catatan</label>
                <textarea
                  rows="2"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
