import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  PieChart,
  X,
  CreditCard,
  Utensils,
  Home,
  Bus,
  Book,
  Coffee,
  HeartPulse,
  ShoppingBag,
} from 'lucide-react';
import api from '../services/api';

const CATEGORY_MAP = {
  // Pemasukan
  allowance: { label: 'Uang Saku / Kiriman', type: 'income', icon: Home },
  scholarship: { label: 'Beasiswa', type: 'income', icon: Book },
  salary: { label: 'Gaji / Freelance', type: 'income', icon: CreditCard },
  other_income: { label: 'Pemasukan Lainnya', type: 'income', icon: ArrowUpRight },

  // Pengeluaran
  food: { label: 'Makan & Minum', type: 'expense', icon: Utensils },
  housing: { label: 'Kos & Listrik', type: 'expense', icon: Home },
  transport: { label: 'Transportasi', type: 'expense', icon: Bus },
  academics: { label: 'Kuliah (Print / Buku / UKT)', type: 'expense', icon: Book },
  entertainment: { label: 'Hiburan & Nongkrong', type: 'expense', icon: Coffee },
  health: { label: 'Kesehatan', type: 'expense', icon: HeartPulse },
  shopping: { label: 'Kebutuhan Pribadi', type: 'expense', icon: ShoppingBag },
  other_expense: { label: 'Pengeluaran Lainnya', type: 'expense', icon: ArrowDownRight },
};

export default function Finances() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    breakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [txType, setTxType] = useState('expense');
  const [formData, setFormData] = useState({
    category: 'food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        api.get('/finances'),
        api.get('/finances/summary'),
      ]);
      if (txRes.data.success) setTransactions(txRes.data.transactions);
      if (sumRes.data.success) setSummary(sumRes.data.summary);
    } catch (err) {
      console.error('Error fetching finances:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type = 'expense') => {
    setTxType(type);
    setFormData({
      category: type === 'income' ? 'allowance' : 'food',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setModalOpen(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        type: txType,
        amount: Number(formData.amount),
      };
      const res = await api.post('/finances', payload);
      if (res.data.success) {
        setTransactions([res.data.transaction, ...transactions]);
        const sumRes = await api.get('/finances/summary');
        if (sumRes.data.success) setSummary(sumRes.data.summary);
        setModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan transaksi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    try {
      await api.delete(`/finances/${id}`);
      setTransactions(transactions.filter((t) => t._id !== id));
      const sumRes = await api.get('/finances/summary');
      if (sumRes.data.success) setSummary(sumRes.data.summary);
    } catch (err) {
      alert('Gagal menghapus transaksi');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Keuangan Mahasiswa</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Catatan pemasukan uang saku dan pengeluaran harian</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('income')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" /> Pemasukan
          </button>
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" /> Pengeluaran
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Sisa Saldo</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{formatRupiah(summary.balance)}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{summary.transactionCount || 0} total transaksi</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Pemasukan</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{formatRupiah(summary.totalIncome)}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Uang saku / transfer</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Pengeluaran</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{formatRupiah(summary.totalExpense)}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Kebutuhan mahasiswa</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-900">Riwayat Transaksi</h3>

            <div className="bg-zinc-100 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-white text-zinc-900 font-medium shadow-sm' : 'text-zinc-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'income' ? 'bg-white text-zinc-900 font-medium shadow-sm' : 'text-zinc-600'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === 'expense' ? 'bg-white text-zinc-900 font-medium shadow-sm' : 'text-zinc-600'
                }`}
              >
                Keluar
              </button>
            </div>
          </div>

          <div className="flex-1 divide-y divide-zinc-100 overflow-y-auto max-h-[450px]">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">Belum ada transaksi dicatat.</div>
            ) : (
              filteredTransactions.map((tx) => {
                const catInfo = CATEGORY_MAP[tx.category] || { label: tx.category, icon: CreditCard };
                const Icon = catInfo.icon;
                const isExpense = tx.type === 'expense';

                return (
                  <div key={tx._id} className="py-2.5 flex items-center justify-between px-1 hover:bg-zinc-50 rounded transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-zinc-900">{catInfo.label}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                          <span>{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                          {tx.note && <span>• {tx.note}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-semibold ${
                          isExpense ? 'text-zinc-900' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatRupiah(tx.amount)}
                      </span>
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="text-zinc-300 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Category Breakdown */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-1 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-zinc-500" />
              Alokasi Pengeluaran
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Breakdown pengeluaran berdasarkan kategori</p>

            {summary.breakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                Belum ada data pengeluaran.
              </div>
            ) : (
              <div className="space-y-3">
                {summary.breakdown.map((item) => {
                  const cat = CATEGORY_MAP[item.category] || { label: item.category };
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600 font-medium">{cat.label}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-zinc-800">{formatRupiah(item.amount)}</span>
                          <span className="text-[11px] text-zinc-400">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full bg-zinc-800 rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Transaksi */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm">
                {txType === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-600 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                >
                  {Object.entries(CATEGORY_MAP)
                    .filter(([_, val]) => val.type === txType)
                    .map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="25000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Nasi padang / Fotokopi modul"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                />
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
