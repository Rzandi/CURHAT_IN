import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Chip, Input, Divider } from "@heroui/react";

const moodColors = {
  happy: "warning",
  sad: "primary",
  angry: "danger",
  love: "secondary",
  chill: "default"
};

export default function CurhatCard({ 
  _id, 
  sender, 
  content, 
  mood, 
  likes, 
  comments, 
  onLike, 
  onDelete, 
  isLiked, 
  onReport, 
  onComment 
}) {
  const color = moodColors[mood] || "default";
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentSender, setCommentSender] = useState("");

  // SAFETY CHECK 1: Pastikan comments selalu dianggap Array biar gak error .length
  const safeComments = Array.isArray(comments) ? comments : [];

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    if (onComment) { // SAFETY CHECK 2: Pastikan fungsi onComment ada
      onComment(_id, newComment, commentSender);
    }
    setNewComment("");
  };

  return (
    <Card className="w-full max-w-[400px] border border-white/10 bg-white/5 backdrop-blur-md shadow-xl relative group animate-card">
      
      {/* Tombol Lapor & Hapus (Tetap Sama) */}
      <Button 
        isIconOnly size="sm" variant="light" 
        className="absolute top-2 left-2 opacity-20 hover:opacity-100 z-50 min-w-0 w-6 h-6 cursor-pointer"
        onClick={onReport}
      >🚩</Button>

      <Button 
        isIconOnly size="sm" color="danger" variant="light" 
        className="absolute top-2 right-2 opacity-50 hover:opacity-100 z-50 cursor-pointer"
        onClick={onDelete}
      >🗑️</Button>

      {/* --- HEADER (FIXED AVATAR & JARAK AMAN) --- */}
      <CardHeader className="flex justify-between items-center pl-4 pr-14 pt-4 pb-2"> 
        <div className="flex gap-3 items-center">
          <Avatar 
            isBordered 
            radius="full" 
            className="w-10 h-10 min-w-10 min-h-10" 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${sender || "Anonim"}`} 
          />
          <div className="flex flex-col gap-0.5 items-start justify-center">
            <h4 className="text-small font-bold text-default-600 line-clamp-1">{sender || "Anonim"}</h4>
            <span className="text-[10px] text-default-400">Baru saja</span>
          </div>
        </div>
        
        {/* Chip Mood */}
        <Chip color={color} variant="flat" size="sm" className="capitalize text-xs h-6">
          {mood || "chill"}
        </Chip>
      </CardHeader>

      {/* --- BODY (FIXED TEXT POSITION) --- */}
      <CardBody className="px-4 py-2 text-small text-default-400">
        {/* Kotak Abu Curhatan */}
        <div className="p-4 rounded-2xl bg-black/20 border border-white/5 min-h-[80px] flex items-center justify-center">
          <p className="text-foreground-100 font-medium italic text-center break-words w-full leading-relaxed">
            "{content}"
          </p>
        </div>

        {/* Kolom Komentar (Tetap Sama) */}
        {showComments && (
          <div className="mt-3 flex flex-col gap-2 animate-card border-t border-white/10 pt-2">
            
            <p className="text-xs text-default-400 font-semibold mb-1 ml-1">
              Komentar ({safeComments.length})
            </p>
            
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto mb-2 pr-1 custom-scrollbar">
              {safeComments.length > 0 ? (
                safeComments.map((c, i) => (
                  <div key={i} className="text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="font-bold text-secondary-400 block mb-0.5">{c.sender || "Anonim"}</span>
                    <span className="text-foreground-200">{c.content}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs italic text-default-300 text-center py-2">Belum ada yang julid.</p>
              )}
            </div>

            <div className="flex gap-2 flex-col bg-white/5 p-2 rounded-xl">
               <Input 
                size="sm" placeholder="Nama" value={commentSender} onValueChange={setCommentSender}
                classNames={{input: "text-xs", inputWrapper: "h-8 bg-black/30 border-none"}}
              />
              <div className="flex gap-1">
                <Input 
                  size="sm" placeholder="Balas..." value={newComment} onValueChange={setNewComment}
                  classNames={{inputWrapper: "bg-black/30 border-none"}}
                />
                <Button size="sm" color="secondary" isIconOnly onPress={handleSendComment} className="min-w-8 w-8 h-8">➤</Button>
              </div>
            </div>
          </div>
        )}
      </CardBody>

      {/* Footer (Tetap Sama) */}
      <CardFooter className="gap-3 justify-end px-4 pb-4 pt-2">
        <Button 
          size="sm" variant="light" 
          onPress={() => setShowComments(!showComments)}
          className={showComments ? "text-secondary font-bold" : "text-default-400"}
          startContent={<span>💬</span>}
        >
          {safeComments.length}
        </Button>

        <Button 
          color="danger" variant={isLiked ? "solid" : "light"} size="sm" onPress={onLike}
          className={isLiked ? "cursor-not-allowed opacity-100" : ""}
          startContent={<span>{isLiked ? "❤️" : "🤍"}</span>}
        >
          {likes || 0}
        </Button>
      </CardFooter>
    </Card>
  );
}