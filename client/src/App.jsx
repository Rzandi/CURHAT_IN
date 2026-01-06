import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Spinner, Chip, Tabs, Tab, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { toast } from "sonner";

// Import Halaman & Komponen
import Login from "./pages/Login";
import Register from "./pages/Register";
import CurhatCard from "./components/CurhatCard";
import CurhatInput from "./components/CurhatInput";

// Cek: Kalau lagi mode DEV (Local), pake Localhost. Kalau bukan, pake Vercel.
const BASE_URL = import.meta.env.DEV 
  ? "http://localhost:3000" 
  : "https://curhat-api-zandi.vercel.app"; // Ganti link vercel backend lu yang bener

const API_URL = `${BASE_URL}/api/curhat`;
// --- KOMPONEN HOME (DASHBOARD UTAMA) ---
function Home({ token, user, onLogout }) {
  const [curhats, setCurhats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // State Likes & Reports (LocalStorage)
  const [likedPosts, setLikedPosts] = useState(() => JSON.parse(localStorage.getItem("liked_curhats")) || []);
  const [reportedPosts, setReportedPosts] = useState(() => JSON.parse(localStorage.getItem("reported_curhats")) || []);

  const MOOD_FILTERS = [
    { key: "all", label: "Semua", color: "default" },
    { key: "chill", label: "😎 Chill", color: "default" },
    { key: "happy", label: "😆 Happy", color: "warning" },
    { key: "sad", label: "😢 Sad", color: "primary" },
    { key: "angry", label: "😡 Angry", color: "danger" },
    { key: "love", label: "😍 Love", color: "secondary" },
  ];

  useEffect(() => { fetchCurhats(); }, []);

  const fetchCurhats = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCurhats(data);
    } catch (err) { toast.error("Gagal konek server"); } 
    finally { setLoading(false); }
  };

  const handlePost = async (newData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Kirim token (kalo nanti backend butuh)
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ ...newData, sender: user }), // Pake username yang login
      });
      if (res.ok) {
        toast.success("Curhatan terkirim! 🎉");
        fetchCurhats();
      } else {
        toast.warning("Gagal kirim");
      }
    } catch (err) { toast.error("Error ngirim"); }
  };

  const handleLike = async (id) => {
    if (likedPosts.includes(id)) return toast.warning("Udah di-like bro!");
    setCurhats(prev => prev.map(item => item._id === id ? { ...item, likes: item.likes + 1 } : item));
    const newList = [...likedPosts, id];
    setLikedPosts(newList);
    localStorage.setItem("liked_curhats", JSON.stringify(newList));
    await fetch(`${API_URL}/${id}/like`, { method: "PATCH" });
  };

  const handleComment = async (id, text, senderName) => {
    try {
      const res = await fetch(`${API_URL}/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: user || senderName }), // Pake user login
      });
      if (res.ok) {
        const updated = await res.json();
        setCurhats(prev => prev.map(item => item._id === id ? updated : item));
        toast.success("Komentar masuk!");
      }
    } catch (err) { toast.error("Gagal komen"); }
  };

  // ... (Fungsi Report & Delete sama kayak sebelumnya, copy paste aja kalau mau lengkap)
  const handleReport = async (id) => {
     if (reportedPosts.includes(id)) return toast.error("Udah dilaporin!");
     if (!confirm("Laporin konten ini?")) return;
     setCurhats(prev => prev.filter(i => i._id !== id));
     const newList = [...reportedPosts, id];
     setReportedPosts(newList);
     localStorage.setItem("reported_curhats", JSON.stringify(newList));
     await fetch(`${API_URL}/${id}/report`, { method: "PATCH" });
  };
  
  const handleDelete = async (id) => {
     const pin = prompt("PIN Admin:");
     if (!pin) return;
     const res = await fetch(`${API_URL}/${id}`, { 
        method: "DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({pin}) 
     });
     if(res.ok) {
        setCurhats(prev => prev.filter(i => i._id !== id));
        toast.success("Dihapus Admin");
     } else toast.error("Gagal hapus");
  };

  // Filter & Sort Logic
  const getProcessedData = () => {
    let data = [...curhats];
    if (activeFilter !== "all") data = data.filter(i => i.mood === activeFilter);
    if (sortBy === "popular") {
       data.sort((a, b) => ((b.likes||0)+(b.comments?.length||0)) - ((a.likes||0)+(a.comments?.length||0)));
    }
    return data;
  };
  const finalData = getProcessedData();

  return (
    <div className="min-h-screen w-full p-4 flex flex-col items-center gap-6">
      {/* HEADER USER */}
      <div className="w-full max-w-[400px] flex justify-between items-center bg-white/5 p-2 rounded-full border border-white/10 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <Avatar size="sm" src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user}`} isBordered />
            <span className="font-bold text-sm">Hi, {user}!</span>
        </div>
        <Button size="sm" color="danger" variant="flat" onPress={onLogout}>Logout</Button>
      </div>

      <div className="mt-2 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 text-transparent bg-clip-text">Curhat.in</h1>
      </div>

      <CurhatInput onPost={handlePost} />

      <Tabs aria-label="Sort" color="secondary" radius="full" selectedKey={sortBy} onSelectionChange={setSortBy} className="mb-2">
        <Tab key="newest" title="🔥 Terbaru" />
        <Tab key="popular" title="❤️ Terpopuler" />
      </Tabs>

      <div className="flex gap-2 flex-wrap justify-center max-w-[400px]">
        {MOOD_FILTERS.map((f) => (
          <Chip key={f.key} variant={activeFilter===f.key?"solid":"bordered"} color={activeFilter===f.key?f.color:"default"} onClick={()=>setActiveFilter(f.key)} className="cursor-pointer border-white/20">
            {f.label}
          </Chip>
        ))}
      </div>

      <div className="w-full flex flex-col items-center gap-4 pb-20">
        {loading ? <Spinner color="secondary" /> : finalData.map((item, idx) => (
            <div key={`${item._id}-${sortBy}`} style={{animationDelay:`${idx*0.1}s`}} className="animate-card w-full flex justify-center">
               <CurhatCard 
                 {...item} 
                 isLiked={likedPosts.includes(item._id)}
                 onLike={()=>handleLike(item._id)}
                 onReport={()=>handleReport(item._id)}
                 onDelete={()=>handleDelete(item._id)}
                 onComment={handleComment}
               />
            </div>
        ))}
      </div>
    </div>
  );
}

// --- APP UTAMA (ROUTING) ---
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(localStorage.getItem("username"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUser(null);
    toast.info("Dadah! 👋");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={token ? <Home token={token} user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={!token ? <Login setToken={setToken} setUser={setUser} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register" 
          element={!token ? <Register /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;