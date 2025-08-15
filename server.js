require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // <— usa il wrapper che abbiamo creato

// middleware comuni (404/error) presi da authMiddleware
const { notFound, errorHandler } = require('./middleware/authMiddleware');

// ROUTES
const authRoutes          = require('./routes/authRoutes');
const appointmentRoutes   = require('./routes/appointmentRoutes');
const diaryRoutes         = require('./routes/diaryRoutes');
const questionnaireRoutes = require('./routes/questionnaireRoutes');
const therapistRoutes     = require('./routes/therapistRoutes');

const app = express();

// Sicurezza & parsing
app.use(helmet());

// CORS: abilita richieste dalla SPA e invio cookie (refresh)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// In produzione, abilita trust proxy per cookie "secure" dietro proxy (es. Render/Heroku)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

// Mount endpoints
app.use('/api/auth',          authRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/diary',         diaryRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/therapists',    therapistRoutes);

// 404 ed errori centralizzati (sempre in coda)
app.use(notFound);
app.use(errorHandler);

// Avvio
(async () => {
  try {
    await connectDB(); // legge MONGO_URI / MONGODB_URI da .env
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server avviato su http://localhost:${PORT}`));
  } catch (err) {
    // connectDB ha già loggato l’errore
    process.exit(1);
  }
})();

