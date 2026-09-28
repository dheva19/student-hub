const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        // Pemasukan
        'allowance', // Kiriman Ortu
        'scholarship', // Beasiswa
        'salary', // Gaji / Freelance
        'other_income',
        // Pengeluaran
        'food', // Makanan & Minuman
        'housing', // Kos / Kontrakan & Listrik
        'transport', // Transportasi / Bensin
        'academics', // Buku, Print, Fotokopi, UKT
        'entertainment', // Nongkrong & Hiburan
        'health', // Obat & Medis
        'shopping', // Belanja Kebutuhan
        'other_expense',
      ],
    },
    amount: {
      type: Number,
      required: [true, 'Nominal transaksi wajib diisi'],
      min: [1, 'Nominal harus lebih dari 0'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
