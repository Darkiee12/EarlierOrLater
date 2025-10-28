"use client";

import { memo, useCallback, useMemo } from "react";
import { GameProvider, useGameContext } from "@/contexts/GameContext";
import { FaLongArrowAltRight } from "react-icons/fa";
import CountUp from "react-countup";
import { PHASE_DURATION_SECONDS } from "@/common/constants";
import Option from "@/lib/rust_prelude/option/Option";
import { EventPayload } from "@/lib/types/events/event-payload";
import { EventData } from "@/lib/types/common/database.types";
import { monthNames } from "@/lib/types/events/eventdate";

const formatYear = (y: number) => (y > 0 ? `${y}` : `${Math.abs(y)} BC`);

const GamePanelContent = memo(() => {
  const {  gameStatus } = useGameContext();
  return (
    <div className="w-full">
      {gameStatus === "lobby" && <Lobby />}
      {gameStatus === "loading" && <div>Loading...</div>}
      {gameStatus === "ongoing" && (
        <>
          <InnerPanel />
        </>
      )}
      {gameStatus === "finished" && <GameResult />}
    </div>
  );
});
GamePanelContent.displayName = "GamePanelContent";

const InnerPanel: React.FC = () => {
  const {
    currentPair,
    points,
    nextPair,
    nextGameReady,
    detailedEvents,
    month,
    date,
    smallerYear,
    selectedId,
    handleCardClick,
  } = useGameContext();

  const firstEvent = useMemo(() => currentPair.map((pair) => pair.first), [currentPair]);
  const secondEvent = useMemo(() => currentPair.map((pair) => pair.second), [currentPair]);

  const firstDetailed: Option<EventData> = useMemo(() => {
    let result: Option<EventData> = Option.None();
    firstEvent.ifSome((e) => {
      Option.into(detailedEvents.get(e.id)).ifSome((de) => {
        result = Option.Some(de);
      });
    });
    return result;
  }, [detailedEvents, firstEvent]);

  const secondDetailed: Option<EventData> = useMemo(() => {
    let result: Option<EventData> = Option.None();
    secondEvent.ifSome((e) => {
      Option.into(detailedEvents.get(e.id)).ifSome((de) => {
        result = Option.Some(de);
      });
    });
    return result;
  }, [detailedEvents, secondEvent]);

  const onContinue = useCallback(() => {
    nextPair();
  }, [nextPair]);
  return (
    <>
      <div className="flex flex-col justify-between items-center mb-4">
        <h2 className="font-bold text-2xl py-2 w-full text-center">
          Which came first?
        </h2>
        <p className="text-xl font-semibold">Score: {points}</p>
      </div>
      <div className="flex flex-col gap-y-5 items-center w-full">
        <GameCard
          event={firstEvent}
          detailedEvent={firstDetailed}
          month={month}
          date={date}
          handleCardClick={handleCardClick}
          smallerYear={smallerYear}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
        />
        <GameCard
          event={secondEvent}
          detailedEvent={secondDetailed}
          month={month}
          date={date}
          handleCardClick={handleCardClick}
          smallerYear={smallerYear}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
        />
          <div className="flex items-center justify-center mt-3 h-[52px]">
            {
              <button
                className={`rounded-lg py-3 px-2 border-2 ${nextGameReady ? "border-black dark:border-white hover:cursor-pointer" : "border-gray-400 dark:border-gray-600 cursor-not-allowed"} font-semibold text-lg flex items-center justify-center transition-all duration-200 ease-in-out`}
                onClick={onContinue}
                disabled={!nextGameReady}
              >
                Continue {<FaLongArrowAltRight className="inline-block ml-2" />}
              </button>
            }
          </div>
      </div>
    </>
  );
};

const GameCard: React.FC<{
  event: Option<EventPayload>;
  detailedEvent: Option<EventData>;
  month: number;
  date: number;
  handleCardClick: (id: string) => void;
  smallerYear: Option<number>;
  nextGameReady: boolean;
  selectedId: Option<string>;
}> = memo(({ event, detailedEvent, month, date, handleCardClick, smallerYear, nextGameReady, selectedId }) => {
  const showBorderColor = useMemo(() => nextGameReady && detailedEvent.isSome(), [nextGameReady, detailedEvent]);
  const isChoiceDisabled = useMemo(() => selectedId.isSome() || nextGameReady, [selectedId, nextGameReady]);

  const onCardClick = useCallback(() => {
    event.ifSome((e) => {
      handleCardClick(e.id);
    });
  }, [event, handleCardClick]);

    return (
      <button
        type="button"
        className={`border-4 rounded-xl p-2 py-4 w-full max-w-[500px] relative ${
          showBorderColor
            ? smallerYear.equals(detailedEvent.map(de => de.year))
              ? "border-green-500"
              : "border-red-500"
            : "border-black dark:border-white"
        } ${isChoiceDisabled ? "cursor-not-allowed opacity-80" : "hover:cursor-pointer hover:scale-[1.02]"} transition-all duration-200 ease-in-out`}
        disabled={isChoiceDisabled}
        onClick={onCardClick}
      >
        {event.match({
          Some: (eve) => (
            <>
              <div className="h-[28px] flex items-center justify-center py-2">
                {detailedEvent.match({
                  Some: (de) => <>
                  <div className="w-full flex flex-col items-center justify-center font-bold">
                    <span>{`${monthNames[month]} ${date},`}</span>
                    <span className="text-2xl">
                      <CountUp
                        start={0}
                        end={de.year}
                        duration={PHASE_DURATION_SECONDS}
                        separator=""
                        formattingFn={formatYear}
                      >
                        {({ countUpRef }) => (
                          <div>
                            <span ref={countUpRef} />
                          </div>
                        )}
                      </CountUp>
                    </span>
                  </div>
                  </>,
                  None: () => <></>
                })}
              </div>
              <p className="py-6 px-2">{eve.text}</p>
            </>
          ),
          None: () => <>Loading...</>,
        })}
      </button>
    );    
});
GameCard.displayName = "GameCard";

const Lobby = () => {
  const { selectEventType } = useGameContext();
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold">Welcome to the Earlier or Later!</h2>
      <p className="text-xl mt-4">
        Select the category to start the game.
      </p>
      <div className="grid grid-cols-3 gap-x-4">
        <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out" type="button" onClick={() => selectEventType("events")}>
          Historical Events
        </button>
        <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out" type="button" onClick={() => selectEventType("births")}>
          Births
        </button>
        <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out" type="button" onClick={() => selectEventType("deaths")}>
          Deaths
        </button>
      </div>
      
    </div>
  );
};

const GameResult = () => {
  const { points } = useGameContext();
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold">Game Over!</h2>
      <p className="text-xl mt-4">Your final score is: {points}</p>
    </div>
  );
};

const GamePanel: React.FC = () => {
  return (
    <GameProvider>
      <GamePanelContent />
    </GameProvider>
  );
};

export default GamePanel;
