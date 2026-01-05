import React, { useState, useEffect } from "react";
import CurhatCard from "./components/CurhatCard";
import CurhatInput from "./components/CurhatInput";

// Alamat Backend (Server Termux lu)
const API_URL = "http://localhost:3000/api/curhat";

function App() {
  const [curhats, setCurhats] = useState([]);

  // 1. Ambil Data pas Aplikasi dibuka
  useEffect(() => {
    fetchCurhats();
  }, []);

  const fetchCurhats = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCurhats(data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  // 2. Fungsi Kirim Curhatan (POST)
  const handlePost = async (newData) => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      fetchCurhats(); // Refresh data abis kirim
    } catch (err) {
      alert("Gagal ngirim curhatan :(");
    }
  };

  // 3. Fungsi Like (PATCH)
  const handleLike = async (id) => {
    try {
      await fetch(`${API_URL}/${id}/like`, { method: "PATCH" });
      fetchCurhats(); // Refresh angka like
    } catch (err) {
      console.error("Gagal like:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 flex flex-col items-center gap-4">
      
      {/* Header */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-yellow-500 text-transparent bg-clip-text mt-4 mb-2">
        Curhat.in
      </h1>

      {/* Form Input */}
      <CurhatInput onPost={handlePost} />

      {/* List Curhatan */}
      <div className="w-full flex flex-col items-center gap-4 pb-20">
        {curhats.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada curhatan. Jadilah yang pertama!</p>
        ) : (
          curhats.map((item) => (
            <CurhatCard 
              key={item._id} // MongoDB pake _id bukan id
              sender={item.sender}
              content={item.content}
              mood={item.mood}
              likes={item.likes}
              onLike={() => handleLike(item._id)}
            />
          ))
        )}
      </div>

    </div>
  );
}

export default App;