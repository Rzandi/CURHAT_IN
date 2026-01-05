import React from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Chip } from "@heroui/react";

// Kita bikin kamus warna buat Mood
const moodColors = {
  happy: "warning",   // Kuning
  sad: "primary",     // Biru
  angry: "danger",    // Merah
  love: "secondary",  // Pink
  chill: "default"    // Abu-abu
};

export default function CurhatCard({ sender, content, mood, likes, onLike }) {
  // Pilih warna berdasarkan mood, kalau mood ga dikenal kasih warna default
  const color = moodColors[mood] || "default";

  return (
    <Card className="w-full max-w-[400px] bg-content1 shadow-lg border-none">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          {/* Avatar otomatis generate gambar berdasarkan nama sender */}
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
        
        {/* Badge Mood */}
        <Chip color={color} variant="flat" size="sm" className="capitalize">
          {mood}
        </Chip>
      </CardHeader>

      <CardBody className="px-3 py-0 text-small text-default-400">
        <div className="p-3 rounded-xl bg-default-100/50">
          <p className="text-foreground font-medium italic">
            "{content}"
          </p>
        </div>
      </CardBody>

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