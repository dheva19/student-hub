require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Inisialisasi Express
const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Diizinkan untuk fleksibilitas Vercel preview & production
  credentials: true,
}));
app.use(express.json());

// Sambungkan Database Mongoose untuk setiap request jika belum terhubung (Serverless lifecycle)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection middleware failed:', err.message);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Student Life Hub API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/finances', require('./routes/financeRoutes'));

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
