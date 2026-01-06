import React, { useState } from "react";
import { Card, CardBody, Input, Button, Link } from "@heroui/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.DEV 
  ? "http://localhost:3000" 
  : "https://curhat-api-zandi.vercel.app";

// Ini endpoint khusus Login
const API_URL = `${BASE_URL}/api/auth/login`;

export default function Login({ setToken, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
      // ... import navigate dll

  const handleLogin = async () => {
    if (!username || !password) return toast.warning("Isi dulu woi!");

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Login Sukses
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        setToken(data.token);
        setUser(data.username);
        toast.success(`Welcome back, ${data.username}! 😎`);
        navigate("/"); 
      } else if (res.status === 404) {
        // [UPDATE DI SINI] KHUSUS KALAU AKUN GAK ADA
        toast.error("Akun belum ada! Otw halaman daftar ya...");
        // Delay 2 detik biar user baca toast dulu, terus lempar ke Register
        setTimeout(() => navigate("/register"), 2000);
      } else {
        // Error lain (misal password salah)
        toast.error(data.error || "Gagal login");
      }
    } catch (err) {
      toast.error("Server lagi tidur kayaknya...");
    } finally {
      setLoading(false);
    }
  };

// ... sisa kode login sama

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 p-4">
        <CardBody className="gap-4">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold mb-1">Curhat.in 👻</h1>
            <p className="text-default-400 text-xs">Login dulu biar tau siapa yang cepu</p>
          </div>
          
          <Input
            size="sm"
            placeholder="nama lo"
            variant="bordered"
            value={username}
            onValueChange={setUsername}
            classNames={{inputWrapper: "bg-white/5 border-white/20"}}
          />
          <Input 
            size="sm"
            placeholder="kode lu"
            type="password"
            variant="bordered"
            value={password}
            onValueChange={setPassword}
            classNames={{inputWrapper: "bg-white/5 border-white/20"}}
          />
          
          <Button 
            color="primary" 
            className="w-full font-bold shadow-lg shadow-blue-500/20"
            isLoading={loading}
            onPress={handleLogin}
          >
            Masuk
          </Button>

          <p className="text-center text-sm text-default-400">
            Belum punya akun? <Link href="/register" color="primary">Daftar dulu</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}