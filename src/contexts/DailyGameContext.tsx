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
import StreakService from "@/services/client/game/StreakService";

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

  // ---------------------------------------------------------------------------
  // Initialize streak data
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const streakData = StreakService.getStreakData();
    setCurrentStreak(StreakService.getCurrentStreak());
    setBestStreak(streakData.bestStreak);
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
  // Update streak when game finishes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (baseGame.gameStatus === "finished" && !StreakService.hasPlayedToday()) {
      const updatedStreak = StreakService.updateStreak();
      setCurrentStreak(updatedStreak.currentStreak);
      setBestStreak(updatedStreak.bestStreak);
    }
  }, [baseGame.gameStatus]);

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
    }),
    [baseGame, today.month, today.date, currentStreak, bestStreak]
  );

  return (
    <DailyGameContext.Provider value={value}>
      {children}
    </DailyGameContext.Provider>
  );
};
