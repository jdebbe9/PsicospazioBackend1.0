const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'therapist'],
    default: 'patient'
  },
  questionnaireDone: {
    type: Boolean,
    default: false
  },
  consentGivenAt: {
    type: Date,
    required: true
  },
  currentRefreshToken: {
    type: String, // hash del refresh token
    default: null
  }
}, { timestamps: true });

// metodo per salvare (hashare) il refresh token
userSchema.methods.setRefreshToken = async function (refreshToken) {
  this.currentRefreshToken = await bcrypt.hash(refreshToken, 10);
  await this.save();
};

// verifica se il refresh token inviato corrisponde all'hash salvato
userSchema.methods.isRefreshTokenValid = async function (token) {
  if (!this.currentRefreshToken) return false;
  return bcrypt.compare(token, this.currentRefreshToken);
};

module.exports = mongoose.model('User', userSchema);
