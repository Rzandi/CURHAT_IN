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
    const { content, sender, mood } = req.body;

    // EDGE CASE 1: Mencegah input kosong atau cuma spasi
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Curhatan gaboleh kosong bro!" });
    }

    // EDGE CASE 2: Mencegah novel (kepanjangan)
    if (content.length > 300) {
      return res.status(400).json({ error: "Kepanjangan! Maks 300 karakter aja." });
    }

    const newCurhat = new Curhatan({
      sender: sender || "Anonim",
      content: content,
      mood: mood
    });

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

// DELETE: Hapus curhatan (Pake PIN biar gak sembarang orang hapus)
app.delete('/api/curhat/:id', async (req, res) => {
  try {
    const { pin } = req.body; // Kita minta PIN dari body request
    const ADMIN_PIN = "12345"; // Ganti PIN sesuka hati lu (Hardcode dulu buat V2)

    // EDGE CASE 3: Proteksi Admin
    if (pin !== ADMIN_PIN) {
      return res.status(401).json({ error: "PIN Salah! Ente bukan admin." });
    }

    const deleted = await Curhatan.findByIdAndDelete(req.params.id);
    
    // EDGE CASE 4: ID gak ketemu (udah dihapus duluan)
    if (!deleted) {
      return res.status(404).json({ error: "Curhatan udah ga ada." });
    }

    res.json({ message: "Berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Jalanin Server
app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});