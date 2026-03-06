"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FaSignInAlt, FaSignOutAlt, FaPenFancy } from "react-icons/fa"; // icons

export default function Navbar() {
  const router = useRouter();

  const isLoggedIn = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4 shadow-sm  bg-white font-sans">
      {/* Logo */}
      <div
        className="font-serif font-bold text-2xl cursor-pointer text-gray-900 transition-transform duration-300 hover:scale-105"
        onClick={() => router.push("/")}
      >
        The<span className="text-orange-500">Blog</span>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-8 items-center text-gray-700">
        <button
          onClick={() => router.push("/")}
          className="hover:text-gray-900 transition-colors duration-300"
        >
          Home
        </button>

        <button
          onClick={() => router.push("/categories")}
          className="hover:text-gray-900 transition-colors duration-300"
        >
          Categories
        </button>

        {isLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-gray-900 transition-colors duration-300 flex items-center gap-2"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/posts/create")}
              className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600 transition-all duration-300 flex items-center gap-2"
            >
              <FaPenFancy />
              Write
            </button>

            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 transition-colors duration-300 flex items-center gap-2"
            >
              <FaSignOutAlt />
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="hover:text-gray-900 transition-colors duration-300 flex items-center gap-2"
          >
            <FaSignInAlt />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}