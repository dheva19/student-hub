const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Judul tugas wajib diisi'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    subjectName: {
      type: String,
      default: 'Umum',
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Tenggat waktu wajib ditentukan'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed'],
      default: 'todo',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
