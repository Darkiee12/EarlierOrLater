"use client";
import EventService from "@/hooks/event/useEvent";
import { EventType } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { Pair } from "@/lib/types/common/pair";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Option, { OptionExt } from "@/lib/rust_prelude/option";
import { PHASE_DURATION_SECONDS } from "@/common/constants";
import { GameEngine, ScoreCalculator } from "@/lib/game";
import { useGameTimer } from "@/hooks/game";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";

export type GameStatusType = "loading" | "lobby" | "ongoing" | "finished";

export interface BaseGameContextType {
  detailedEvents: Map<string, DetailedEventType>;
  currentPair: Option<Pair<EventPayload>>;
  currentIndex: Option<number>;
  eventType: Option<EventType>;
  gameStatus: GameStatusType;
  points: number;
  answers: Option<boolean>[];
  selectedId: Option<string>;
  earlier: boolean;
  nextGameReady: boolean;
  resultYear: Option<number>;
  resultEventId: Option<string>;
  selectEventType: (eventType: EventType) => void;
  handleCardClick: (selectedId: string) => void;
  nextPair: () => void;
}

export const useBaseGameLogic = (
  currentPair: Option<Pair<EventPayload>>,
  gameStatus: GameStatusType
) => {
  // Events state
  const [detailedEvents, setDetailedEvents] = useState<Map<string, DetailedEventType>>(new Map());
  const detailedEventsRef = useRef<Map<string, DetailedEventType>>(new Map());

  // Selection state
  const [selectedId, setSelectedId] = useState<Option<string>>(Option.None());
  const [earlier, setEarlier] = useState<boolean>(true);
  const [revealReady, setRevealReady] = useState<boolean>(false);
  
  const { startTimers, clearTimers } = useGameTimer();

  const requestedEventIds = useMemo(() => {
    return currentPair.map((p) => [p.first.id, p.second.id]).unwrapOr([]);
  }, [currentPair]);

  const hasSelection = useMemo(() => selectedId.isSome(), [selectedId]);

  const currentDetailPair = useMemo<Option<[DetailedEventType, DetailedEventType]>>(() => {
    return currentPair.match({
      Some: (pair) => {
        return OptionExt.match2({
          opt1: detailedEvents.get(pair.first.id),
          opt2: detailedEvents.get(pair.second.id),
          cases: {
            SomeSome: (f, s) => Option.Some([f, s]),
            _: () => Option.None(),
          },
        });
      },
      None: () => Option.None(),
    });
  }, [currentPair, detailedEvents]);

  const resultYear: Option<number> = useMemo(() => {
    return currentDetailPair.andThen(([first, second]): Option<number> => {
      const year = ScoreCalculator.getResultYear(first, second, earlier);
      return year !== null ? Option.Some(year) : Option.None();
    });
  }, [currentDetailPair, earlier]);

  const resultEventId: Option<string> = useMemo(() => {
    return currentDetailPair.andThen(([first, second]): Option<string> => {
      const id = ScoreCalculator.getResultEventId(first, second, earlier);
      return id !== null ? Option.Some(id) : Option.None();
    });
  }, [currentDetailPair, earlier]);

  const { data: fetchedDetailEvents } = EventService.useGetDetailedEvents(
    requestedEventIds,
    hasSelection && requestedEventIds.length > 0
  );

  useEffect(() => {
    if (!fetchedDetailEvents) return;

    setDetailedEvents((prev) => {
      let changed = false;
      const newMap = new Map(prev);
      for (const ev of fetchedDetailEvents.unwrapOr([])) {
        if (!newMap.has(ev.id)) {
          newMap.set(ev.id, ev);
          changed = true;
        }
      }
      if (changed) {
        detailedEventsRef.current = newMap;
      }
      return changed ? newMap : prev;
    });
  }, [fetchedDetailEvents]);

  useEffect(() => {
    if (gameStatus !== "ongoing") {
      return;
    }

    clearTimers();
    setRevealReady(false);

    if (selectedId.isSome() && currentDetailPair.isSome()) {
      const delay = PHASE_DURATION_SECONDS * 1000;

      const handleReveal = () => {
        setRevealReady(true);
      };

      startTimers(delay, handleReveal, () => {});
    }

    return () => {
      clearTimers();
    };
  }, [selectedId, currentDetailPair, gameStatus, startTimers, clearTimers]);

  useEffect(() => {
    setSelectedId(Option.None());
    setRevealReady(false);
    setEarlier(GameEngine.generateRandomBoolean());
  }, [currentPair]);

  useEffect(() => {
    detailedEventsRef.current = detailedEvents;
  }, [detailedEvents]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev.isSome() ? prev : Option.Some(id)));
  }, []);

  const resetForNextPair = useCallback(() => {
    clearTimers();
    setRevealReady(false);
    setSelectedId(Option.None());
    setEarlier(GameEngine.generateRandomBoolean());
  }, [clearTimers]);

  return {
    detailedEvents: detailedEventsRef.current,
    selectedId,
    earlier,
    nextGameReady: revealReady,
    resultYear,
    resultEventId,
    currentDetailPair,
    handleCardClick,
    resetForNextPair,
  };
};
