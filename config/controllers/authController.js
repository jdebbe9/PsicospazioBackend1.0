// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.error("FATAL: manca ACCESS_TOKEN_SECRET o REFRESH_TOKEN_SECRET");
  process.exit(1);
}

// Generazione token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString() },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const sendRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // in dev può essere false
    sameSite: 'lax',
    path: '/auth', // disponibile su /auth/refresh e /auth/logout
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
  });
};

exports.register = async (req, res) => {
  const { email, password, role, consent } = req.body;

  if (!email || !password || consent !== true) {
    return res.status(400).json({ message: 'Email, password e consenso sono obbligatori' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Email non valida' });
  if (password.length < 8) return res.status(400).json({ message: 'Password troppo corta (min 8)' });

  const allowedRoles = ['patient', 'therapist'];
  const finalRole = allowedRoles.includes(role) ? role : 'patient';

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email già registrata' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      passwordHash,
      role: finalRole,
      consentGivenAt: new Date(),
      questionnaireDone: false,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.setRefreshToken(refreshToken); // salva hash
    await user.save();

    sendRefreshToken(res, refreshToken);
    return res.status(201).json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role, questionnaireDone: user.questionnaireDone }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: 'Errore interno' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email e password richieste' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenziali non valide' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Credenziali non valide' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.setRefreshToken(refreshToken); // rotazione
    await user.save();

    sendRefreshToken(res, refreshToken);
    return res.status(200).json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role, questionnaireDone: user.questionnaireDone }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: 'Errore interno' });
  }
};

exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Nessun refresh token' });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: 'Utente non trovato' });

    const valid = await user.isRefreshTokenValid(token);
    if (!valid) return res.status(401).json({ message: 'Refresh token non valido' });

    // genera nuovi token (rotazione)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await user.setRefreshToken(newRefreshToken);
    await user.save();

    sendRefreshToken(res, newRefreshToken);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(401).json({ message: 'Refresh token non valido o scaduto' });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, REFRESH_SECRET);
      const user = await User.findById(payload.userId);
      if (user) {
        user.currentRefreshToken = null;
        await user.save();
      }
    } catch {}
  }
  res.clearCookie('refreshToken', { path: '/auth' });
  return res.json({ message: 'Logout effettuato' });
};

// GET /auth/me
exports.me = async (req, res) => {
  // assume che req.user sia stato popolato dal middleware requireAuth
  if (!req.user) return res.status(401).json({ message: 'Non autenticato' });
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -currentRefreshToken');
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });
    return res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ message: 'Errore interno' });
  }
};


