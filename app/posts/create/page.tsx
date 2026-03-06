"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}

export default function CreatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [status, setStatus] = useState("DRAFT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  // Toggle category
  const toggleCategory = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  // Submit post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
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
        setError(data.error || "Failed to create post");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-white shadow-xl rounded-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Create New Post
      </h1>

      {error && (
        <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            placeholder="Enter post title"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Categories
          </label>

          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full cursor-pointer ${
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
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-48 resize-none"
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
            disabled={loading}
            className="flex-1 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-400 transition"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex-1 py-3 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
