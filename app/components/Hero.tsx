// components/Hero.tsx
export default function Hero() {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/heroimg.jfif"
          className="h-full w-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />

        {/* White fade bottom */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-b from-transparent to-white"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-3xl px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Stories & Ideas
        </h1>

        <p className="text-lg text-gray-200">
          Discover thoughtful articles on technology, design, business, and life.
        </p>
      </div>
    </section>
  );
}