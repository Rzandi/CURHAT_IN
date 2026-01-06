const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Username gak boleh kembar
  password: { type: String, required: true },
  avatar: { type: String, default: "" }, // Buat foto profil nanti
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
