const DiaryEntry = require('../models/DiaryEntry');

exports.createDiaryEntry = async (req, res) => {
  try {
    const entry = new DiaryEntry({
      user: req.user.id,
      content: req.body.content
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error("Errore creazione diario:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};

exports.getMyDiaryEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error("Errore lettura diario:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};

exports.updateDiaryEntry = async (req, res) => {
  try {
    const entry = await DiaryEntry.findOneAndUpdate(
      { _id: req.params.entryId, user: req.user.id },
      { content: req.body.content },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry non trovata' });
    res.json(entry);
  } catch (err) {
    console.error("Errore aggiornamento diario:", err);
    res.status(500).json({ message: 'Errore interno' });
  }
};
