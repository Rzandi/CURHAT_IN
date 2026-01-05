const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Curhatan = require('./models/Curhatan');

const app = express();
const PORT = 3000;

// Middleware (Biar bisa baca JSON & Request dari Frontend)
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
// GANTI TEKS DI BAWAH INI SAMA LINK MONGODB LU SENDIRI! 👇
const MONGO_URI = "mongodb+srv://zandi:zandi120q@cluster0.eyym5dq.mongodb.net/?appName=Cluster0"

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Database Konek Bro!'))
  .catch(err => console.error('❌ Gagal Konek:', err));

// --- ROUTES (JALUR API) ---

// 1. GET: Ambil semua curhatan (Urut dari yang terbaru)
app.get('/api/curhat', async (req, res) => {
  try {
    const data = await Curhatan.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Kirim curhatan baru
app.post('/api/curhat', async (req, res) => {
  try {
    const newCurhat = new Curhatan(req.body);
    const saved = await newCurhat.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. PATCH: Tambah Like
app.patch('/api/curhat/:id/like', async (req, res) => {
  try {
    const updated = await Curhatan.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, // Nambah 1 like
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Jalanin Server
app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});