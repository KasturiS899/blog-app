"use client";

import { useState } from "react";

export default function LikeButton({ postId, initialLikes }: { postId: number; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId }),
    });
    setLikes(likes + 1);
  };

  return <button onClick={handleLike}>Like ({likes})</button>;
}