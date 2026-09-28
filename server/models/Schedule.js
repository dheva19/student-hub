const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Nama mata kuliah wajib diisi'],
      trim: true,
    },
    lecturer: {
      type: String,
      trim: true,
      default: '',
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    },
    startTime: {
      type: String,
      required: [true, 'Jam mulai wajib diisi (HH:mm)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'Jam selesai wajib diisi (HH:mm)'],
      trim: true,
    },
    room: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      default: '#4f46e5', // default indigo
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
