const Transaction = require('../models/Transaction');

// Ambil riwayat transaksi
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit } = req.query;
    const query = { userId: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const maxItems = limit ? parseInt(limit, 10) : 50;
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(maxItems);

    return res.json({ success: true, transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Buat transaksi baru (Pemasukan / Pengeluaran)
exports.createTransaction = async (req, res) => {
  try {
    const { type, category, amount, date, note } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Tipe transaksi, kategori, dan nominal wajib diisi.',
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      note: note || '',
    });

    return res.status(201).json({ success: true, transaction, message: 'Transaksi berhasil dicatat.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update transaksi
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }

    return res.json({ success: true, transaction, message: 'Transaksi berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus transaksi
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Transaksi berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Ringkasan Keuangan (Saldo, Total Masuk/Keluar, Breakdown Kategori)
exports.getFinanceSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    // Hitung persentase per kategori pengeluaran
    const breakdown = Object.entries(categoryTotals).map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        breakdown,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
