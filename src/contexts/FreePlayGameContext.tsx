"use client";
import EventService from "@/hooks/event/useEvent";
import { EventType } from "@/lib/types/common/database.types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { BaseGameContextType, useBaseGameLogic } from "./BaseGameContext";

// ============================================================================
// CONTEXT & HOOKS
// ============================================================================

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

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface FreePlayGameProviderProps {
  children: ReactNode;
}

export const FreePlayGameProvider = ({
  children,
}: FreePlayGameProviderProps) => {
  // ---------------------------------------------------------------------------
  // State - Track event type for API call
  // ---------------------------------------------------------------------------
  const [eventType, setEventType] = useState<EventType | undefined>(undefined);

  // ---------------------------------------------------------------------------
  // API Hooks - Free Play Mode: Fetch random events
  // ---------------------------------------------------------------------------
  const { data: events } = EventService.useGetRandomEvents(
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
  // Context Value
  // ---------------------------------------------------------------------------

  const value: BaseGameContextType = useMemo(() => baseGame, [baseGame]);

  return (
    <FreePlayGameContext.Provider value={value}>
      {children}
    </FreePlayGameContext.Provider>
  );
};
