import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Chip } from "@heroui/react";

// Kamus warna mood
const moodColors = {
  happy: "warning",   // Kuning
  sad: "primary",     // Biru
  angry: "danger",    // Merah
  love: "secondary",  // Pink
  chill: "default"    // Abu-abu
};

export default function CurhatCard({ sender, content, mood, likes, onLike, onDelete }) {
  // Tentukan warna berdasarkan mood
  const color = moodColors[mood] || "default";

  return (
    <Card className="w-full max-w-[400px] border border-white/10 bg-white/5 backdrop-blur-md shadow-xl relative group animate-card">
      
      {/* --- TOMBOL HAPUS (ADMIN) --- */}
      {/* PERBAIKAN: Pake z-50 biar paling atas & onClick biar pasti jalan */}
      <Button 
        isIconOnly 
        size="sm" 
        color="danger" 
        variant="light" 
        className="absolute top-2 right-2 opacity-50 hover:opacity-100 z-50 cursor-pointer"
        onClick={onDelete}
      >
        🗑️
      </Button>

      {/* --- HEADER (Nama & Mood) --- */}
      {/* pr-10 biar nama gak ketabrak tombol hapus */}
      <CardHeader className="justify-between pr-10"> 
        <div className="flex gap-3">
          <Avatar 
            isBordered 
            radius="full" 
            size="sm" 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${sender}`} 
          />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{sender}</h4>
            <span className="text-tiny text-default-400">Baru saja</span>
          </div>
        </div>
        
        <Chip color={color} variant="flat" size="sm" className="capitalize">
          {mood}
        </Chip>
      </CardHeader>

      {/* --- ISI CURHATAN --- */}
      <CardBody className="px-3 py-0 text-small text-default-400">
        <div className="p-3 rounded-xl bg-default-100/50">
          <p className="text-foreground font-medium italic break-words">
            "{content}"
          </p>
        </div>
      </CardBody>

      {/* --- FOOTER (Like Button) --- */}
      <CardFooter className="gap-3 justify-end">
        <Button 
          color="danger" 
          variant="light" 
          size="sm" 
          onPress={onLike}
          startContent={<span>❤️</span>}
        >
          {likes} Likes
        </Button>
      </CardFooter>
    </Card>
  );
}