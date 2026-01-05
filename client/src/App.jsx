import React, { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import { toast } from "sonner"; // Pake toast buat notif
import CurhatCard from "./components/CurhatCard";
import CurhatInput from "./components/CurhatInput";

const API_URL = "http://localhost:3000/api/curhat";

function App() {
  const [curhats, setCurhats] = useState([]);
  const [loading, setLoading] = useState(true); // EDGE CASE: Loading State

  useEffect(() => {
    fetchCurhats();
  }, []);

  const fetchCurhats = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      // EDGE CASE: Handle Server Error
      if (!res.ok) throw new Error("Gagal ambil data");
      const data = await res.json();
      setCurhats(data);
    } catch (err) {
      toast.error("Gagal konek ke server! Cek Termux lu.");
    } finally {
      setLoading(false); // Stop loading apapun hasilnya
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
        // EDGE CASE: Error Validasi dari Backend (misal kosong)
        toast.warning(result.error); 
        return;
      }

      toast.success("Curhatan terkirim! 🎉");
      fetchCurhats();
    } catch (err) {
      toast.error("Gagal ngirim. Cek internet.");
    }
  };

  const handleLike = async (id) => {
    // Optimistic UI: Update angka like DULUAN di layar biar kerasa cepet
    setCurhats(prev => prev.map(item => 
      item._id === id ? { ...item, likes: item.likes + 1 } : item
    ));

    try {
      await fetch(`${API_URL}/${id}/like`, { method: "PATCH" });
    } catch (err) {
      // Kalau gagal, balikin angkanya (Rollback)
      fetchCurhats(); 
    }
  };

  // LOGIC HAPUS (ADMIN)
  const handleDelete = async (id) => {
    // Tanya PIN lewat Prompt browser bawaan (Simple Admin)
    const pin = prompt("Masukin PIN Admin buat hapus:");
    if (!pin) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }), // Kirim PIN ke server
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Dihapus oleh Admin 👮");
        // Hapus dari layar langsung biar gak perlu fetch ulang
        setCurhats(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error(result.error); // PIN Salah
      }
    } catch (err) {
      toast.error("Gagal menghapus.");
    }
  };

  return (
    // Hapus bg-black, ganti jadi min-h-screen w-full
    <div className="min-h-screen w-full p-4 flex flex-col items-center gap-6">
      
      {/* Header dengan Glow Effect */}
      <div className="mt-8 mb-2 text-center relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-40"></div>
        <h1 className="relative text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text drop-shadow-sm">
          Curhat.in
        </h1>
        <p className="text-default-400 text-sm mt-2 font-medium">Tempat sambat tanpa terlihat 👻</p>
      </div>

      <CurhatInput onPost={handlePost} />

      <div className="w-full flex flex-col items-center gap-4 pb-20">
        {loading ? (
          <Spinner size="lg" color="secondary" />
        ) : curhats.length === 0 ? (
          <div className="text-center mt-10 opacity-60 p-8 border border-dashed border-default-300/30 rounded-2xl">
            <p className="text-5xl mb-2">🌑</p>
            <p className="text-lg font-semibold">Masih sepi nih...</p>
            <p className="text-sm">Jadilah yang pertama meramaikan!</p>
          </div>
        ) : (
          curhats.map((item, index) => (
            // Tambah style biar animasinya delay dikit per kartu (efek domino)
            <div key={item._id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-card w-full flex justify-center">
               <CurhatCard 
                  {...item} 
                  onLike={() => handleLike(item._id)}
                  onDelete={() => handleDelete(item._id)}
                />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;