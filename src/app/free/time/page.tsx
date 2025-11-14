"use client";
import GameResult from "@/components/game/GameResult";
import { TimeModeGameProvider, useTimeModeGame } from "@/contexts";
import Lobby from "@/components/game/Lobby";
import GameInnerPanel from "@/components/game/GameInnerPanel";
import { TimeModeTimer } from "@/components/game";

const GamePanelContent = () => {
  const { gameStatus } = useTimeModeGame();
  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {(gameStatus === "lobby" || gameStatus === "loading") && (
        <Lobby useGameContext={useTimeModeGame} gameMode="freeplay" />
      )}
      {gameStatus === "ongoing" && (
        <div className="w-full h-full flex flex-col min-h-0">
          <div className="flex-shrink-0">
            <TimeModeTimer />
          </div>
          <div className="flex-1 min-h-0">
            <GameInnerPanel useGameContext={useTimeModeGame} />
          </div>
        </div>
      )}
      {gameStatus === "finished" && (
        <GameResult useGameContext={useTimeModeGame} />
      )}
    </div>
  );
};

const FreeTimePage = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full h-full max-w-[1200px] px-4">
        <TimeModeGameProvider initialTime={60}>
          <GamePanelContent />
        </TimeModeGameProvider>
      </div>
    </div>
  );
};

export default FreeTimePage;
