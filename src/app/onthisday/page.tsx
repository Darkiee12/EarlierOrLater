"use client";
import GameResult from "@/components/game/GameResult";
import { DailyGameProvider, useDailyGame } from "@/contexts";
import Lobby from "@/components/game/Lobby";
import GameInnerPanel from "@/components/game/GameInnerPanel";
import { useMemo } from "react";

const GamePanelContent = () => {
  const { gameStatus, currentStreak, bestStreak, month, date, showSavedResult, savedGameData } = useDailyGame();
  
  const gameDate = useMemo(() => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[month - 1]} ${date}`;
  }, [month, date]);

  return (
    <div className="w-full h-full">
      {!showSavedResult && (gameStatus === "lobby" || gameStatus === "loading") && <Lobby useGameContext={useDailyGame} gameMode="daily" />}
      {!showSavedResult && gameStatus === "ongoing" && <GameInnerPanel useGameContext={useDailyGame} />}
      {(gameStatus === "finished" || showSavedResult) && (
        <GameResult 
          useGameContext={showSavedResult ? undefined : useDailyGame}
          savedPoints={showSavedResult && savedGameData ? savedGameData.points : undefined}
          savedEvents={showSavedResult && savedGameData ? savedGameData.events : undefined}
          savedAnswers={showSavedResult && savedGameData ? savedGameData.answers : undefined}
          showStreak={true}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          gameDate={gameDate}
        />
      )}
    </div>
  );
};

const DailyPage = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full h-full max-w-[1200px] px-4">
        <DailyGameProvider>
          <GamePanelContent />
        </DailyGameProvider>
      </div>
    </div>
  );
};

export default DailyPage;

