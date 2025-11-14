"use client";
import { useTimeModeGame } from "@/contexts";
import { useMemo } from "react";

const TimeModeTimer = () => {
  const { timeRemaining, totalTime } = useTimeModeGame();

  const percentage = useMemo(() => {
    return (timeRemaining / totalTime) * 100;
  }, [timeRemaining, totalTime]);

  const timerColor = useMemo(() => {
    if (percentage > 50) return "text-green-500";
    if (percentage > 20) return "text-yellow-500";
    return "text-red-500";
  }, [percentage]);

  const barColor = useMemo(() => {
    if (percentage > 50) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  }, [percentage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full py-2">
      <div className="flex justify-center items-center mb-2">
        <div className={`text-4xl font-bold ${timerColor} transition-colors duration-300`}>
          {formatTime(timeRemaining)}
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300 ease-linear`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default TimeModeTimer;
