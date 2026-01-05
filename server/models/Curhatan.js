const mongoose = require('mongoose');

const CurhatanSchema = new mongoose.Schema({
  sender: {
    type: String,
    default: "Anonim", // Kalau gak isi nama, jadi Anonim
    trim: true
  },
  content: {
    type: String,
    required: true, // Wajib ada isinya
    trim: true,
    maxlength: 300 // Jangan panjang-panjang kayak koran
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'love', 'chill'],
    default: 'chill'
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now // Otomatis catet jam dibuat
  }
});

module.exports = mongoose.model('Curhatan', CurhatanSchema);