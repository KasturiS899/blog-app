"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function Navbar() {
  const router = useRouter();

  const isLoggedIn = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    router.refresh(); // force re-render
  };

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <div
        className="font-bold text-xl cursor-pointer"
        onClick={() => router.push("/")}
      >
        TheBlog
      </div>

      <div className="flex gap-4 items-center">
        <button onClick={() => router.push("/")}>Home</button>
        <button onClick={() => router.push("/categories")}>
          Categories
        </button>

        {isLoggedIn ? (
          <>
            <button onClick={() => router.push("/dashboard")}>
              Dashboard
            </button>

            <button onClick={() => router.push("/posts/create")}>
              Create Post
            </button>

            <button onClick={logout} className="text-red-600">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => router.push("/login")}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}