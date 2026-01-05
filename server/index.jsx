const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Curhatan = require('./models/Curhatan'); // Import model dari file sebelah

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
// Link MongoDB Punya Lu
const MONGO_URI = "mongodb+srv://zandi:zandi120q@cluster0.eyym5dq.mongodb.net/?appName=Cluster0"

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Database Konek Bro!'))
  .catch(err => console.error('❌ Gagal Konek:', err));

// --- ROUTES (JALUR API) ---

// 1. GET: Ambil curhatan (Filter report < 5 & urut terbaru)
app.get('/api/curhat', async (req, res) => {
  try {
    // UPDATED: Cuma ambil yang reports-nya di bawah 5 (Batas toleransi)
    const data = await Curhatan.find({ reports: { $lt: 5 } }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Kirim curhatan baru
app.post('/api/curhat', async (req, res) => {
  try {
    const { content, sender, mood } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Curhatan gaboleh kosong bro!" });
    }

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
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. PATCH: Report / Cepu (INI JALUR BARU) 🚩
app.patch('/api/curhat/:id/report', async (req, res) => {
  try {
    const updated = await Curhatan.findByIdAndUpdate(
      req.params.id,
      { $inc: { reports: 1 } }, // Nambah angka report +1
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Kirim Komentar 💬
app.post('/api/curhat/:id/comment', async (req, res) => {
  try {
    const { sender, content } = req.body;

    // Validasi dikit biar gak nyepam kosong
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Komentar kosong bro!" });
    }

    const updated = await Curhatan.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          comments: { 
            sender: sender || "Anonim", 
            content: content 
          } 
        } 
      },
      { new: true } // Balikin data terbaru (yg udah ada komennya)
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. DELETE: Hapus curhatan (Admin)
app.delete('/api/curhat/:id', async (req, res) => {
  try {
    const { pin } = req.body;
    const ADMIN_PIN = "12345"; 

    if (pin !== ADMIN_PIN) {
      return res.status(401).json({ error: "PIN Salah! Ente bukan admin." });
    }

    const deleted = await Curhatan.findByIdAndDelete(req.params.id);
    
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