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
  useCallback,
} from "react";
import { BaseGameContextType, useBaseGameLogic } from "./BaseGameContext";
import GameResultService from "@/services/client/game/GameResultService";

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
  // Game state
  const [today] = useState(() => EventDateImpl.fullToday());
  const [eventType, setEventType] = useState<EventType | undefined>(undefined);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [isCheckingPlayedStatus, setIsCheckingPlayedStatus] = useState(true);
  const [savedGameData, setSavedGameData] = useState<{
    points: number;
    events: any[];
    answers: boolean[];
  } | null>(null);
  
  // UI-related state
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

  const baseGame = useBaseGameLogic(events);

  useMemo(() => {
    baseGame.eventType.ifSome((et) => {
      if (et !== eventType) {
        setEventType(et);
      }
    });
  }, [baseGame.eventType, eventType]);

  useEffect(() => {
    const saveGameResult = async () => {
      if (baseGame.gameStatus === "finished" && !alreadyPlayed) {
        const results = baseGame.answers.map((opt) => opt.unwrapOr(false));
        const allEvents = Array.from(baseGame.detailedEvents.values());

        const saveResult = await GameResultService.saveGameResult(
          results,
          baseGame.points,
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
  }, [baseGame.gameStatus, baseGame.answers, baseGame.points, baseGame.detailedEvents, alreadyPlayed]);

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
      ...baseGame,
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
    [baseGame, today.month, today.date, currentStreak, bestStreak, alreadyPlayed, isCheckingPlayedStatus, savedGameData, showSavedResult, loadSavedResult]
  );

  return (
    <DailyGameContext.Provider value={value}>
      {children}
    </DailyGameContext.Provider>
  );
};
