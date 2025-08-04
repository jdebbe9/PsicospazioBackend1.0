const User = require('../models/User');
const QuestionnaireResponse = require('../models/QuestionnaireResponse');
const DiaryEntry = require('../models/DiaryEntry');
const Appointment = require('../models/Appointment');

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-passwordHash -currentRefreshToken');
    res.json(patients);
  } catch (err) {
    console.error("Errore lettura pazienti:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};

exports.getPatientDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-passwordHash -currentRefreshToken');
    if (!user || user.role !== 'patient') return res.status(404).json({ message: 'Paziente non trovato' });

    const diary = await DiaryEntry.find({ user: userId }).sort({ createdAt: -1 });
    const questionnaire = await QuestionnaireResponse.findOne({ user: userId });
    const appointments = await Appointment.find({ patient: userId });

    res.json({ user, diary, questionnaire, appointments });
  } catch (err) {
    console.error("Errore dettagli paziente:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};
