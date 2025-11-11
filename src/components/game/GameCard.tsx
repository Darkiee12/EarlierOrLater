import {
  memo,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import Option from "@/lib/rust_prelude/option";
import Image from "next/image";
import CountUp from "react-countup";
import { PHASE_DURATION_SECONDS } from "@/common/constants";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { monthNames } from "@/lib/types/events/eventdate";
import { ThemeContext } from "@/components/theme/ThemeProvider";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";
import { BaseGameContextType } from "@/contexts";

const formatYear = (y: number) => (y > 0 ? `${y}` : `${Math.abs(y)} BC`);

const GameCard: React.FC<{
  event: Option<EventPayload>;
  detailedEvent: Option<DetailedEventType>;
  handleCardClick: (id: string) => void;
  resultYear: Option<number>;
  resultEventId: Option<string>;
  nextGameReady: boolean;
  selectedId: Option<string>;
  useGameContext: () => BaseGameContextType;
}> = memo(
  ({
    event,
    detailedEvent,
    handleCardClick,
    resultYear,
    resultEventId,
    nextGameReady,
    selectedId,
    useGameContext,
  }) => {
    const { theme } = useContext(ThemeContext);

    const hasDetailedEvent = detailedEvent.isSome();
    const hasSelectedId = selectedId.isSome();

    const isCorrectEvent = useMemo(() => {
      return detailedEvent.match({
        Some: (de) => resultEventId.match({
          Some: (id) => de.id === id,
          None: () => true, // If resultEventId is None, it's a tie - both are correct
        }),
        None: () => false,
      });
    }, [detailedEvent, resultEventId]);

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
            ? isCorrectEvent
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
                        day={de.day}
                        month={monthNames[de.month]}
                        year={de.year}
                        shouldAnimate={shouldAnimate}
                        selectedId={selectedId}
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
      prevProps.nextGameReady === nextProps.nextGameReady &&
      prevProps.selectedId.equals(nextProps.selectedId) &&
      prevProps.resultYear.equals(nextProps.resultYear) &&
      prevProps.resultEventId.equals(nextProps.resultEventId) &&
      prevProps.handleCardClick === nextProps.handleCardClick &&
      prevProps.useGameContext === nextProps.useGameContext
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
  selectedId: Option<string>;
}> = ({ event, day, month, year, shouldAnimate, selectedId }) => {
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

export default GameCard;
