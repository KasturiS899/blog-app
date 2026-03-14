"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { FaSignInAlt, FaSignOutAlt, FaPenFancy } from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    // router.push("/login");
    router.push("/auth");
    router.refresh();
  };

  const linkStyle = (path: string) =>
    `relative cursor-pointer transition-colors duration-300
     ${
       pathname === path
         ? "text-gray-900 font-semibold"
         : "text-gray-600 hover:text-gray-900"
     }
     after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-orange-500
     after:transition-all after:duration-300
     ${pathname === path ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

  return (
    <nav
      className="sticky top-0 z-50 flex justify-between items-center px-10 py-4 
    bg-white/80 backdrop-blur-md shadow-sm  font-sans"
    >
      {/* Logo */}
      <div
        className="font-serif font-bold text-2xl cursor-pointer text-gray-900 transition-transform duration-300 hover:scale-105"
        onClick={() => router.push("/")}
      >
        The<span className="text-orange-500">Blog</span>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-8 items-center">
        <button onClick={() => router.push("/")} className={linkStyle("/")}>
          Home
        </button>

        <button
          onClick={() => router.push("/categories")}
          className={linkStyle("/categories")}
        >
          Categories
        </button>

        {isLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              className={linkStyle("/dashboard")}
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/posts/create")}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
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
            //onClick={() => router.push("/login")}
            onClick={() => router.push("/auth")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <FaSignInAlt />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
