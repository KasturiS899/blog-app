"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Comment {
  id: number;
  content: string;
  author?: User;
  guestName?: string;
  guestEmail?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  comments: Comment[];
  _count: { likes: number };
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchPost = async () => {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      setPost(data);
    };

    const fetchUser = async () => {
      if (!token) return;
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUser(await res.json());
    };

    fetchPost();
    fetchUser();
  }, [postId]);

  const handleLike = async () => {
    await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
    });

    setPost((prev) =>
      prev
        ? { ...prev, _count: { likes: prev._count.likes + 1 } }
        : prev
    );
  };

  const handleComment = async () => {
    const body = user
      ? { content: commentText }
      : { content: commentText, guestName, guestEmail };

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const newComment = await res.json();
      setPost((prev) =>
        prev
          ? { ...prev, comments: [...prev.comments, newComment] }
          : prev
      );
      setCommentText("");
      setGuestName("");
      setGuestEmail("");
    }
  };

  if (!post) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6">{post?.title}</h1>

      <p className="text-gray-600 mb-6">
        By {post.author.name} • {post?._count?.likes} Likes
      </p>

      <p className="mb-10">{post?.content}</p>

      <button
        onClick={handleLike}
        className="bg-orange-600 text-white px-4 py-2 rounded mb-10"
      >
        ❤️ Like
      </button>

      <h2 className="text-2xl font-semibold mb-4">Comments</h2>

      {post?.comments?.map((c) => (
        <div key={c.id} className="border p-4 mb-3 rounded">
          <p className="text-sm text-gray-500">
            {c.author?.name || c.guestName}
          </p>
          <p>{c.content}</p>
        </div>
      ))}

      <div className="mt-8">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your comment..."
          className="w-full border p-3 rounded mb-3"
        />

        {!user && (
          <>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your Name"
              className="w-full border p-3 rounded mb-3"
            />
            <input
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full border p-3 rounded mb-3"
            />
          </>
        )}

        <button
          onClick={handleComment}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Comment
        </button>
      </div>
    </div>
  );
}