"use client";
import GameResult from "@/components/game/GameResult";
import { FreePlayGameProvider, useFreePlayGame } from "@/contexts";
import Lobby from "@/components/game/Lobby";
import GameInnerPanel from "@/components/game/GameInnerPanel";

const GamePanelContent = () => {
  const { gameStatus } = useFreePlayGame();
  return (
    <div className="w-full h-full">
      {(gameStatus === "lobby" || gameStatus === "loading") && <Lobby useGameContext={useFreePlayGame} gameMode="freeplay" />}
      {gameStatus === "ongoing" && <GameInnerPanel useGameContext={useFreePlayGame} />}
      {gameStatus === "finished" && <GameResult useGameContext={useFreePlayGame} />}
    </div>
  );
};

const FreePage = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full h-full max-w-[1200px] px-4">
        <FreePlayGameProvider>
          <GamePanelContent />
        </FreePlayGameProvider>
      </div>
    </div>
  );
};

export default FreePage;
