"use client";
import Link from "next/link";

const FreePage = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full h-full max-w-[1200px] px-4 flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold text-center mb-8">
          Free to play mode
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[800px]">
          {/* Classic Mode Card */}
          <Link
            href="/free/classic"
            className="group relative overflow-hidden rounded-lg border-2 border-blue-500 bg-white p-8 transition-all hover:border-blue-600 hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl text-black font-bold mb-3">Classic Mode</h2>
              <p className="text-black">
                Play through a set of random historical events. No time limit, just pure knowledge testing!
              </p>
              <div className="mt-4 text-sm text-blue-500 group-hover:text-blue-600 font-semibold">
                Play Classic →
              </div>
            </div>
          </Link>

          {/* Time Mode Card */}
          <Link
            href="/free/time"
            className="group relative overflow-hidden rounded-lg border-2 border-red-500 bg-white p-8 transition-all hover:border-red-600 hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl mb-4">⏱️</div>
              <h2 className="text-2xl text-black font-bold mb-3">Time Mode</h2>
              <p className="text-black">
                Race against the clock! Answer as many questions as you can in 60 seconds.
              </p>
              <div className="mt-4 text-sm text-red-500 group-hover:text-red-600 font-semibold">
                Play Time Mode →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FreePage;
