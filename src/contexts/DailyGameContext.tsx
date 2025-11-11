"use client";
import EventService from "@/hooks/event/useEvent";
import { EventType } from "@/lib/types/common/database.types";
import EventDateImpl from "@/lib/types/events/eventdate";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { BaseGameContextType, useBaseGameLogic } from "./BaseGameContext";
import GameResultService from "@/services/client/game/GameResultService";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DailyGameContextType extends BaseGameContextType {
  // Game Info
  month: number;
  date: number;
  // Streak Info
  currentStreak: number;
  bestStreak: number;
  // Already Played Info
  alreadyPlayed: boolean;
}

interface DailyGameProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXT & HOOKS
// ============================================================================

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

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const DailyGameProvider = ({ children }: DailyGameProviderProps) => {
  // ---------------------------------------------------------------------------
  // State - Game Configuration
  // ---------------------------------------------------------------------------
  const [today] = useState(() => EventDateImpl.fullToday());
  const [eventType, setEventType] = useState<EventType | undefined>(undefined);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  // ---------------------------------------------------------------------------
  // Initialize streak data and check if already played
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initializeStreakData = async () => {
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
        Ok: (hasPlayed) => setAlreadyPlayed(hasPlayed),
        Err: (error) => console.error("Error checking if played today:", error),
      });
    };

    initializeStreakData();
  }, []);

  // ---------------------------------------------------------------------------
  // API Hooks - Daily Mode: Fetch events by specific date
  // ---------------------------------------------------------------------------
  const { data: events } = EventService.useGetEventPairs(
    today.date,
    today.month,
    today.year,
    eventType ?? "event",
    eventType !== undefined
  );

  const baseGame = useBaseGameLogic(events);

  // Sync event type from base game back to local state
  useMemo(() => {
    baseGame.eventType.ifSome((et) => {
      if (et !== eventType) {
        setEventType(et);
      }
    });
  }, [baseGame.eventType, eventType]);

  // ---------------------------------------------------------------------------
  // Save game result when game finishes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const saveGameResult = async () => {
      if (baseGame.gameStatus === "finished" && !alreadyPlayed) {
        const results = baseGame.answers.map((opt) => opt.unwrapOr(false));

        const saveResult = await GameResultService.saveGameResult(
          results,
          baseGame.points
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
  }, [baseGame.gameStatus, baseGame.answers, baseGame.points, alreadyPlayed]);

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const value: DailyGameContextType = useMemo(
    () => ({
      ...baseGame,
      month: today.month,
      date: today.date,
      currentStreak,
      bestStreak,
      alreadyPlayed,
    }),
    [baseGame, today.month, today.date, currentStreak, bestStreak, alreadyPlayed]
  );

  return (
    <DailyGameContext.Provider value={value}>
      {children}
    </DailyGameContext.Provider>
  );
};
