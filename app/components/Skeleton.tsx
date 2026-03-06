// components/Skeleton.tsx
"use client";

interface SkeletonProps {
  type?: "comment" | "post" | "category" | "categorydiv" | "dashboardPost";
  count?: number;
}

export default function Skeleton({
  type = "comment",
  count = 3,
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {/* COMMENT SKELETON */}
          {type === "comment" && (
            <div className="flex items-center mt-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full me-3"></div>

              <div className="flex-1 space-y-2">
                <div className="h-2.5 bg-gray-300 rounded-full w-32"></div>
                <div className="h-2 bg-gray-300 rounded-full w-48"></div>
              </div>
            </div>
          )}

          {/* POST CARD SKELETON */}
          {type === "post" && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>

              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                <div className="h-3 bg-gray-300 rounded w-4/6"></div>
              </div>

              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
                <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
              </div>

              <div className="h-3 bg-gray-300 rounded w-40"></div>
            </div>
          )}

          {/* CATEGORY SKELETON */}
          {type === "category" && (
            <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
          )}
          {type === "categorydiv" && (
            <div className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>

              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              </div>

              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          )}

          {/* Dashboard SKELETON */}
          {type === "dashboardPost" && (
            <div className="relative flex justify-between items-center border border-gray-200 rounded-lg p-6 min-h-[110px] bg-white">
              {/* Left */}
              <div className="space-y-3 w-1/2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>

              {/* Right icons */}
              <div className="flex items-center gap-8">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
