"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostModal from "./PostModel";
import Skeleton from "./Skeleton";
import { FiEdit, FiSearch } from "react-icons/fi";

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

export default function PostSection() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
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

  const filteredPosts = posts
    .filter((p) =>
      selectedCategory
        ? p.categories.some((c) => c.id === selectedCategory)
        : true,
    )
    .filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()),
    );

  if (loading) {
    return (
      <>
        {/* SEARCH */}
        <section className="max-w-6xl mx-auto px-4 pt-10">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse max-w-xl mx-auto"></div>
        </section>

        {/* CATEGORY SKELETON */}
        <section className="max-w-8xl mx-auto px-4 py-8">
          <div className="flex gap-3 justify-center flex-wrap">
            <Skeleton type="category" count={8} />
          </div>
        </section>

        {/* POST GRID SKELETON */}
        <section className="max-w-8xl mx-auto px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton type="post" count={6} />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* SEARCH */}
      <section className="max-w-7xl mx-auto px-4 pt-10">
        <div className="relative max-w-xl mx-auto">
          {/* Search Icon */}
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-100 rounded-lg pl-12 pr-5 py-2 shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-8">
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
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No posts found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  setSelectedPost(post);
                  setShowModal(true);
                }}
                className=" relative cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6"
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
                      className="absolute top-3 right-3 text-gray-400 hover:text-orange-600 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/posts/edit/${post.id}`);
                      }}
                    >
                      <FiEdit size={18} />
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
          onLike={(postId) => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === postId
                  ? { ...p, _count: { ...p._count, likes: p._count.likes + 1 } }
                  : p,
              ),
            );
          }}
          onComment={() => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === selectedPost.id
                  ? {
                      ...p,
                      _count: { ...p._count, comments: p._count.comments + 1 },
                    }
                  : p,
              ),
            );
          }}
        />
      )}
    </>
  );
}
