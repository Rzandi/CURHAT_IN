import React, { useState } from "react";
import { Card, Button, Textarea, Input, Select, SelectItem } from "@heroui/react";

export default function CurhatInput({ onPost }) {
  const [sender, setSender] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("chill");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return alert("Isi curhatannya dulu dong!");
    
    setLoading(true);
    // Kirim data ke App.jsx buat diproses ke Server
    await onPost({ sender: sender || "Anonim", content, mood });
    
    // Reset Form
    setContent("");
    setLoading(false);
  };

  return (
   <Card className="w-full max-w-[400px] p-4 gap-4 mb-2 border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
      <h3 className="font-bold text-lg text-default-700">Tulis Curhatan 📝</h3>
      
      <div className="flex gap-2">
        <Input 
          size="sm" 
          placeholder="Siapa ni?" 
          value={sender} 
          onValueChange={setSender} 
          classNames={{
            input: "text-small", // Biar font inputnya pas
          }}
        />
        <select 
          className="bg-default-100 rounded-medium px-2 text-small outline-none"
          value={mood} onChange={(e) => setMood(e.target.value)}
        >
          <option value="chill">😎 Chill</option>
          <option value="happy">😆 Happy</option>
          <option value="sad">😢 Sad</option>
          <option value="angry">😡 Angry</option>
          <option value="love">😍 Love</option>
        </select>
      </div>

      <Textarea 
        placeholder="Tumpahkan unek-unekmu di sini..." 
        minRows={3}
        value={content} onValueChange={setContent}
      />

      <Button color="secondary" isLoading={loading} onPress={handleSubmit}>
        Kirim Curhatan 🚀
      </Button>
    </Card>
  );
}