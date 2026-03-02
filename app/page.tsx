"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";

interface User {
  id: number;
  name: string;
  role: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  categories: Category[];
  _count: { likes: number; comments: number };
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        if (token) {
          const userRes = await fetch("/api/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) setUser(await userRes.json());
        }

        const catRes = await fetch("/api/categories");
        if (catRes.ok) setCategories(await catRes.json());

        const postRes = await fetch("/api/posts");
        if (postRes.ok) setPosts(await postRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.categories.some((c) => c.id === selectedCategory))
    : posts;

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative h-[420px] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: "url('/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-3xl px-4">
          <h1 className="text-5xl font-bold mb-4">Stories & Ideas</h1>
          <p className="text-lg text-gray-200 mb-6">
            Discover thoughtful articles on technology, design, business, and
            life.
          </p>

          <input
            type="text"
            placeholder="Search articles by title or content..."
            className="w-full px-5 py-3 rounded-md text-black"
          />
        </div>
      </section>

      {/* CATEGORY PILLS */}
      <div className="max-w-6xl mx-auto px-4 mt-8 flex gap-3 flex-wrap justify-center">
        <button
          className={`px-4 py-2 rounded-full text-sm ${
            selectedCategory === null
              ? "bg-orange-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === cat.id
                ? "bg-orange-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* POSTS SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500">
            No posts yet. Be the first to write!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/posts/${post.id}`)}
                className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transition p-6 border"
              >
                <h2 className="text-xl font-semibold mb-3">{post.title}</h2>

                <p className="text-gray-600 mb-4">
                  {post.content.slice(0, 120)}...
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((c) => (
                    <span
                      key={c.id}
                      className="bg-gray-100 text-sm px-3 py-1 rounded-full"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-500">
                  By {post.author.name} • {post._count.likes} Likes •{" "}
                  {post._count.comments} Comments
                </div>

                {user &&
                  (user.role === "ADMIN" || user.id === post.author.id) && (
                    <button
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      onClick={() => router.push(`/posts/edit/${post.id}`)}
                    >
                      Edit
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
