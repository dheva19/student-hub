const Material = require('../models/Material');

// Ambil semua materi atau filter berdasarkan subjectName
exports.getMaterials = async (req, res) => {
  try {
    const { subjectName, search } = req.query;
    const query = { userId: req.user.id };

    if (subjectName) query.subjectName = subjectName;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await Material.find(query).sort({ updatedAt: -1 });
    return res.json({ success: true, materials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Buat materi baru
exports.createMaterial = async (req, res) => {
  try {
    const { subjectName, title, notes, links, tags } = req.body;

    if (!subjectName || !title) {
      return res.status(400).json({
        success: false,
        message: 'Mata kuliah dan judul materi wajib diisi.',
      });
    }

    const material = await Material.create({
      userId: req.user.id,
      subjectName,
      title,
      notes: notes || '',
      links: Array.isArray(links) ? links : [],
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({ success: true, material, message: 'Materi berhasil disimpan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update materi
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });
    }

    return res.json({ success: true, material, message: 'Materi berhasil diperbarui.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus materi
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!material) {
      return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'Materi berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
