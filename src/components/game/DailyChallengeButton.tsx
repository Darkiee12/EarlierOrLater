"use client";
import Link from "next/link";
import { useState, useEffect, memo } from "react";

const DailyTimer = memo(() => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-white font-mono text-sm mt-2">
      {timeLeft} left
    </div>
  );
});

DailyTimer.displayName = "DailyTimer";

const TodayDate = memo(() => {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    };
    setDateStr(now.toLocaleDateString("en-US", options));
  }, []);

  return (
    <div className="text-white text-sm font-semibold mt-1">
      {dateStr}
    </div>
  );
});

TodayDate.displayName = "TodayDate";

export const DailyChallengeButton = () => {
  return (
    <Link
      href="/onthisdate"
      className="group relative overflow-hidden rounded-2xl border-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-8 hover:scale-105 transition-transform duration-200 ease-in-out shadow-lg hover:shadow-xl"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-3xl font-bold mb-2 text-blue-700 dark:text-blue-200">
          Daily Challenge
        </h2>
        <TodayDate />
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Play with events that happened on this date in history
        </p>
        <DailyTimer />
      </div>
    </Link>
  );
};
