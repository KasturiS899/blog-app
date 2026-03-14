"use client";

import { useState, useEffect } from "react";
import Skeleton from "./Skeleton";

interface User {
  id: number;
  name: string;
  role: string;
}

interface Category {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  content: string;
  guestEmail?: string;
  user?: { name: string };
}

interface Post {
  id: number;
  imageUrl?: string;
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
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: Comment) => void;
}

export default function PostModal({
  post,
  user,
  onClose,
  onLike,
  onComment,
}: PostModalProps) {
  const [likes, setLikes] = useState(post._count.likes);
  const [newComment, setNewComment] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3); // show first 3 comments
  const [liked, setLiked] = useState(false);
  const handleLike = async () => {
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          userId: user?.id ?? null,
          guestId: user ? null : guestId,
        }),
      });

      const data = await res.json();

      if (data.liked) {
        setLikes((prev) => prev + 1);
        setLiked(true);
      } else {
        setLikes((prev) => prev - 1);
        setLiked(false);
      }
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
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          postId: post.id,
          userId: user?.id ?? null,
          email: user ? undefined : guestEmail,
        }),
      });
      const data = await res.json();
      setComments((prev) => [...prev, data]);
      setNewComment("");
      onComment(post.id, data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/comments?postId=${post.id}`);
        const data: Comment[] = await res.json();
        setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [post.id]);

  const toggleShowMore = () => {
    if (visibleCount >= comments.length) {
      setVisibleCount(3);
    } else {
      setVisibleCount(comments.length);
    }
  };
  const guestId =
    typeof window !== "undefined"
      ? localStorage.getItem("guestId") ||
        (() => {
          const id = crypto.randomUUID();
          localStorage.setItem("guestId", id);
          return id;
        })()
      : null;
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-lg">
        {/* HEADER */}
        <div className="sticky top-0 bg-white z-10  px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{post.title}</h2>

          <div className="flex items-center gap-3">
            {user && (user.role === "ADMIN" || user.id === post.author.id) && (
              <button className="text-gray-600 hover:text-blue-600 text-lg">
                ✏️
              </button>
            )}

            <button
              onClick={onClose}
              className="text-gray-500 text-xl hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* IMAGE */}
          {post.imageUrl && (
            <div className="w-full flex justify-center mb-6 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="max-h-[500px] w-auto object-contain"
              />
            </div>
          )}

          {/* AUTHOR */}
          <p className="text-sm text-gray-500 mb-4">By {post.author.name}</p>

          {/* CONTENT */}
          <p className="text-gray-700 mb-6 whitespace-pre-line">
            {post.content}
          </p>

          {/* CATEGORIES */}
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

          {/* LIKE + COMMENT COUNT */}
          <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-red-600"
            >
              <span className="text-lg">{liked ? "❤️" : "🤍"}</span>
              {likes}
            </button>
            <span>💬 {comments.length}</span>
          </div>

          {/* COMMENTS */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-lg">Comments</h3>

            {loadingComments ? (
              <Skeleton type="comment" count={3} />
            ) : (
              comments.slice(0, visibleCount).map((c) => (
                <div key={c.id} className="bg-gray-100 p-3 rounded-md text-sm">
                  <p className="font-semibold">
                    {c.user?.name ?? c.guestEmail ?? "Guest"}
                  </p>
                  <p>{c.content}</p>
                </div>
              ))
            )}

            {comments.length > 3 && !loadingComments && (
              <button
                className="text-sm text-orange-600 hover:underline"
                onClick={toggleShowMore}
              >
                {visibleCount >= comments.length ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        </div>

        {/* FOOTER COMMENT INPUT */}
        <div className=" px-6 py-4 bg-white">
          {!user && (
            <input
              type="email"
              placeholder="Enter your email to post a comment"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className=" rounded  border border-gray-200 px-3 py-2 w-full mb-2 outline-none focus:ring-1 focus:ring-orange-500"
            />
          )}

          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-200 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
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
