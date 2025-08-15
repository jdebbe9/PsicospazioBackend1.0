const mongoose = require('mongoose');

const DiaryEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    }
    // niente "date": usiamo createdAt fornito da timestamps
  },
  { timestamps: true }
);

// Query tipica: entry di un utente, più recenti prima
DiaryEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('DiaryEntry', DiaryEntrySchema);

