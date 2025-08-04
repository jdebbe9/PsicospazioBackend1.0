const QuestionnaireResponse = require('../models/QuestionnaireResponse');
const User = require('../models/User');

exports.submitQuestionnaire = async (req, res) => {
  try {
    const existing = await QuestionnaireResponse.findOne({ user: req.user.id });
    if (existing) return res.status(409).json({ message: 'Questionario già inviato' });

    const response = new QuestionnaireResponse({
      user: req.user.id,
      responses: req.body.responses
    });
    await response.save();

    // aggiorna lo stato dell’utente
    await User.findByIdAndUpdate(req.user.id, { questionnaireDone: true });

    res.status(201).json({ message: 'Questionario salvato' });
  } catch (err) {
    console.error("Errore invio questionario:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};

exports.getMyQuestionnaire = async (req, res) => {
  try {
    const response = await QuestionnaireResponse.findOne({ user: req.user.id });
    if (!response) return res.status(404).json({ message: 'Nessun questionario trovato' });
    res.json(response);
  } catch (err) {
    console.error("Errore lettura questionario:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};
