"use client";
import GameResult from "@/components/game/GameResult";

import {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from "react";
import Image from "next/image";
import { FaLongArrowAltRight } from "react-icons/fa";
import CountUp from "react-countup";
import { PHASE_DURATION_SECONDS } from "@/common/constants";
import {
  SingleplayerGameProvider,
  useSingleplayerGame,
} from "@/contexts/SingleplayerGameContext";
import Option from "@/lib/rust_prelude/option";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { monthNames } from "@/lib/types/events/eventdate";
import { ThemeContext } from "@/components/theme/ThemeProvider";
import Lobby from "@/components/game/Lobby";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";
import DotsProgress from "../general/DotProgress";

const formatYear = (y: number) => (y > 0 ? `${y}` : `${Math.abs(y)} BC`);

const LoadingSkeleton = () => (
  <div className="w-full animate-pulse">
    <div className="flex flex-col justify-between items-center mb-4">
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
    </div>
    <div className="flex flex-col gap-y-5 items-center w-full">
      <CardSkeleton />
      <CardSkeleton />
      <div className="h-[52px] bg-gray-300 dark:bg-gray-700 rounded w-40 mt-3"></div>
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="border-4 border-gray-300 dark:border-gray-700 rounded-xl p-2 py-4 w-full max-w-[500px]">
    <div className="h-[68px] flex items-center justify-center">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
    </div>
    <div className="py-6 px-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

const GamePanelContent = () => {
  const { gameStatus } = useSingleplayerGame();
  return (
    <div className="w-full h-full">
      {(gameStatus === "lobby" || gameStatus === "loading") && <Lobby />}
      {gameStatus === "ongoing" && <InnerPanel />}
      {gameStatus === "finished" && <GameResult />}

    </div>
  );
}

const InnerPanel: React.FC = () => {
  const {
    currentPair,
    currentIndex,
    points,
    nextPair,
    nextGameReady,
    detailedEvents,
    month,
    date,
    resultYear,
    earlier,
    eventType,
    selectedId,
    handleCardClick,
    answers,
  } = useSingleplayerGame();

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
          month={month}
          date={date}
          handleCardClick={handleCardClick}
          resultYear={resultYear}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
        />
        <GameCard
          event={secondEvent}
          detailedEvent={secondDetailed}
          month={month}
          date={date}
          handleCardClick={handleCardClick}
          resultYear={resultYear}
          nextGameReady={nextGameReady}
          selectedId={selectedId}
        />
      </div>
      <div className="w-full flex-shrink-0 flex-grow-0 flex items-center justify-around py-1 h-[52px]">
        <p className="text-xl font-semibold">Score: {points}</p>
        <DotsProgress statuses={answers} currentIndex={currentIndex.unwrapOr(0)} />
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

const GameCard: React.FC<{
  event: Option<EventPayload>;
  detailedEvent: Option<DetailedEventType>;
  month: number;
  date: number;
  handleCardClick: (id: string) => void;
  resultYear: Option<number>;
  nextGameReady: boolean;
  selectedId: Option<string>;
}> = memo(
  ({
    event,
    detailedEvent,
    month,
    date,
    handleCardClick,
    resultYear,
    nextGameReady,
    selectedId,
  }) => {
    const { theme } = useContext(ThemeContext);

    const hasDetailedEvent = detailedEvent.isSome();
    const hasSelectedId = selectedId.isSome();

    const showBorderColor = useMemo(
      () => nextGameReady && hasDetailedEvent,
      [nextGameReady, hasDetailedEvent]
    );
    const isChoiceDisabled = useMemo(
      () => hasSelectedId || nextGameReady,
      [hasSelectedId, nextGameReady]
    );
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
      setShouldAnimate(hasSelectedId && hasDetailedEvent);
    }, [hasSelectedId, hasDetailedEvent]);

    const onCardClick = useCallback(() => {
      event.ifSome((e) => {
        handleCardClick(e.id);
      });
    }, [event, handleCardClick]);

    const defaultBorderColor = useMemo(() => {
      switch (theme) {
        case "light":
          return "border-gray-800";
        case "dark":
          return "border-white";
        case "pink":
          return "border-pink-400";
        default:
          return "border-gray-800";
      }
    }, [theme]);

    const getImageSrc = () =>
      event.andThen((e) => Option.into(e.thumbnail?.source));

    return (
      <button
        type="button"
        className={`border-4 rounded-xl px-2 w-full max-w-[800px] relative ${
          showBorderColor
            ? resultYear.equals(detailedEvent.map((de) => de.year))
              ? "border-green-500"
              : "border-red-500"
            : defaultBorderColor
        } ${
          isChoiceDisabled
            ? "cursor-not-allowed opacity-80"
            : "hover:cursor-pointer hover:scale-[1.02]"
        } transition-all duration-200 ease-in-out`}
        disabled={isChoiceDisabled}
        onClick={onCardClick}
      >
        {event
          .map((eve) => (
            <div key={eve.id} className="flex w-full px-1">
              <div className="w-2/3">
                <div className="h-[60px] w-full flex items-center justify-center">
                  {detailedEvent
                    .map((de) => (
                      <CardEventDate
                        event={de}
                        day={date}
                        month={monthNames[month]}
                        year={de.year}
                        shouldAnimate={shouldAnimate}
                        key={de.id}
                      />
                    ))
                    .unwrapOr(<div className="h-full w-full" />)}
                </div>
                <p className="py-6 px-2">{eve.text}</p>
              </div>
              <div className="w-1/3 flex items-center justify-center relative min-h-[150px] py-2">
                {getImageSrc().match({
                  Some: (src) => (
                    <div className="relative w-full h-full">
                      <Image
                        src={src}
                        alt={eve.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 800px) 33vw, 266px"
                      />
                    </div>
                  ),
                  None: () => <div className="h-full w-full" />,
                })}
              </div>
            </div>
          ))
          .unwrapOr(<CardSkeleton />)}
      </button>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.event.equals(nextProps.event) &&
      prevProps.detailedEvent.equals(nextProps.detailedEvent) &&
      prevProps.month === nextProps.month &&
      prevProps.date === nextProps.date &&
      prevProps.nextGameReady === nextProps.nextGameReady &&
      prevProps.selectedId.equals(nextProps.selectedId) &&
      prevProps.resultYear.equals(nextProps.resultYear) &&
      prevProps.handleCardClick === nextProps.handleCardClick
    );
  }
);
GameCard.displayName = "GameCard";

const CardEventDate: React.FC<{
  event: DetailedEventType;
  day: number;
  month: string;
  year: number;
  shouldAnimate: boolean;
}> = ({ event, day, month, year, shouldAnimate }) => {
  const { selectedId } = useSingleplayerGame();
  const animationKey = useMemo(
    () => selectedId.map((sId) => `${event.id}-${sId}`).unwrapOr(event.id),
    [event, selectedId]
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-bold">
      {shouldAnimate ? (
        <>
          <span>{`${month} ${day},`}</span>
          <span className="text-2xl">
            <CountUp
              key={animationKey}
              start={0}
              end={year}
              duration={PHASE_DURATION_SECONDS}
              separator=""
              formattingFn={formatYear}
              useEasing={true}
              preserveValue={false}
            />
          </span>
        </>
      ) : null}
    </div>
  );
};



const GamePanel: React.FC = () => {
  return (
    <SingleplayerGameProvider>
      <GamePanelContent />
    </SingleplayerGameProvider>
  );
};

export default GamePanel;
