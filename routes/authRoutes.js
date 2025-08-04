// routes/authRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

const router = express.Router();

// rate limiter per login / register
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minuti
  max: 5, // max 5 richieste per IP
  message: { message: 'Troppi tentativi, riprova dopo qualche minuto' }
});

router.use(cookieParser());

// middleware di protezione
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalido o scaduto' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// Routes
router.post('/register', limiter, authController.register);
router.post('/login', limiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);                //definisce all'utente chi è dopo il login

// esempio: route protetta per terapeuta
// router.get('/therapist-only', requireAuth, requireRole('therapist'), (req, res) => {
//   res.json({ secret: 'solo terapeuti' });
// });

module.exports = router;



