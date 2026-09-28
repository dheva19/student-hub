const Schedule = require('../models/Schedule');
const Event = require('../models/Event');

// --- Timetable Kuliah ---

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id }).sort({ startTime: 1 });
    return res.json({ success: true, schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { subjectName, lecturer, dayOfWeek, startTime, endTime, room, color, credits } = req.body;

    if (!subjectName || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Mata kuliah, hari, jam mulai, dan jam selesai wajib diisi.',
      });
    }

    const schedule = await Schedule.create({
      userId: req.user.id,
      subjectName,
      lecturer,
      dayOfWeek,
      startTime,
      endTime,
      room,
      color: color || '#4f46e5',
      credits: Number(credits) || 3,
    });

    return res.status(201).json({ success: true, schedule, message: 'Jadwal kuliah berhasil ditambahkan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }

    return res.json({ success: true, schedule, message: 'Jadwal berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Jadwal berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- Kalender Acara / Agenda ---

exports.getEvents = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM optional filter
    const query = { userId: req.user.id };

    if (month) {
      query.date = { $regex: `^${month}` };
    }

    const events = await Event.find(query).sort({ date: 1, time: 1 });
    return res.json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, type, location, color } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Judul dan tanggal acara wajib diisi.' });
    }

    const event = await Event.create({
      userId: req.user.id,
      title,
      description,
      date,
      time,
      type: type || 'personal',
      location,
      color: color || '#0ea5e9',
    });

    return res.status(201).json({ success: true, event, message: 'Acara berhasil ditambahkan ke kalender.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Acara tidak ditemukan.' });
    }

    return res.json({ success: true, event, message: 'Acara berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Acara tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Acara berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
