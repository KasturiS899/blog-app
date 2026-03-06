"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}
interface User {
  id: number;
  name: string;
  role: string;
}
interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  categories: Category[];
  status: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
        // Fetch post
        const postRes = await fetch(`/api/posts/${postId}`);
        if (!postRes.ok) throw new Error("Post not found");
        const postData: Post = await postRes.json();
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setStatus(postData.status);
        setSelectedCategories(postData.categories.map((c) => c.id) || []);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, router]);

  const toggleCategory = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const canEdit =
    user && post && (user.role === "ADMIN" || user.id === post.author.id);

  const handleSave = async () => {
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          categoryIds: selectedCategories,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update post");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;
  if (!post || !user || !canEdit)
    return <p className="text-center mt-20">You cannot edit this post.</p>;

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Edit Post
      </h1>

      {error && (
        <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            placeholder="Enter post title"
            className="w-full px-4 py-2 border border-gray-200  rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-2 px-3 py-1 border border-gray-200  rounded-full cursor-pointer ${
                  selectedCategories.includes(cat.id)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Content
          </label>
          <textarea
            placeholder="Write your content here..."
            className="w-full px-4 py-3 border border-gray-200  rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-48 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* Status */}
        {/* Publish Toggle */}
        <div className="flex items-center justify-left  p-4">
          <span className="text-gray-700 font-medium pr-4">
            Publish Immediately
          </span>

          <button
            type="button"
            onClick={() =>
              setStatus(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")
            }
            className={`relative w-14 h-7 flex items-center rounded-full transition ${
              status === "PUBLISHED" ? "bg-orange-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                status === "PUBLISHED" ? "translate-x-7" : ""
              }`}
            />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Update Post
          </button>

          <button
            type="button"
            className="flex-1 border border-gray-200 rounded-lg hover:bg-gray-100"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
