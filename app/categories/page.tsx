"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  categories: Category[];
  _count?: { likes?: number; comments?: number }; // optional if you want likes/comments
}

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // const filteredPosts = categoryId
  //   ? posts.filter((p) => p.categories.some((c) => c.id === Number(categoryId)))
  //   : posts;

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-12 text-center">Categories</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => router.push(`/?category=${cat.id}`)}
              className="border rounded-lg p-6 cursor-pointer hover:border-orange-500 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{cat.name}</h2>

              <p className="text-gray-600 mb-4">
                Explore posts related to {cat.name}.
              </p>

              <p className="text-sm text-gray-400">
                {
                  posts.filter((p) => p.categories.some((c) => c.id === cat.id))
                    .length
                }{" "}
                posts
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
