"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  role: string;
}

interface Comment {
  id: number;
  content: string;
  user: User;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  categories: { id: number; name: string }[];
  _count: { likes: number; comments: number };
  comments: Comment[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        // Get logged-in user
        const userRes = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) return router.push("/login");
        const userData: User = await userRes.json();
        setUser(userData);

        // Get posts
        const postRes = await fetch("/api/posts");
        const postData: Post[] = await postRes.json();
        setPosts(postData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setPosts(posts.filter((p) => p.id !== id));
  };

  const handleLike = async (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Already liked");
        return;
      }

      // Update likes locally
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, _count: { ...p._count, likes: p._count.likes + 1 } }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    const content = commentInputs[postId];
    if (!content) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: user.id, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to comment");
        return;
      }

      const newComment = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...p.comments, newComment],
                _count: { ...p._count, comments: p._count.comments + 1 },
              }
            : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={() => router.push("/posts/create")}
        >
          Create Post
        </button>
      </div>

      {user && (
        <p className="mb-6 text-gray-700">
          Welcome, {user.name} ({user.role})
        </p>
      )}

      {posts.map((post) => (
        <div key={post.id} className="border p-6 rounded-lg shadow mb-6 bg-white">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="my-2">{post.content}</p>
          <p className="text-sm text-gray-500 mb-2">
            By {post.author.name} | Likes: {post._count.likes} | Comments: {post._count.comments}
          </p>

          <div className="flex gap-2 mb-3">
            {/* Edit button only for author/admin */}
            {(user?.role === "ADMIN" || user?.id === post.author.id) && (
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => router.push(`/posts/edit/${post.id}`)}
              >
                Edit
              </button>
            )}

            {/* Delete button only for author/admin */}
            {(user?.role === "ADMIN" || user?.id === post.author.id) && (
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            )}

            {/* Like button for everyone */}
            <button
              className="px-3 py-1 bg-green-600 text-white rounded"
              onClick={() => handleLike(post.id)}
            >
              Like
            </button>
          </div>

          {/* Comments section */}
          <div className="mt-2">
            {post.comments.map((c) => (
              <div key={c.id} className="border p-2 rounded mb-1">
                <p>{c.content}</p>
                <small className="text-gray-500">By {c.user.name}</small>
              </div>
            ))}

            {/* Add comment input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="flex-1 border rounded px-2 py-1"
                placeholder="Add a comment"
                value={commentInputs[post.id] || ""}
                onChange={(e) => handleCommentChange(post.id, e.target.value)}
              />
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => handleCommentSubmit(post.id)}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}