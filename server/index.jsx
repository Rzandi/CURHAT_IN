require('dotenv').config(); // Baca file .env (WAJIB PALING ATAS)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- SECURITY TOOLS ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// --- IMPORT MODELS ---
const Curhatan = require('./models/Curhatan');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Ambil rahasia dari .env
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PIN = process.env.ADMIN_PIN || "12345"; // Default kalau lupa set di env

// ==========================================
// 1. GLOBAL MIDDLEWARE (SATPAM GERBANG UTAMA)
// ==========================================

// A. Helmet: Sembunyiin identitas server
app.use(helmet());

// B. CORS: Izinkan akses
app.use(cors({
  origin: '*', // Nanti ganti domain vercel frontend lu pas production biar lebih aman
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// C. General Rate Limiter (Anti Spam Umum)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request
  message: "Santai bro, server lagi istirahat bentar."
});
app.use('/api', generalLimiter);

// D. Sanitization (Bersihin Data Sampah/Jahat)
app.use(express.json({ limit: '10kb' })); // Batasi ukuran data
//app.use(mongoSanitize()); // Anti NoSQL Injection
//app.use(xss()); // Anti Script HTML
//app.use(hpp()); // Anti Parameter Pollution

// ==========================================
// 2. KONEKSI DATABASE
// ==========================================
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Database Konek & Aman!'))
  .catch(err => console.error('❌ Gagal Konek:', err));

// ==========================================
// 3. MIDDLEWARE KHUSUS (SATPAM VIP)
// ==========================================
// Fungsi ini cuma dipake di route yang butuh login
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token biasanya dikirim format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: "Akses ditolak! Login dulu bro." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token expired atau gak valid!" });
    }
    // Simpan data user (dari token) ke request
    req.user = decoded; 
    next(); // Lanjut ke proses berikutnya
  });
};

// Rate Limiter Khusus Login (Lebih Galak)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5, // Cuma boleh salah 5 kali
  message: "Salah password terus! Akun dikunci 1 jam."
});

// ==========================================
// 4. ROUTES (JALUR API)
// ==========================================

// --- A. AUTHENTICATION ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validasi input
    if (!username || !password) return res.status(400).json({ error: "Isi semua woi!" });
    if (password.length < 8) return res.status(400).json({ error: "Password minimal 8 karakter!" });

    // Cek duplikat
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username udah dipake." });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Register berhasil! Silakan login." });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// LOGIN (Update logic cek akun)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Cek Username ada apa enggak
    const user = await User.findOne({ username });
    
    // [UPDATE DI SINI] Kalau user gak ketemu, kasih kode 404 (Not Found)
    if (!user) {
      return res.status(404).json({ error: "Akun belum terdaftar! Bikin dulu sana." });
    }

    // 2. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password salah bro!" });
    }

    // 3. Bikin Token
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, username: user.username, message: "Login sukses!" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// --- B. FITUR CURHAT ---

// GET: Ambil data (Public - Gak perlu login)
app.get('/api/curhat', async (req, res) => {
  try {
    // Filter laporan < 5, urutkan terbaru
    const data = await Curhatan.find({ reports: { $lt: 5 } }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
});

// POST: Kirim curhatan (PROTECTED - Wajib Login pake verifyToken) 🔒
app.post('/api/curhat', verifyToken, async (req, res) => {
  try {
    const { content, mood } = req.body;
    
    // Validasi konten
    if (!content || content.trim().length === 0) return res.status(400).json({ error: "Konten kosong!" });
    if (content.length > 300) return res.status(400).json({ error: "Kepanjangan!" });

    // Sender diambil otomatis dari Token (req.user)
    const senderName = req.user.username; 

    const newCurhat = new Curhatan({
      sender: senderName, 
      content,
      mood
    });
    
    const saved = await newCurhat.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Gagal posting" });
  }
});

// LIKE (Public)
app.patch('/api/curhat/:id/like', async (req, res) => {
  try {
    const updated = await Curhatan.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// REPORT / CEPU (Public)
app.patch('/api/curhat/:id/report', async (req, res) => {
  try {
    const updated = await Curhatan.findByIdAndUpdate(req.params.id, { $inc: { reports: 1 } }, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// COMMENT (PROTECTED - Wajib Login biar ketauan siapa yang komen) 🔒
app.post('/api/curhat/:id/comment', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if(!content || content.trim() === "") return res.status(400).json({error: "Komen kosong"});

    // Sender otomatis dari token
    const senderName = req.user.username; 
    
    const updated = await Curhatan.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { sender: senderName, content } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE (Admin Only - Pake PIN)
app.delete('/api/curhat/:id', async (req, res) => {
  try {
    const { pin } = req.body;
    if (pin !== ADMIN_PIN) return res.status(401).json({ error: "Salah PIN Admin!" });
    
    await Curhatan.findByIdAndDelete(req.params.id);
    res.json({ message: "Berhasil dihapus!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 5. SERVER START (VERCEL COMPATIBLE)
// ==========================================
// Kalau jalan di Localhost (bukan Vercel), nyalain portnya
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server AMAN berjalan di port ${PORT}`));
}

// Export app buat Vercel
module.exports = app;