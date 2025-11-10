"use client";
import GameResult from "@/components/game/GameResult";
import { FaLongArrowAltRight } from "react-icons/fa";
import Option from "@/lib/rust_prelude/option";
import { FreePlayGameProvider, useFreePlayGame } from "@/contexts";
import Lobby from "@/components/game/Lobby";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";
import DotsProgress from "@/components/general/DotProgress";
import GameCard from "@/components/game/GameCard";
import { useCallback, useMemo } from "react";

const FreePlayGamePanelContent = () => {
  const { gameStatus } = useFreePlayGame();
  return (
    <div className="w-full h-full">
      {(gameStatus === "lobby" || gameStatus === "loading") && <Lobby useGameContext={useFreePlayGame} gameMode="freeplay" />}
      {gameStatus === "ongoing" && <InnerPanel />}
      {gameStatus === "finished" && <GameResult useGameContext={useFreePlayGame} />}
    </div>
  );
};

const InnerPanel: React.FC = () => {
  const {
    currentPair,
    currentIndex,
    points,
    nextPair,
    nextGameReady,
    detailedEvents,
    resultYear,
    resultEventId,
    earlier,
    eventType,
    selectedId,
    handleCardClick,
    answers,
  } = useFreePlayGame();

  const firstEvent = useMemo(
    () => currentPair.map((pair) => pair.first),
    [currentPair]
  );
  const secondEvent = useMemo(
    () => currentPair.map((pair) => pair.second),
    [currentPair]
  );

  const firstEventId = useMemo(
    () => firstEvent.map((e) => e.id).unwrapOr(""),
    [firstEvent]
  );
  const secondEventId = useMemo(
    () => secondEvent.map((e) => e.id).unwrapOr(""),
    [secondEvent]
  );

  const firstDetailed: Option<DetailedEventType> = useMemo(
    () => Option.into(detailedEvents.get(firstEventId)),
    [detailedEvents, firstEventId]
  );

  const secondDetailed: Option<DetailedEventType> = useMemo(
    () => Option.into(detailedEvents.get(secondEventId)),
    [detailedEvents, secondEventId]
  );

  const onContinue = useCallback(() => {
    nextPair();
  }, [nextPair]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 flex-grow-0 flex flex-col justify-between items-center mb-4">
        <h2 className="font-bold text-2xl py-1 w-full text-center">
          {eventType.match({
            Some: (et) => (
              <>
                {et === "birth" && (
                  <div>
                    Who was born <span>{earlier ? "earlier" : "later"}</span>
                  </div>
                )}
                {et === "death" && (
                  <div>
                    Who died <span>{earlier ? "earlier" : "later"}</span>?
                  </div>
                )}
                {et === "event" && (
                  <div>
                    Which event came{" "}
                    <span>{earlier ? "earlier" : "later"}</span>?
                  </div>
                )}
              </>
            ),
            None: () => <div>Select an event</div>,
          })}
        </h2>
      </div>
      <div className="flex-1 flex flex-col gap-y-2 justify-center items-center w-full overflow-y-auto">
        <GameCard
          event={firstEvent}
          detailedEvent={firstDetailed}
          handleCardClick={handleCardClick}
          resultYear={resultYear}
          resultEventId={resultEventId}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
          useGameContext={useFreePlayGame}
        />
        <GameCard
          event={secondEvent}
          detailedEvent={secondDetailed}
          handleCardClick={handleCardClick}
          resultYear={resultYear}
          resultEventId={resultEventId}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
          useGameContext={useFreePlayGame}
        />
      </div>
      <div className="w-full flex-shrink-0 flex-grow-0 flex items-center justify-around py-1 h-[52px]">
        <p className="text-xl font-semibold">Score: {points}</p>
        <DotsProgress
          statuses={answers}
          currentIndex={currentIndex.unwrapOr(0)}
        />
        <button
          className={`rounded-lg py-1 px-1 border-2 ${
            nextGameReady
              ? "border-blue-500 text-blue-500 hover:cursor-pointer"
              : "border-gray-400 dark:border-gray-600 cursor-not-allowed"
          } font-semibold text-lg flex items-center justify-center transition-all duration-200 ease-in-out`}
          onClick={onContinue}
          disabled={!nextGameReady}
        >
          Continue {<FaLongArrowAltRight className="inline-block ml-2" />}
        </button>
      </div>
    </div>
  );
};

const FreePlayGamePanel: React.FC = () => {
  return (
    <FreePlayGameProvider>
      <FreePlayGamePanelContent />
    </FreePlayGameProvider>
  );
};

export default FreePlayGamePanel;
