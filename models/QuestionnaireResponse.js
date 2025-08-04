const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  responses: {
    type: Map,
    of: String
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuestionnaireResponse', questionnaireSchema);
