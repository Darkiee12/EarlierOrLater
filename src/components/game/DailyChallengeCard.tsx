import Link from "next/link";
import { DailyChallengeTimer } from "@/components/game/DailyChallengeTimer";


export const DailyChallengeCard = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    month: "long", 
    day: "numeric", 
    year: "numeric" 
  };
  const dateStr = now.toLocaleDateString("en-US", options);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const fallbackTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  return (
    <Link
      href="/onthisday"
      className="group relative overflow-hidden rounded-2xl border-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-8 hover:scale-105 transition-transform duration-200 ease-in-out shadow-lg hover:shadow-xl"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-3xl font-bold mb-2 text-blue-700 dark:text-blue-200">
          Daily Challenge
        </h2>
        <div className="text-white text-sm font-semibold mt-1">
          {dateStr}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Play with events that happened on this date in history
        </p>
        <noscript>
          <div className="text-white font-mono text-sm mt-2">
            {fallbackTime} left
          </div>
        </noscript>
        <DailyChallengeTimer />
      </div>
    </Link>
  );
};
