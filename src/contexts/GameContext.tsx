"use client";
import EventService from "@/app/service/EventService";
import { EventData, EventType } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/event-payload";
import EventDateImpl from "@/lib/types/events/eventdate";
import { Pair } from "@/lib/types/events/pairevent";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Option from "@/lib/rust_prelude/option/Option";
import { PHASE_DURATION_SECONDS } from "@/common/constants";

type GameStatusType = "loading" | "lobby" | "ongoing" | "finished";

interface GameContextType {
  detailedEvents: Map<string, EventData>;
  currentPair: Option<Pair<EventPayload>>;
  currentIndex: Option<number>;
  points: number;
  month: number;
  date: number;
  gameStatus: GameStatusType;
  nextGameReady: boolean;
  smallerYear: Option<number>;
  selectedId: Option<string>;
  eventType: Option<EventType>;
  selectEventType: (eventType: EventType) => void;
  handleCardClick: (selectedId: string) => void;
  nextPair: () => void;
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
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [today] = useState(() => EventDateImpl.today());

  const [eventType, setEventType] = useState<Option<EventType>>(Option.None());
  const [partialEvents, setPartialEvents] = useState<Pair<EventPayload>[]>([]);
  const [detailedEvents, setDetailedEvents] = useState<Map<string, EventData>>(
    new Map()
  );
  const { mutate: getEvents, data: events } = EventService.usePostEvent(today);
  const [points, setPoints] = useState<number>(0);
  const [current, setCurrent] = useState<Option<number>>(Option.Some(0));
  const [gameStatus, setGameStatus] = useState<GameStatusType>("lobby");
  const [selectedId, setSelectedId] = useState<Option<string>>(Option.None());
  const scoredRoundsRef = useRef<Set<number>>(new Set());
  const [revealReady, setRevealReady] = useState<boolean>(false);
  const revealTimerRef = useRef<number | null>(null);
  const pointsTimerRef = useRef<number | null>(null);

  const totalRound = useMemo(() => partialEvents.length, [partialEvents]);

  const currentPair: Option<Pair<EventPayload>> = useMemo(
    () =>
      current.andThen((idx) =>
        idx < totalRound ? Option.Some(partialEvents[idx]) : Option.None()
      ),
    [current, partialEvents, totalRound]
  );

  const requestedEventIds = useMemo(() => {
    let ids: string[] = [];
    currentPair.ifSome((pair) => {
      ids = [pair.first.id, pair.second.id];
    });
    return ids;
  }, [currentPair]);
  const hasSelection = useMemo(() => {
    let b = false;
    selectedId.ifSome(() => {
      b = true;
    });
    return b;
  }, [selectedId]);
  const { data: fetchedDetailEvents } = EventService.useGetDetailedEvents(
    requestedEventIds,
    hasSelection && requestedEventIds.length > 0
  );

  useEffect(() => {
    current.ifSome((idx) => {
      if (gameStatus === "ongoing" && idx >= totalRound) {
        setGameStatus("finished");
        if (revealTimerRef.current !== null) {
          clearTimeout(revealTimerRef.current);
          revealTimerRef.current = null;
        }
        if (pointsTimerRef.current !== null) {
          clearTimeout(pointsTimerRef.current);
          pointsTimerRef.current = null;
        }
      }
    });
  }, [current, gameStatus, totalRound]);

  useEffect(() => {
    eventType.ifSome((et) => {
      getEvents({
        month: today.month,
        date: today.date,
        eventType: et,
      });
    });
  }, [eventType, getEvents, today.month, today.date]);

  useEffect(() => {
    if (events) {
      setPartialEvents(events);
      setGameStatus("ongoing");
      scoredRoundsRef.current = new Set();
      setRevealReady(false);
      if (revealTimerRef.current !== null) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      if (pointsTimerRef.current !== null) {
        clearTimeout(pointsTimerRef.current);
        pointsTimerRef.current = null;
      }
    }
  }, [events]);

  useEffect(() => {
    if (!fetchedDetailEvents) return;

    setDetailedEvents((prev) => {
      let changed = false;
      const newMap = new Map(prev);
      for (const ev of fetchedDetailEvents) {
        const existing = newMap.get(ev.id);
        if (!existing || existing !== ev) {
          newMap.set(ev.id, ev);
          changed = true;
        }
      }
      return changed ? newMap : prev;
    });
  }, [fetchedDetailEvents]);

  const currentDetailPair = useMemo<Option<[EventData, EventData]>>(() => {
    let res: Option<[EventData, EventData]> = Option.None();
    currentPair.ifSome((pair) => {
      const f = detailedEvents.get(pair.first.id);
      const s = detailedEvents.get(pair.second.id);
      if (f && s) res = Option.Some([f, s]);
    });
    return res;
  }, [currentPair, detailedEvents]);

  const smallerYear = useMemo(() => {
    return currentDetailPair.map(([f, s]) => Math.min(f.year, s.year));
  }, [currentDetailPair]);

  useEffect(() => {
    if (gameStatus !== "ongoing") {
      return;
    }

    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (pointsTimerRef.current !== null) {
      clearTimeout(pointsTimerRef.current);
      pointsTimerRef.current = null;
    }
    setRevealReady(false);

    let hasSel = false;
    selectedId.ifSome(() => (hasSel = true));

    const hasDetails = (() => {
      let present = false;
      currentDetailPair.ifSome(() => {
        present = true;
      });
      return present;
    })();

    if (hasSel && hasDetails) {
      const delay = PHASE_DURATION_SECONDS * 1000;

      revealTimerRef.current = window.setTimeout(() => {
        setRevealReady(true);
        revealTimerRef.current = null;
      }, delay);

      pointsTimerRef.current = window.setTimeout(() => {
        selectedId.ifSome((sId) => {
          current.ifSome((idx) => {
            if (!scoredRoundsRef.current.has(idx)) {
              currentDetailPair.ifSome(([f, s]) => {
                const isCorrect =
                  (f.year < s.year && f.id === sId) ||
                  (s.year < f.year && s.id === sId) ||
                  f.year === s.year;
                if (isCorrect) {
                  setPoints((prevPoints) => prevPoints + 1);
                }
                scoredRoundsRef.current.add(idx);
              });
            }
          });
        });
        pointsTimerRef.current = null;
      }, delay);
    }

    return () => {
      if (revealTimerRef.current !== null) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      if (pointsTimerRef.current !== null) {
        clearTimeout(pointsTimerRef.current);
        pointsTimerRef.current = null;
      }
    };
  }, [selectedId, currentDetailPair, current, gameStatus]);

  useEffect(() => {
    eventType.ifSome(() => setGameStatus("loading"));
  }, [eventType]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev.isSome() ? prev : Option.Some(id)));
  }, []);

  const nextPair = useCallback(() => {
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (pointsTimerRef.current !== null) {
      clearTimeout(pointsTimerRef.current);
      pointsTimerRef.current = null;
    }

    setCurrent((prev) => {
      const nextIdx = prev.map((c) => c + 1);
      
      nextIdx.ifSome((idx) => {
        if (idx >= totalRound) {
          setRevealReady(false);
          setSelectedId(Option.None());
        } else {
          setRevealReady(false);
          setSelectedId(Option.None());
        }
      });
      
      return nextIdx;
    });
  }, [totalRound]);

  const selectEventType = useCallback((et: EventType) => {
    setEventType(Option.Some(et));
  }, []);

  const value: GameContextType = useMemo(
    () => ({
      detailedEvents,
      currentPair,
      currentIndex: current,
      month: today.month,
      date: today.date,
      selectedId,
      points,
      gameStatus,
      eventType,
      selectEventType,
      handleCardClick,
      nextPair,
      nextGameReady: revealReady,
      smallerYear,
    }),
    [
      detailedEvents,
      currentPair,
      current,
      selectedId,
      points,
      gameStatus,
      eventType,
      selectEventType,
      handleCardClick,
      nextPair,
      revealReady,
      smallerYear,
      today.month,
      today.date,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
