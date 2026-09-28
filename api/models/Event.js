const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Judul acara wajib diisi'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String, // YYYY-MM-DD format for easy calendar filtering
      required: [true, 'Tanggal acara wajib diisi'],
    },
    time: {
      type: String, // HH:mm
      default: '',
    },
    type: {
      type: String,
      enum: ['academic', 'organization', 'webinar', 'personal'],
      default: 'personal',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      default: '#0ea5e9', // default sky blue
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
