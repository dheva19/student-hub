require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../server/config/db');

// Inisialisasi Express
const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint (Bisa diakses tanpa koneksi database)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Student Life Hub API is running',
    timestamp: new Date().toISOString(),
  });
});

// Sambungkan Database Mongoose untuk setiap request API
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return res.status(500).json({
      success: false,
      message: `Koneksi Database Gagal: ${err.message}. Pastikan MONGODB_URI sudah disetel di Vercel Environment Variables.`,
    });
  }
});

// Mount Routes (Mengarah ke folder ../server/routes)
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/schedules', require('../server/routes/scheduleRoutes'));
app.use('/api/tasks', require('../server/routes/taskRoutes'));
app.use('/api/materials', require('../server/routes/materialRoutes'));
app.use('/api/finances', require('../server/routes/financeRoutes'));

// 404 Handler untuk API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint API tidak ditemukan.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server internal.',
  });
});

// Start server hanya saat dijalankan lokal (Bukan di Vercel Serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

// Export untuk Vercel Serverless Function
module.exports = app;
