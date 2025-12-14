const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String },
  originalName: { type: String },
  question: { type: String },
  flaskResponse: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Upload', uploadSchema);
