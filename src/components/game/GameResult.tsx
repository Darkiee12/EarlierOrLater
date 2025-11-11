"use client";
import { BaseGameContextType } from "@/contexts";
import { ShareService } from "@/services/client/game";
import { useState, useCallback, useMemo } from "react";
import { FaShare, FaCheck } from "react-icons/fa";
import Toast from "@/components/general/Toast";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";
import Option from "@/lib/rust_prelude/option";
import DotsProgress from "@/components/general/DotProgress";

import Carousel from "./Carousel";

interface GameResultProps {
  useGameContext?: () => BaseGameContextType;
  showStreak?: boolean;
  currentStreak?: number;
  bestStreak?: number;
  gameDate?: string;
  savedPoints?: number;
  savedEvents?: DetailedEventType[];
  savedAnswers?: boolean[];
}

const GameResult = ({ 
  useGameContext, 
  showStreak = false, 
  currentStreak = 0, 
  bestStreak = 0,
  gameDate,
  savedPoints,
  savedEvents,
  savedAnswers 
}: GameResultProps) => {
  const contextData = useGameContext?.();
  const points = savedPoints ?? contextData?.points ?? 0;
  const allEvents = useMemo(() => 
    savedEvents ?? (contextData ? Array.from(contextData.detailedEvents.values()) : []),
    [savedEvents, contextData]
  );
  const answersFromContext = contextData?.answers;
  const answersForShare = useMemo(() => 
    savedAnswers 
      ? savedAnswers.map(a => Option.Some(a))
      : answersFromContext ?? [],
    [savedAnswers, answersFromContext]
  );
  
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    const success = await ShareService.shareResults(
      answersForShare,
      points,
      showStreak ? currentStreak : undefined,
      gameDate
    );
    
    if (success) {
      setCopied(true);
    }
    setIsSharing(false);
  }, [answersForShare, points, currentStreak, showStreak, gameDate, isSharing]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold pt-5">Game Over!</h2>
      <p className="text-xl py-1">Your final score is: {points}</p>
      
      <div className={`grid ${showStreak ? 'grid-cols-4' : 'grid-cols-2'} gap-x-6 gap-y-2 my-4 justify-items-center`}>
        {showStreak && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
          </>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">Result</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Share</p>
        
        {showStreak && (
          <>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                🔥 {currentStreak}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                🏆 {bestStreak}
              </p>
            </div>
          </>
        )}
        
        <div className="flex items-center">
          <DotsProgress
            statuses={answersForShare}
            currentIndex={-1}
          />
        </div>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className={`w-12 h-12 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center ${
            copied
              ? "bg-green-600 dark:bg-green-500"
              : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Share results"
        >
          {copied ? <FaCheck size={20} /> : <FaShare size={20} />}
        </button>
      </div>
      <p className="mt-2">Review the events from this game!</p>
      <div className="h-full max-w-[600px] flex items-center justify-center">
      <Carousel slides={allEvents}/>    
      </div>

      <Toast
        message="Copied results to clipboard!"
        isVisible={copied}
        onClose={() => setCopied(false)}
      />
    </div>
  );
};

export default GameResult;
