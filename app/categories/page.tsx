"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowRight, FiFolder } from "react-icons/fi";
import Skeleton from "../components/Skeleton";

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  categories: Category[];
}

export default function CategoriesPage() {
  const router = useRouter();

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


  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Heading always visible */}
      <h1 className="text-4xl font-serif font-bold mb-12 text-left">
        Categories
      </h1>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton type="categorydiv" count={6} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              onClick={() => router.push(`/?category=${cat.id}`)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group border border-gray-200 rounded-xl p-6 cursor-pointer 
              hover:border-orange-500 hover:shadow-xl 
              transition-all duration-300 flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div whileHover={{ rotate: 10, scale: 1.2 }}>
                    <FiFolder className="text-orange-500 text-xl" />
                  </motion.div>

                  <h2 className="text-xl font-semibold group-hover:text-orange-600">
                    {cat.name}
                  </h2>
                </div>

                <p className="text-gray-600 mb-4">
                  Explore posts related to {cat.name}.
                </p>

                <p className="text-sm text-gray-400">
                  {
                    posts.filter((p) =>
                      p.categories.some((c) => c.id === cat.id),
                    ).length
                  }{" "}
                  posts
                </p>
              </div>

              <motion.div className="ml-4" whileHover={{ x: 5 }}>
                <FiArrowRight className="text-gray-400 text-xl group-hover:text-orange-500" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
