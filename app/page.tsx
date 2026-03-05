"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import PostModal from "./components/PostModel";

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

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);
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

      {/* HERO */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/heroimg.jfif"
            className="h-full w-full object-cover"
          />

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
        </div>

        <div className="relative z-10 text-center text-white max-w-3xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Stories & Ideas
          </h1>

          <p className="text-lg text-gray-200">
            Discover thoughtful articles on technology, design, business, and
            life.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="max-w-6xl mx-auto px-4 pt-10">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search articles by title or content..."
            className="w-full rounded-lg border px-5 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === null
                ? "bg-orange-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* POSTS */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500 py-20">
            No posts yet. Be the first to write!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  setSelectedPost(post);
                  setShowModal(true);
                }}
                className="cursor-pointer bg-white rounded-xl border shadow-sm hover:shadow-lg transition p-6"
              >
                <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content.slice(0, 120)}...
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((c) => (
                    <span
                      key={c.id}
                      className="bg-gray-100 text-xs px-3 py-1 rounded-full"
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
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/posts/edit/${post.id}`);
                      }}
                    >
                      Edit
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </section>
      {showModal && selectedPost && (
        <PostModal
          post={selectedPost}
          user={user}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
