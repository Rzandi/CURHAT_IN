import React, { useState } from "react";
import { Card, CardBody, Input, Button, Link } from "@heroui/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Setup URL dinamis
const BASE_URL = import.meta.env.DEV 
  ? "http://localhost:3000" 
  : "https://curhat-api-zandi.vercel.app"; // Ganti link vercel lu

export default function Register() { // Kita gak butuh props setToken disini, kita refresh aja nanti
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) return toast.warning("Isi semua kolom!");
    if (password.length < 8) return toast.warning("Password minimal 8 karakter!");

    setLoading(true);
    try {
      // 1. PROSES REGISTER
      const resReg = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const dataReg = await resReg.json();

      if (!resReg.ok) {
        throw new Error(dataReg.error || "Gagal daftar");
      }

      // 2. REGISTER SUKSES -> LANGSUNG AUTO LOGIN
      toast.success("Daftar berhasil! Sedang masuk...");
      
      const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const dataLogin = await resLogin.json();
      
      if (resLogin.ok) {
        // Simpan Token
        localStorage.setItem("token", dataLogin.token);
        localStorage.setItem("username", dataLogin.username);
        
        // Kita paksa reload halaman biar App.jsx baca token baru dari LocalStorage
        // Ini cara paling gampang tanpa ngoper props njelimet
        window.location.href = "/"; 
      }

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
       <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-20 fixed w-full h-full pointer-events-none"></div>
      <Card className="w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 p-4">
        <CardBody className="gap-4">
          <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Gabung Curhat.in 🚀
          </h2>
          <Input 
            size="sm"
            placeholder="Pilih nama keren..." 
            variant="bordered"
            value={username}
            onValueChange={setUsername}
            classNames={{inputWrapper: "bg-white/5 border-white/20"}}
          />
          <Input 
            size="sm"
            placeholder="rahasian lu" 
            type="password"
            variant="bordered"
            value={password}
            onValueChange={setPassword}
            classNames={{inputWrapper: "bg-white/5 border-white/20"}}
          />
          
          <Button 
            color="secondary" 
            className="w-full font-bold shadow-lg shadow-purple-500/20"
            isLoading={loading}
            onPress={handleRegister}
          >
            Daftar & Langsung Masuk
          </Button>

          <p className="text-center text-sm text-default-400">
            Udah punya akun? <Link href="/login" color="secondary">Login sini</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}