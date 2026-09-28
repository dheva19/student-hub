const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_student_life_2026';
  return jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
};

// Register dengan Email & Password
exports.register = async (req, res) => {
  try {
    const { name, email, password, university, major, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan login.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      university: university || '',
      major: major || '',
      semester: Number(semester) || 1,
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        university: newUser.university,
        major: newUser.major,
        semester: newUser.semester,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Login dengan Email & Password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Akun ini terdaftar via Google. Silakan login dengan Google.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        major: user.major,
        semester: user.semester,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Google OAuth Login / Register
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google Credential token wajib disertakan.' });
    }

    let payload;
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        // Fallback decoder if client ID is not configured yet in local test
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        payload = JSON.parse(jsonPayload);
      }
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Verifikasi Google Token gagal: ' + err.message });
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { googleId }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture || '',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login Google berhasil!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        major: user.major,
        semester: user.semester,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil Profil User saat ini
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profil User
exports.updateProfile = async (req, res) => {
  try {
    const { name, university, major, semester, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    if (name) user.name = name;
    if (university !== undefined) user.university = university;
    if (major !== undefined) user.major = major;
    if (semester !== undefined) user.semester = Number(semester);
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        major: user.major,
        semester: user.semester,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
