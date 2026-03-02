"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}
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
  categories: Category[];
  _count: { likes: number; comments: number };
  comments: Comment[];
}

export default function EditPostPage({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const postId = Number(params?.id);

  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleCategoryChange = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Redirect if invalid postId
    if (!params?.id || isNaN(postId)) {
      router.push("/dashboard");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user
        const userRes = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) return router.push("/login");
        const userData: User = await userRes.json();
        setUser(userData);

        // Fetch categories
        const catRes = await fetch("/api/categories");
        const catData: Category[] = await catRes.json();
        setCategories(catData);

        // Fetch post
        const postRes = await fetch(`/api/posts/${postId}`);
        if (!postRes.ok) throw new Error("Post not found");
        const postData: Post = await postRes.json();
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setSelectedCategories(postData.categories.map((c) => c.id));
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id, postId, router]);

  // Only author/admin can edit
  const canEdit =
    user && post && (user.role === "ADMIN" || user.id === post.author.id);

  const handleSave = async () => {
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, categoryIds: selectedCategories }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update post");
      return;
    }

    router.push("/dashboard");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) router.push("/dashboard");
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;
  if (!post || !user) return null;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <p className="mb-4 text-gray-600">
        By {post.author.name} | Likes: {post._count.likes} | Comments:{" "}
        {post._count.comments}
      </p>

      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block mb-2 font-semibold">Title</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!canEdit}
        />

        <label className="block mb-2 font-semibold">Content</label>
        <textarea
          className="w-full border rounded px-3 py-2 mb-4 h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!canEdit}
        />

        <label className="block mb-2 font-semibold">Categories</label>
        <div className="flex flex-wrap gap-3 mb-4">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => handleCategoryChange(cat.id)}
                disabled={!canEdit}
              />
              {cat.name}
            </label>
          ))}
        </div>

        {canEdit && (
          <div className="flex gap-3">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleSave}
            >
              Save
            </button>
            {user.role === "ADMIN" && (
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        {post.comments.length === 0 ? (
          <p>No comments yet</p>
        ) : (
          <ul className="space-y-3">
            {post.comments.map((c) => (
              <li key={c.id} className="border p-3 rounded">
                <p>{c.content}</p>
                <small className="text-gray-500">By {c.user.name}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}