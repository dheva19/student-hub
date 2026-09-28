import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({ total: 0, todo: 0, inProgress: 0, urgent: 0 });
  const [financeSummary, setFinanceSummary] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });

  const todayName = INDONESIAN_DAYS[new Date().getDay()];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [schedRes, taskRes, statRes, finRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/tasks?sort=deadline'),
        api.get('/tasks/stats'),
        api.get('/finances/summary'),
      ]);

      if (schedRes.data.success) setSchedules(schedRes.data.schedules);
      if (taskRes.data.success) setTasks(taskRes.data.tasks);
      if (statRes.data.success) setTaskStats(statRes.data.stats);
      if (finRes.data.success) setFinanceSummary(finRes.data.summary);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const todaySchedules = schedules.filter((s) => s.dayOfWeek === todayName);
  const totalCredits = schedules.reduce((sum, s) => sum + (s.credits || 0), 0);
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 4);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const getDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Terlewat', color: 'bg-rose-50 text-rose-700 border border-rose-200' };
    if (days === 0) return { label: 'Hari ini', color: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold' };
    if (days === 1) return { label: 'Besok', color: 'bg-amber-50 text-amber-700 border border-amber-200' };
    return { label: `${days} hari lagi`, color: 'bg-zinc-100 text-zinc-700 border border-zinc-200' };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Selamat datang, <span className="font-semibold text-zinc-700">{user?.name || 'Mahasiswa'}</span> • Hari {todayName}
            {user?.university ? ` • ${user.university}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/timetable"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Jadwal Kuliah
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tugas Baru
          </Link>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Kuliah Hari Ini</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{todaySchedules.length} Kelas</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{totalCredits} Total SKS</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Tugas Urgent (≤3 Hari)</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{taskStats.urgent || 0} Tugas</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{taskStats.todo + taskStats.inProgress} pending</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Sisa Saldo</p>
            <p className="text-xl font-bold text-zinc-900 mt-1 truncate max-w-[130px]">
              {formatRupiah(financeSummary.balance)}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Bulan ini</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Pengeluaran</p>
            <p className="text-xl font-bold text-zinc-900 mt-1 truncate max-w-[130px]">
              {formatRupiah(financeSummary.totalExpense)}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">+{formatRupiah(financeSummary.totalIncome)} pemasukan</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Jadwal Kuliah Hari Ini */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Jadwal Kuliah Hari Ini ({todayName})</h2>
            <Link
              to="/timetable"
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 font-medium"
            >
              Semua Jadwal <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-2.5">
            {todaySchedules.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                <p className="text-xs font-medium text-zinc-600">Tidak ada jadwal kuliah hari ini</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Waktunya istirahat atau mencicil tugas.</p>
              </div>
            ) : (
              todaySchedules.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex items-start justify-between"
                >
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900">{item.subjectName}</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {item.lecturer ? `Dosen: ${item.lecturer}` : 'Dosen: -'} • Ruang: {item.room || 'TBA'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700">
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="block text-[11px] text-zinc-400 mt-1">{item.credits} SKS</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tugas Mendesak */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Tenggat Tugas Terdekat</h2>
            <Link
              to="/tasks"
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-0.5 font-medium"
            >
              Buka Tugas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-2.5">
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                <p className="text-xs font-medium text-zinc-600">Semua tugas beres</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Tidak ada tugas dengan tenggat terdekat.</p>
              </div>
            ) : (
              pendingTasks.map((task) => {
                const daysInfo = getDaysLeft(task.deadline);
                return (
                  <div
                    key={task._id}
                    className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-zinc-600 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
                          {task.subjectName}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${daysInfo.color}`}>
                          {daysInfo.label}
                        </span>
                      </div>
                      <h3 className="text-xs font-medium text-zinc-800 mt-1 truncate">{task.title}</h3>
                    </div>
                    <Link
                      to="/tasks"
                      className="px-2 py-1 text-xs text-zinc-700 bg-white border border-zinc-200 rounded hover:bg-zinc-50 flex-shrink-0"
                    >
                      Buka
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
