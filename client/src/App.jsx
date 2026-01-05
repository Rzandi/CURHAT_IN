import React, { useState, useEffect } from "react";
import { Spinner, Chip, Tabs, Tab } from "@heroui/react";
import { toast } from "sonner";
import CurhatCard from "./components/CurhatCard";
import CurhatInput from "./components/CurhatInput";

const API_URL = "http://localhost:3000/api/curhat";

const MOOD_FILTERS = [
  { key: "all", label: "Semua", color: "default" },
  { key: "chill", label: "😎 Chill", color: "default" },
  { key: "happy", label: "😆 Happy", color: "warning" },
  { key: "sad", label: "😢 Sad", color: "primary" },
  { key: "angry", label: "😡 Angry", color: "danger" },
  { key: "love", label: "😍 Love", color: "secondary" },
];

function App() {
  const [curhats, setCurhats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // State Likes LocalStorage
  const [likedPosts, setLikedPosts] = useState(() => {
    const saved = localStorage.getItem("liked_curhats");
    return saved ? JSON.parse(saved) : [];
  });

  // State Reports LocalStorage
  const [reportedPosts, setReportedPosts] = useState(() => {
    const saved = localStorage.getItem("reported_curhats");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchCurhats();
  }, []);

  const fetchCurhats = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Gagal ambil data");
      const data = await res.json();
      setCurhats(data);
    } catch (err) {
      toast.error("Gagal konek ke server!");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (newData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.warning(result.error);
        return;
      }
      toast.success("Curhatan terkirim! 🎉");
      fetchCurhats();
      setActiveFilter("all");
      setSortBy("newest");
    } catch (err) {
      toast.error("Gagal ngirim.");
    }
  };

  const handleLike = async (id) => {
    if (likedPosts.includes(id)) {
      toast.warning("Eits, cuma boleh like sekali ya! 😜");
      return;
    }
    setCurhats(prev => prev.map(item => 
      item._id === id ? { ...item, likes: item.likes + 1 } : item
    ));
    const newLikedList = [...likedPosts, id];
    setLikedPosts(newLikedList);
    localStorage.setItem("liked_curhats", JSON.stringify(newLikedList));

    try {
      await fetch(`${API_URL}/${id}/like`, { method: "PATCH" });
    } catch (err) {
      fetchCurhats(); 
    }
  };

  const handleReport = async (id) => {
    if (reportedPosts.includes(id)) {
      toast.error("Lu udah laporin ini sebelumnya! 👮");
      return;
    }
    if (!confirm("Yakin mau laporin konten ini sebagai toxic/spam?")) return;

    setCurhats(prev => prev.filter(item => item._id !== id));
    toast.success("Laporan diterima! Konten disembunyikan. 🚩");

    const newReportedList = [...reportedPosts, id];
    setReportedPosts(newReportedList);
    localStorage.setItem("reported_curhats", JSON.stringify(newReportedList));

    try {
      await fetch(`${API_URL}/${id}/report`, { method: "PATCH" });
    } catch (err) {
      console.error("Gagal lapor");
    }
  };

  const handleDelete = async (id) => {
    const pin = prompt("Masukin PIN Admin buat hapus:");
    if (!pin) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Dihapus oleh Admin 👮");
        setCurhats(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Gagal menghapus.");
    }
  };

  // --- INI DIA FUNGSI YANG HILANG TADI! ---
  const handleComment = async (id, text, senderName) => {
    try {
      const res = await fetch(`${API_URL}/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: text, 
          sender: senderName || "Anonim" 
        }),
      });

      if (res.ok) {
        const updatedCurhat = await res.json();
        
        // Update State langsung biar gak perlu refresh
        setCurhats(prev => prev.map(item => 
          item._id === id ? updatedCurhat : item
        ));
        toast.success("Komentar masuk! 💬");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal kirim komentar.");
    }
  };
  // -----------------------------------------

// Logic Filter & Sort
  const getProcessedData = () => {
    let data = [...curhats];

    // 1. Filter Mood
    if (activeFilter !== "all") {
      data = data.filter(item => item.mood === activeFilter);
    }

    // 2. Sorting (UPDATE DI SINI)
    if (sortBy === "popular") {
      data.sort((a, b) => {
        // Hitung skor: Likes + Jumlah Komentar
        const scoreA = (a.likes || 0) + (a.comments?.length || 0);
        const scoreB = (b.likes || 0) + (b.comments?.length || 0);
        
        // Urutkan dari skor tertinggi
        return scoreB - scoreA;
      });
    } 
    // Kalau 'newest' biarin aja, karena default dari server udah newest
    
    return data;
  };

  const finalData = getProcessedData();

  return (
    <div className="min-h-screen w-full p-4 flex flex-col items-center gap-6">
      <div className="mt-8 mb-2 text-center relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-40"></div>
        <h1 className="relative text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text drop-shadow-sm">
          Curhat.in
        </h1>
        <p className="text-default-400 text-sm mt-2 font-medium">Tempat sambat tanpa terlihat 👻</p>
      </div>

      <CurhatInput onPost={handlePost} />

      <Tabs 
        aria-label="Sort Options" 
        color="secondary" 
        variant="bordered"
        radius="full"
        selectedKey={sortBy}
        onSelectionChange={setSortBy}
        className="mb-2"
      >
        <Tab key="newest" title="🔥 Terbaru" />
        <Tab key="popular" title="❤️ Terpopuler" />
      </Tabs>

      <div className="flex gap-2 flex-wrap justify-center max-w-[400px]">
        {MOOD_FILTERS.map((f) => (
          <Chip
            key={f.key}
            variant={activeFilter === f.key ? "solid" : "bordered"}
            color={activeFilter === f.key ? f.color : "default"}
            className="cursor-pointer transition-transform active:scale-95 border-white/20"
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      <div className="w-full flex flex-col items-center gap-4 pb-20">
        {loading ? (
          <Spinner size="lg" color="secondary" />
        ) : finalData.length === 0 ? (
          <div className="text-center mt-10 opacity-60 p-8 border border-dashed border-default-300/30 rounded-2xl">
            <p className="text-5xl mb-2">
              {activeFilter === "all" ? "🌑" : "🔍"}
            </p>
            <p className="text-lg font-semibold">
              {activeFilter === "all" ? "Masih sepi nih..." : `Gak ada yang lagi ${activeFilter}`}
            </p>
            <p className="text-sm">Yuk ramaikan!</p>
          </div>
        ) : (
          finalData.map((item, index) => (
            <div 
              key={`${item._id}-${sortBy}`} 
              style={{ animationDelay: `${index * 0.1}s` }} 
              className="animate-card w-full flex justify-center"
            >
               <CurhatCard 
                  {...item} 
                  isLiked={likedPosts.includes(item._id)} 
                  onLike={() => handleLike(item._id)}
                  onDelete={() => handleDelete(item._id)}
                  onReport={() => handleReport(item._id)}
                  onComment={handleComment} // <-- Nah ini dia biang keroknya tadi
                />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;