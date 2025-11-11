"use client";
import { FaLongArrowAltRight } from "react-icons/fa";
import Option from "@/lib/rust_prelude/option";
import { BaseGameContextType } from "@/contexts";
import DotsProgress from "@/components/general/DotProgress";
import GameCard from "@/components/game/GameCard";
import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";

interface GameInnerPanelProps {
  useGameContext: () => BaseGameContextType;
}

const GameInnerPanel: React.FC<GameInnerPanelProps> = ({ useGameContext }) => {
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
  } = useGameContext();

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
    if (nextGameReady) {
      nextPair();
    }
  }, [nextPair, nextGameReady]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !nextGameReady) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isLeftSwipe && isHorizontalSwipe) {
      onContinue();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      
      if (key === 'w' || key === 'arrowup') {
        e.preventDefault();
        firstEvent.ifSome((event) => {
          if (!selectedId.isSome() && !nextGameReady) {
            handleCardClick(event.id);
          }
        });
      } else if (key === 's' || key === 'arrowdown') {
        e.preventDefault();
        secondEvent.ifSome((event) => {
          if (!selectedId.isSome() && !nextGameReady) {
            handleCardClick(event.id);
          }
        });
      } else if (key === ' ') {
        e.preventDefault();
        if (nextGameReady) {
          onContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [firstEvent, secondEvent, selectedId, nextGameReady, handleCardClick, onContinue]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Score and Dot Progress - Mobile only, shown above question */}
      <div className="w-full flex-shrink-0 flex-grow-0 flex items-center justify-around py-1 h-[52px] sm:hidden">
        <p className="text-xl font-semibold">Score: {points}</p>
        <DotsProgress
          statuses={answers}
          currentIndex={currentIndex.unwrapOr(0)}
        />
      </div>

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
      <div className="flex-1 flex flex-col gap-y-2 justify-start items-center w-full overflow-y-auto min-h-0">
        <GameCard
          event={firstEvent}
          detailedEvent={firstDetailed}
          handleCardClick={handleCardClick}
          resultYear={resultYear}
          resultEventId={resultEventId}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
          useGameContext={useGameContext}
        />
        <GameCard
          event={secondEvent}
          detailedEvent={secondDetailed}
          handleCardClick={handleCardClick}
          resultYear={resultYear}
          resultEventId={resultEventId}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
          useGameContext={useGameContext}
        />
      </div>
      
      {/* Continue button - Mobile only, centered below cards */}
      <div className="w-full flex-shrink-0 flex-grow-0 flex items-center justify-center py-1 h-[52px] sm:hidden">
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

      {/* Score, Dot Progress, and Continue button - PC only, shown below cards */}
      <div className="w-full flex-shrink-0 flex-grow-0 hidden sm:flex items-center justify-around py-1 h-[52px]">
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

export default GameInnerPanel;

