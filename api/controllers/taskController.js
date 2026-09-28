const Task = require('../models/Task');

// Ambil semua tugas dengan filter opsional
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, subjectName, sort } = req.query;
    const query = { userId: req.user.id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (subjectName) query.subjectName = subjectName;

    let sortOption = { deadline: 1 }; // default: deadline terdekat dahulu
    if (sort === 'createdAt') sortOption = { createdAt: -1 };

    const tasks = await Task.find(query).sort(sortOption);
    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Buat tugas baru
exports.createTask = async (req, res) => {
  try {
    const { title, description, subjectName, deadline, priority, status, tags } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ success: false, message: 'Judul tugas dan tenggat waktu wajib diisi.' });
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      description: description || '',
      subjectName: subjectName || 'Umum',
      deadline,
      priority: priority || 'medium',
      status: status || 'todo',
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({ success: true, task, message: 'Tugas berhasil ditambahkan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update tugas
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan.' });
    }

    return res.json({ success: true, task, message: 'Tugas berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update status tugas (Drag and drop / tombol cepat)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['todo', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan.' });
    }

    return res.json({ success: true, task, message: `Status tugas diubah menjadi ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus tugas
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Tugas berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Statistik ringkasan tugas
exports.getTaskStats = async (req, res) => {
  try {
    const total = await Task.countDocuments({ userId: req.user.id });
    const todo = await Task.countDocuments({ userId: req.user.id, status: 'todo' });
    const inProgress = await Task.countDocuments({ userId: req.user.id, status: 'in_progress' });
    const completed = await Task.countDocuments({ userId: req.user.id, status: 'completed' });

    // Tugas yang jatuh tempo dalam 3 hari ke depan
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const urgent = await Task.countDocuments({
      userId: req.user.id,
      status: { $ne: 'completed' },
      deadline: { $lte: threeDaysLater },
    });

    return res.json({
      success: true,
      stats: { total, todo, inProgress, completed, urgent },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
