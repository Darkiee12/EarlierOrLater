import { BaseGameContextType } from "@/contexts";
import { BRAND_NAME } from "@/common/constants";
import { useState, useEffect } from "react";

interface LobbyProps {
  useGameContext: () => BaseGameContextType;
  gameMode?: "daily" | "freeplay";
}

const Lobby = ({ useGameContext, gameMode = "daily" }: LobbyProps) => {
  const context = useGameContext();
  const { selectEventType, gameStatus } = context;
  const isLoading = gameStatus === "loading";
  const [dotCount, setDotCount] = useState(0);
  
  const alreadyPlayed = gameMode === "daily" && 'alreadyPlayed' in context 
    ? (context as any).alreadyPlayed 
    : false;
  
  const isCheckingPlayedStatus = gameMode === "daily" && 'isCheckingPlayedStatus' in context
    ? (context as any).isCheckingPlayedStatus
    : false;
  
  const loadSavedResult = gameMode === "daily" && 'loadSavedResult' in context
    ? (context as any).loadSavedResult
    : undefined;

  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingText = gameMode === "daily" 
    ? "Getting events happening today" 
    : "Getting random events";
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-center mb-2">Welcome to {BRAND_NAME}!</h2>
      <p className="text-lg mt-2 text-gray-700 dark:text-gray-300 text-center max-w-2xl">
        Test your history knowledge with today&apos;s events! Can you guess which historical moment came first?
      </p>
      {alreadyPlayed && (
        <div className="mt-4 px-6 py-3 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-xl text-center max-w-2xl">
          <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            ✅ You&apos;ve already completed today&apos;s challenge!
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Come back tomorrow for a new challenge, or play again to review your results.
          </p>
        </div>
      )}
      <p className="text-xl mt-4 font-semibold">Select a category to start the game:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl px-4">
        <button
          className="mt-4 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          type="button"
          onClick={async () => {
            if (isCheckingPlayedStatus) return;
            
            if (alreadyPlayed && loadSavedResult) {
              try {
                await loadSavedResult();
              } catch (error) {
                console.error("Error loading saved result:", error);
              }
            } else {
              selectEventType("event");
            }
          }}
          disabled={isLoading || isCheckingPlayedStatus}
        >
          📜 Historical Events
        </button>
        <button
          className="mt-4 px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg shadow-lg opacity-50 cursor-not-allowed flex flex-col items-center gap-1"
          type="button"
          disabled
        >
          <span>👶 Births</span>
          <span className="text-xs italic font-normal">Coming soon</span>
        </button>
        <button
          className="mt-4 px-6 py-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg opacity-50 cursor-not-allowed flex flex-col items-center gap-1"
          type="button"
          disabled
        >
          <span>🕊️ Deaths</span>
          <span className="text-xs italic font-normal">Coming soon</span>
        </button>
      </div>
      <div className="mt-6 h-8 flex items-center justify-center">
        {isLoading && (
          <p className="text-gray-600 dark:text-gray-400">
            <span className="animate-pulse font-bold">{loadingText}</span>
            <span className="inline-block w-8 text-left">{".".repeat(dotCount)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Lobby;