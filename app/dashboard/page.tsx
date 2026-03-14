"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiOutlinePencil } from "react-icons/hi";
import Skeleton from "../components/Skeleton";
import { IoCreateOutline } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  role: string;
}

interface Post {
  id: number;
  title: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  categories: { id: number; name: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/auth");

    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) return router.push("/auth");

        const userData: User = await userRes.json();
        setUser(userData);

        const postRes = await fetch("/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });

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

    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-6">
        {/* Header stays visible */}
        <div className="flex items-start justify-between m-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="mt-6 text-gray-300">Welcome...</p>
            <p className="text-sm text-gray-200">Role...</p>
          </div>

          <div className="w-28 h-9 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* Skeleton Posts */}
        <div className="space-y-4">
          <Skeleton type="dashboardPost" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="flex items-start justify-between m-8">
        <div>
          <h1 className="text-4xl font-serif font-bold font-bold text-gray-900">
            Dashboard
          </h1>

          {user && (
            <>
              <p className="mt-6 text-gray-700">Welcome, {user.name}</p>
              <p className="text-sm text-gray-500 ">
                Role <span className="text-orange-500">{user.role}</span>
              </p>
            </>
          )}
        </div>

        <button
          onClick={() => router.push("/posts/create")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <HiOutlinePencil size={16} />
          New Post
        </button>
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative flex justify-between items-center border border-gray-200 rounded-lg p-6 min-h-[110px] bg-white hover:shadow-sm transition"
          >
            {/* Floating Badge */}
            <div className="absolute top-0 right-0 overflow-hidden w-24 h-24">
              <div className="absolute top-0 right-0 overflow-hidden w-28 h-28">
                <span
                  className={`absolute top-5 right-[-40px] w-[140px] text-center rotate-45 text-xs font-semibold py-1 shadow ${
                    post.status === "PUBLISHED"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            {/* Left */}
            <div>
              <h2 className="font-semibold text-gray-900">{post.title}</h2>

              <p className="text-sm text-gray-500 mt-1">
                {post.categories?.map((cat, index) => (
                  <span key={cat.id}>
                    {cat.name}
                    {index !== post.categories.length - 1 && ", "}
                  </span>
                ))}{" "}
                · {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-8 text-gray-600 mr-10">
              <button
                onClick={() => router.push(`/posts/edit/${post.id}`)}
                className="hover:text-blue-300 text-blue-600"
              >
                <FaEdit size={18} />
              </button>

              <button
                onClick={() => handleDelete(post.id)}
                className="hover:text-red-300 text-red-600"
              >
                <RiDeleteBin6Line size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
