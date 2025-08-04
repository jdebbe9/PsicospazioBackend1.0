const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_SECRET) {
  console.error("FATAL: manca ACCESS_TOKEN_SECRET");
  process.exit(1);
}

// Verifica token e decodifica payload
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token mancante' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = {
      id: payload.userId,
      role: payload.role
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token non valido o scaduto' });
  }
};

// Controlla se l'utente ha il ruolo richiesto (es. 'therapist' o 'patient')
const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Non autenticato' });
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Accesso negato: ruolo non autorizzato' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole
};
