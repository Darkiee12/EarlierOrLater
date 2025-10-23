"use client";
import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import EventImpl, { FullEventImpl } from "@/models/event";
import { PositionImpl } from "@/models/pairevent";

interface GameContextType {
  currentPairIndex: number;
  points: number;
  revealedYear: boolean;
  pairs: Array<{ firstEvent: EventImpl; secondEvent: EventImpl; expectedResult: PositionImpl }>;
  total: number;
  currentPair: { firstEvent: EventImpl; secondEvent: EventImpl; expectedResult: PositionImpl };
  ongoing: boolean;
  date: number;
  month: string;

  setRevealedYear: (revealed: boolean) => void;
  handleCardClick: (position: PositionImpl) => void;
  nextPair: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};

interface GameProviderProps {
  events: FullEventImpl;
  children: ReactNode;
}

export const GameProvider = ({ events, children }: GameProviderProps) => {
  const pairs = useMemo(() => {
    const rawPairs = events.prepareEvents();
    return rawPairs.map(pair => ({
      firstEvent: pair.firstEvent,
      secondEvent: pair.secondEvent,
      expectedResult: pair.expectedResult
    }));
  }, [events]);
  
  const [currentPairIndex, setCurrentPairIndex] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [revealedYear, setRevealedYear] = useState<boolean>(false);
  const [ongoing, setOngoing] = useState<boolean>(true);
  const currentPair = pairs[currentPairIndex];   

  const handleCardClick = (selectedPosition: PositionImpl) => {    
    if (currentPair.expectedResult.bool(selectedPosition)) {
      setPoints(prev => prev + 1);
    }
    setRevealedYear(true);
  };

  const nextPair = () => {
    if (currentPairIndex < pairs.length - 1) {
      setCurrentPairIndex(prev => prev + 1);
      setRevealedYear(false);
    } else{
      setOngoing(false);
    }
  };

  const resetGame = () => {
    setCurrentPairIndex(0);
    setPoints(0);
    setRevealedYear(false);
  };

  const value = {
    currentPairIndex,
    points,
    revealedYear,
    pairs,
    currentPair,
    ongoing,
    total: pairs.length,
    date: events.date,
    month: events.month,
    setRevealedYear,
    handleCardClick,
    nextPair,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
