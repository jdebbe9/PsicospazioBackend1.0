const Appointment = require('../models/Appointment');

exports.bookAppointment = async (req, res) => {
  try {
    const { therapistId, date, notes } = req.body;

    const appointment = new Appointment({
      patient: req.user.id,
      therapist: therapistId,
      date,
      notes
    });

    await appointment.save();
    res.status(201).json({ message: 'Appuntamento richiesto' });
  } catch (err) {
    console.error("Errore prenotazione:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const roleField = req.user.role === 'therapist' ? 'therapist' : 'patient';
    const appointments = await Appointment.find({ [roleField]: req.user.id }).sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error("Errore lettura appuntamenti:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Appuntamento non trovato' });
    res.json(updated);
  } catch (err) {
    console.error("Errore aggiornamento:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};
