"use client";
import EventService from "@/hooks/event/useEvent";
import { EventType } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { Pair } from "@/lib/types/common/pair";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Option from "@/lib/rust_prelude/option";
import { BaseGameContextType, GameStatusType, useBaseGameLogic } from "./BaseGameContext";
import { ScoreCalculator } from "@/lib/game";

const FreePlayGameContext = createContext<BaseGameContextType | undefined>(
  undefined
);

export const useFreePlayGame = () => {
  const context = useContext(FreePlayGameContext);
  if (!context) {
    throw new Error(
      "useFreePlayGame must be used within FreePlayGameProvider"
    );
  }
  return context;
};

interface FreePlayGameProviderProps {
  children: ReactNode;
}

export const FreePlayGameProvider = ({
  children,
}: FreePlayGameProviderProps) => {
  // Game state
  const [eventType, setEventType] = useState<Option<EventType>>(Option.None());
  const [gameStatus, setGameStatus] = useState<GameStatusType>("lobby");
  const [partialEvents, setPartialEvents] = useState<Pair<EventPayload>[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [answers, setAnswers] = useState<Option<boolean>[]>([]);
  const scoredRoundsRef = useRef<Set<number>>(new Set());

  const { data: events, isLoading: isLoadingEvents, isError: isErrorEvents } = EventService.useGetRandomEvents(
    eventType.unwrapOr("event"),
    eventType.isSome()
  );

  const currentPair: Option<Pair<EventPayload>> = useMemo(
    () =>
      currentIndex >= 0 && currentIndex < partialEvents.length
        ? Option.Some(partialEvents[currentIndex])
        : Option.None(),
    [currentIndex, partialEvents]
  );

  const baseGame = useBaseGameLogic(currentPair, gameStatus);

  const selectEventType = useCallback((et: EventType) => {
    setEventType(Option.Some(et));
    setGameStatus("loading");
  }, []);

  useEffect(() => {
    if (gameStatus === "loading" && !isLoadingEvents) {
      if (events.isSome()) {
        events.ifSome((evs) => {
          if (evs.length > 0) {
            setPartialEvents(evs);
            setAnswers(Array(evs.length).fill(Option.None()));
            setCurrentIndex(0);
            setPoints(0);
            scoredRoundsRef.current.clear();
            setGameStatus("ongoing");
          } else {
            console.error("No events found");
            setGameStatus("lobby");
          }
        });
      } else if (isErrorEvents || events.isNone()) {
        console.error("Failed to fetch random events");
        setGameStatus("lobby");
      }
    }
  }, [events, gameStatus, isLoadingEvents, isErrorEvents]);

  useEffect(() => {
    if (gameStatus === "ongoing" && currentIndex >= partialEvents.length && partialEvents.length > 0) {
      setGameStatus("finished");
      ScoreCalculator.saveBestScore(points);
    }
  }, [currentIndex, partialEvents.length, gameStatus, points]);

  useEffect(() => {
    if (
      gameStatus === "ongoing" &&
      baseGame.nextGameReady &&
      baseGame.selectedId.isSome() &&
      baseGame.currentDetailPair.isSome() &&
      !scoredRoundsRef.current.has(currentIndex)
    ) {
      baseGame.currentDetailPair.ifSome(([firstEvent, secondEvent]) => {
        baseGame.selectedId.ifSome((selectedId) => {
          const isCorrect = ScoreCalculator.isCorrectSelection(
            firstEvent,
            secondEvent,
            selectedId,
            baseGame.earlier
          );

          if (isCorrect) {
            setPoints((prev) => prev + 1);
          }

          setAnswers((prev) => {
            const newAnswers = [...prev];
            newAnswers[currentIndex] = Option.Some(isCorrect);
            return newAnswers;
          });

          scoredRoundsRef.current.add(currentIndex);
        });
      });
    }
  }, [
    gameStatus,
    baseGame.nextGameReady,
    baseGame.selectedId,
    baseGame.currentDetailPair,
    baseGame.earlier,
    currentIndex,
  ]);

  const nextPair = useCallback(() => {
    baseGame.resetForNextPair();
    setCurrentIndex((prev) => prev + 1);
  }, [baseGame]);

  const value: BaseGameContextType = useMemo(
    () => ({
      detailedEvents: baseGame.detailedEvents,
      currentPair,
      currentIndex: Option.Some(currentIndex),
      eventType,
      gameStatus,
      points,
      answers,
      selectedId: baseGame.selectedId,
      earlier: baseGame.earlier,
      nextGameReady: baseGame.nextGameReady,
      resultYear: baseGame.resultYear,
      resultEventId: baseGame.resultEventId,
      selectEventType,
      handleCardClick: baseGame.handleCardClick,
      nextPair,
    }),
    [
      baseGame.detailedEvents,
      baseGame.selectedId,
      baseGame.earlier,
      baseGame.nextGameReady,
      baseGame.resultYear,
      baseGame.resultEventId,
      baseGame.handleCardClick,
      currentPair,
      currentIndex,
      eventType,
      gameStatus,
      points,
      answers,
      selectEventType,
      nextPair,
    ]
  );

  return (
    <FreePlayGameContext.Provider value={value}>
      {children}
    </FreePlayGameContext.Provider>
  );
};
