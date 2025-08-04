const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // importa funzione di connessione DB

// Carica le variabili d'ambiente
dotenv.config();

// Connessione al database MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); // per leggere JSON nel body
app.use(cookieParser());

// Rotte API
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rotte placeholder per gli altri moduli (li aggiungeremo dopo)
app.use('/api/appointments', (req, res) => res.send('Appuntamenti'));
app.use('/api/questionnaire', (req, res) => res.send('Questionario'));
app.use('/api/diary', (req, res) => res.send('Diario'));
app.use('/api/therapist', (req, res) => res.send('Terapeuta'));

// Error handling base
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Qualcosa è andato storto!' });
});

// Avvio del server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server avviato sulla porta ${PORT}`);
});

