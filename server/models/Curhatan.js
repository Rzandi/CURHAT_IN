const mongoose = require('mongoose');

const curhatSchema = new mongoose.Schema({
  sender: String,
  content: String,
  mood: String,
  likes: { type: Number, default: 0 },
  reports: { type: Number, default: 0 },
  comments: [{
    sender: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Curhatan', curhatSchema);