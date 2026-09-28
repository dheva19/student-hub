const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Judul materi wajib diisi'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    links: [
      {
        title: { type: String, default: 'Link Referensi' },
        url: { type: String, required: true },
      },
    ],
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

module.exports = mongoose.models.Material || mongoose.model('Material', materialSchema);
