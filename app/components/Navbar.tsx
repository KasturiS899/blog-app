"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <div
        className="font-bold text-xl cursor-pointer"
        onClick={() => router.push("/")}
      >
        TheBlog
      </div>
      <div className="flex gap-4">
        <button onClick={() => router.push("/")}>Home</button>
        <button onClick={() => router.push("/categories")}>Categories</button>
        {token ? (
          <>
            <button onClick={() => router.push("/posts/create")}>
              Create Post
            </button>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={() => router.push("/login")}>Sign In</button>
        )}
      </div>
    </nav>
  );
}
