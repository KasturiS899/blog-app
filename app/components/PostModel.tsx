"use client";

import { useState } from "react";

interface User {
  id: number;
  name: string;
  role: string;
}

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  categories: Category[];
  _count: { likes: number; comments: number };
}

interface PostModalProps {
  post: Post;
  user: User | null;
  onClose: () => void;
}

export default function PostModal({ post, user, onClose }: PostModalProps) {
  const [likes, setLikes] = useState(post._count.likes);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const handleLike = async () => {
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          userId: user?.id ?? null,
        }),
      });

      if (!res.ok) throw new Error("Like failed");

      setLikes((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };
  const handleComment = async () => {
    if (!newComment.trim()) return;

    if (!user && !guestEmail.trim()) {
      alert("Email required for guest comments");
      return;
    }

    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          postId: post.id,
          userId: user?.id ?? null,
          email: user ? undefined : guestEmail,
        }),
      });

      const data = await res.json();

      setComments((prev) => [...prev, data.content]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      {/* modal container */}
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-lg">
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl hover:text-black"
        >
          ✕
        </button>

        {/* title */}
        <h2 className="text-2xl font-bold mb-4">{post.title}</h2>

        {/* author */}
        <p className="text-sm text-gray-500 mb-4">By {post.author.name}</p>

        {/* content */}
        <p className="text-gray-700 mb-6 whitespace-pre-line">{post.content}</p>

        {/* categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.categories.map((c) => (
            <span
              key={c.id}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm"
            >
              {c.name}
            </span>
          ))}
        </div>

        {/* like + edit */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleLike}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            ❤️ Like ({likes})
          </button>

          {user && (user.role === "ADMIN" || user.id === post.author.id) && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Edit
            </button>
          )}
        </div>

        {!user && (
          <input
            type="email"
            placeholder="Enter your email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-2"
          />
        )}
        {/* comments section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3 text-lg">
            Comments ({comments.length})
          </h3>

          {/* comment list */}
          <div className="space-y-3 mb-4">
            {comments.length === 0 && (
              <p className="text-sm text-gray-400">No comments yet</p>
            )}

            {comments.map((c, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded-md text-sm">
                {c}
              </div>
            ))}
          </div>

          {/* comment input */}
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              onClick={handleComment}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
