"use client";
import EventService from "@/hooks/event/useEvent";
import { EventType } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { Pair } from "@/lib/types/common/pair";
import EventDateImpl from "@/lib/types/events/eventdate";
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
import GameResultService from "@/services/client/game/GameResultService";
import { ScoreCalculator } from "@/lib/game";

interface DailyGameContextType extends BaseGameContextType {
  month: number;
  date: number;
  currentStreak: number;
  bestStreak: number;
  alreadyPlayed: boolean;
  isCheckingPlayedStatus: boolean;
  savedGameData: {
    points: number;
    events: any[];
    answers: boolean[];
  } | null;
  showSavedResult: boolean;
  loadSavedResult: () => void;
}

interface DailyGameProviderProps {
  children: ReactNode;
}

const DailyGameContext = createContext<DailyGameContextType | undefined>(
  undefined
);

export const useDailyGame = () => {
  const context = useContext(DailyGameContext);
  if (!context) {
    throw new Error("useDailyGame must be used within DailyGameProvider");
  }
  return context;
};

export const DailyGameProvider = ({ children }: DailyGameProviderProps) => {
  // Date state
  const [today] = useState(() => EventDateImpl.fullToday());

  // Game state
  const [eventType, setEventType] = useState<EventType | undefined>(undefined);
  const [gameStatus, setGameStatus] = useState<GameStatusType>("lobby");
  const [partialEvents, setPartialEvents] = useState<Pair<EventPayload>[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [answers, setAnswers] = useState<Option<boolean>[]>([]);
  const scoredRoundsRef = useRef<Set<number>>(new Set());

  // Streak state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [isCheckingPlayedStatus, setIsCheckingPlayedStatus] = useState(true);

  // Saved game state
  const [savedGameData, setSavedGameData] = useState<{
    points: number;
    events: any[];
    answers: boolean[];
  } | null>(null);
  const [showSavedResult, setShowSavedResult] = useState(false);

  const loadSavedGameData = useCallback(async () => {
    const recordResult = await GameResultService.getTodayGameRecord();
    recordResult.match({
      Ok: (record) => {
        if (record && record.events) {
          try {
            const events = JSON.parse(record.events);
            setSavedGameData({
              points: record.score,
              events,
              answers: record.results,
            });
          } catch (error) {
            console.error("Error parsing saved events:", error);
          }
        }
      },
      Err: (error) => console.error("Error loading saved game data:", error),
    });
  }, []);

  useEffect(() => {
    const initializeStreakData = async () => {
      setIsCheckingPlayedStatus(true);
      
      const streakDataResult = await GameResultService.getStreakData();
      streakDataResult.match({
        Ok: (streakData) => {
          setCurrentStreak(streakData.currentStreak);
          setBestStreak(streakData.bestStreak);
        },
        Err: (error) => {
          console.error("Error loading streak data:", error);
        },
      });

      const hasPlayedResult = await GameResultService.hasPlayedToday();
      hasPlayedResult.match({
        Ok: (hasPlayed) => {
          setAlreadyPlayed(hasPlayed);
          if (hasPlayed) {
            loadSavedGameData();
          }
          setIsCheckingPlayedStatus(false);
        },
        Err: (error) => {
          console.error("Error checking if played today:", error);
          setIsCheckingPlayedStatus(false);
        },
      });
    };

    initializeStreakData();
  }, [loadSavedGameData]);

  const { data: events } = EventService.useGetEventPairs(
    today.date,
    today.month,
    today.year,
    eventType ?? "event",
    eventType !== undefined
  );

  const currentPair: Option<Pair<EventPayload>> = useMemo(
    () =>
      currentIndex >= 0 && currentIndex < partialEvents.length
        ? Option.Some(partialEvents[currentIndex])
        : Option.None(),
    [currentIndex, partialEvents]
  );

  const baseGame = useBaseGameLogic(currentPair, gameStatus);

  useEffect(() => {
    if (gameStatus === "loading" && events) {
      events.ifSomeWithPredicate(
        (evs) => evs.length > 0,
        (evs) => {
          setPartialEvents(evs);
          setAnswers(Array(evs.length).fill(Option.None()));
          setCurrentIndex(0);
          setPoints(0);
          scoredRoundsRef.current.clear();
          setGameStatus("ongoing");
        }
      );
    }
  }, [events, gameStatus]);

  useEffect(() => {
    if (gameStatus === "ongoing" && currentIndex >= partialEvents.length && partialEvents.length > 0) {
      setGameStatus("finished");
      ScoreCalculator.saveBestScore(points);
    }
  }, [currentIndex, partialEvents.length, gameStatus, points]);

  const selectEventType = useCallback((et: EventType) => {
    setEventType(et);
    setGameStatus("loading");
  }, []);

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

  useEffect(() => {
    const saveGameResult = async () => {
      if (gameStatus === "finished" && !alreadyPlayed) {
        const results = answers.map((opt) => opt.unwrapOr(false));
        const allEvents = Array.from(baseGame.detailedEvents.values());

        const saveResult = await GameResultService.saveGameResult(
          results,
          points,
          allEvents
        );

        saveResult.match({
          Ok: (updatedStreak) => {
            setCurrentStreak(updatedStreak.currentStreak);
            setBestStreak(updatedStreak.bestStreak);
            setAlreadyPlayed(true);
          },
          Err: (error) => {
            console.error("Error saving game result:", error);
          },
        });
      }
    };

    saveGameResult();
  }, [gameStatus, answers, points, baseGame.detailedEvents, alreadyPlayed]);

  const loadSavedResult = useCallback(async () => {
    if (!alreadyPlayed) return;
    
    const recordResult = await GameResultService.getTodayGameRecord();
    recordResult.match({
      Ok: (record) => {
        if (record && record.events) {
          try {
            const events = JSON.parse(record.events);
            setSavedGameData({
              points: record.score,
              events,
              answers: record.results,
            });
            setShowSavedResult(true);
          } catch (error) {
            console.error("Error parsing saved events:", error);
          }
        } else if (record) {
          setSavedGameData({
            points: record.score,
            events: [],
            answers: record.results,
          });
          setShowSavedResult(true);
        }
      },
      Err: (error) => console.error("Error loading saved game data:", error),
    });
  }, [alreadyPlayed]);

  const value: DailyGameContextType = useMemo(
    () => ({
      detailedEvents: baseGame.detailedEvents,
      currentPair,
      currentIndex: Option.Some(currentIndex),
      eventType: Option.into(eventType),
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
      month: today.month,
      date: today.date,
      currentStreak,
      bestStreak,
      alreadyPlayed,
      isCheckingPlayedStatus,
      savedGameData,
      showSavedResult,
      loadSavedResult,
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
      today.month,
      today.date,
      currentStreak,
      bestStreak,
      alreadyPlayed,
      isCheckingPlayedStatus,
      savedGameData,
      showSavedResult,
      loadSavedResult,
    ]
  );

  return (
    <DailyGameContext.Provider value={value}>
      {children}
    </DailyGameContext.Provider>
  );
};
