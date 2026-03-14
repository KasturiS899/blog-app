"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  "Write what should never be forgotten.",
  "Every great story starts with a small idea.",
  "Your words can inspire thousands.",
  "Turn thoughts into timeless stories.",
  "A blog is a voice that never fades.",
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  // typing quote effect
  useEffect(() => {
    const currentQuote = quotes[quoteIndex];

    if (charIndex < currentQuote.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentQuote[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 40);

      return () => clearTimeout(timeout);
    } else {
      const wait = setTimeout(() => {
        setDisplayedText("");
        setCharIndex(0);
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
      }, 1500);

      return () => clearTimeout(wait);
    }
  }, [charIndex, quoteIndex]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-50 relative overflow-hidden px-4">
      {/* floating blobs */}
      <div className="absolute w-96 h-96 bg-orange-400/30 blur-3xl rounded-full -top-20 -left-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-yellow-300/30 blur-3xl rounded-full bottom-0 right-0 animate-pulse"></div>

      {/* CARD */}
      <div className="w-full max-w-[1000px] h-[520px] bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl flex overflow-hidden">
        {/* LEFT FORM */}
        <div className="w-full md:w-[45%] p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-orange-600 mb-6">BlogApp</h1>

          <div className="relative h-[300px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full"
                >
                  <h2 className="text-xl font-semibold mb-4">Welcome back</h2>

                  <input
                    placeholder="Email"
                  className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:border-orange-400 outline-none"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:border-orange-400 outline-none"
                  />

                  <button className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition">
                    Login
                  </button>

                  <p className="text-sm text-gray-500 mt-6 text-center">
                    No account?{" "}
                    <span
                      onClick={() => setIsLogin(false)}
                      className="text-orange-600 font-semibold cursor-pointer hover:underline"
                    >
                      Sign up
                    </span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full"
                >
                  <h2 className="text-xl font-semibold mb-4">Create account</h2>

                  <input
                    placeholder="Name"
                  className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:border-orange-400 outline-none"
                  />

                  <input
                    placeholder="Email"
                     className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:border-orange-400 outline-none"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:border-orange-400 outline-none"
                  />

                  <button className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition">
                    Register
                  </button>

                  <p className="text-sm text-gray-500 mt-6 text-center">
                    Already have an account?{" "}
                    <span
                      onClick={() => setIsLogin(true)}
                      className="text-orange-600 font-semibold cursor-pointer hover:underline"
                    >
                      Login
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT QUOTES */}
        <div className="hidden md:flex w-[55%] bg-gradient-to-br from-orange-400 to-amber-400 text-white items-center justify-center p-10">
          <div className="h-[200px] flex flex-col justify-center">
            <h2 className="text-3xl font-serif text-center leading-relaxed min-h-[120px]">
              {displayedText}
              <span className="animate-pulse">|</span>
            </h2>

            <p className="mt-6 text-white/80 text-center">
              Share your ideas with the world ✍️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
