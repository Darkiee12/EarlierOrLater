"use client";
import EventService from "@/hooks/event/useEvent";
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
import { GameEngine, ScoreCalculator } from "@/lib/game";
import { useGameTimer } from "@/hooks/game";
import OptionExt from "@/lib/rust_prelude/option/OptionExt";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type GameStatusType = "loading" | "lobby" | "ongoing" | "finished";

interface SingleplayerGameContextType {
  // Game Data
  detailedEvents: Map<string, EventData>;
  currentPair: Option<Pair<EventPayload>>;
  currentIndex: Option<number>;
  eventType: Option<EventType>;

  // Game State
  gameStatus: GameStatusType;
  points: number;
  selectedId: Option<string>;
  earlier: boolean;
  nextGameReady: boolean;
  resultYear: Option<number>;

  // Game Info
  month: number;
  date: number;

  // Actions
  selectEventType: (eventType: EventType) => void;
  handleCardClick: (selectedId: string) => void;
  nextPair: () => void;
}

interface SingleplayerGameProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXT & HOOKS
// ============================================================================

const SingleplayerGameContext = createContext<
  SingleplayerGameContextType | undefined
>(undefined);

export const useSingleplayerGame = () => {
  const context = useContext(SingleplayerGameContext);
  if (!context) {
    throw new Error(
      "useSingleplayerGame must be used within SingleplayerGameProvider"
    );
  }
  return context;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const SingleplayerGameProvider = ({
  children,
}: SingleplayerGameProviderProps) => {
  // ---------------------------------------------------------------------------
  // State - Game Configuration
  // ---------------------------------------------------------------------------
  const [today] = useState(() => EventDateImpl.today());
  const [eventType, setEventType] = useState<Option<EventType>>(Option.None());
  const [gameStatus, setGameStatus] = useState<GameStatusType>("lobby");

  // ---------------------------------------------------------------------------
  // State - Events & Data
  // ---------------------------------------------------------------------------
  const [partialEvents, setPartialEvents] = useState<Pair<EventPayload>[]>([]);
  const [detailedEvents, setDetailedEvents] = useState<Map<string, EventData>>(
    new Map()
  );

  // ---------------------------------------------------------------------------
  // State - Game Progress
  // ---------------------------------------------------------------------------
  const [current, setCurrent] = useState<Option<number>>(Option.Some(0));
  const [points, setPoints] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<Option<string>>(Option.None());
  const [earlier, setEarlier] = useState<boolean>(true);
  const [revealReady, setRevealReady] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const scoredRoundsRef = useRef<Set<number>>(new Set());
  const hasPreFetchedRef = useRef<boolean>(false);

  // ---------------------------------------------------------------------------
  // Hooks - Client-side
  // ---------------------------------------------------------------------------
  const { startTimers, clearTimers } = useGameTimer();

  // ---------------------------------------------------------------------------
  // API Hooks
  // ---------------------------------------------------------------------------
  const { mutate: getEvents, data: events } = EventService.usePostEvent(today);

  // ---------------------------------------------------------------------------
  // Effects - Pre-fetch Optimization
  // ---------------------------------------------------------------------------
  
  // Pre-fetch data when component mounts to optimize load time
  // This silently triggers API to check/fetch data without affecting game state
  useEffect(() => {
    // Guard: Only run once per component lifetime
    if (hasPreFetchedRef.current) {
      return;
    }

    const preFetchData = async () => {
      try {
        // Silently call the API for all event types to warm up the cache
        // This doesn't set any state, just ensures data is in the database
        const fetchPromises = [
          fetch("/api/date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              month: today.month,
              date: today.date,
              eventType: "event",
            }),
          }),
          fetch("/api/date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              month: today.month,
              date: today.date,
              eventType: "birth",
            }),
          }),
          fetch("/api/date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              month: today.month,
              date: today.date,
              eventType: "death",
            }),
          }),
        ];
        
        await Promise.allSettled(fetchPromises);
      } catch {
        console.log("Pre-fetch completed with background fetch");
      }
    };

    hasPreFetchedRef.current = true;
    preFetchData();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run once on mount with initial values

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------
  const totalRound = useMemo(() => partialEvents.length, [partialEvents]);

  const currentPair: Option<Pair<EventPayload>> = useMemo(
    () =>
      current.andThen((idx) =>
        idx < totalRound ? Option.Some(partialEvents[idx]) : Option.None()
      ),
    [current, partialEvents, totalRound]
  );

  const requestedEventIds = useMemo(
    () =>
      currentPair.map((pair) => [pair.first.id, pair.second.id]).unwrapOr([]),
    [currentPair]
  );

  const hasSelection = useMemo(() => selectedId.isSome(), [selectedId]);

  const currentDetailPair = useMemo<Option<[EventData, EventData]>>(() => {
    return currentPair.andThen((pair) =>
      OptionExt.match2({
        opt1: detailedEvents.get(pair.first.id),
        opt2: detailedEvents.get(pair.second.id),
        cases: {
          SomeSome: (f, s) => Option.Some([f, s]),
          _: () => Option.None(),
        },
      })
    );
  }, [currentPair, detailedEvents]);
  const resultYear = useMemo(() => {
    return currentDetailPair.map(([f, s]) =>
      ScoreCalculator.getResultYear(f, s, earlier)
    );
  }, [currentDetailPair, earlier]);

  // ---------------------------------------------------------------------------
  // API Hooks (Dependent)
  // ---------------------------------------------------------------------------
  const { data: fetchedDetailEvents } = EventService.useGetDetailedEvents(
    requestedEventIds,
    hasSelection && requestedEventIds.length > 0
  );

  // ---------------------------------------------------------------------------
  // Effects - Game Lifecycle
  // ---------------------------------------------------------------------------

  // Set game status to loading when event type is selected
  useEffect(() => {
    eventType.ifSome(() => setGameStatus("loading"));
  }, [eventType]);

  // Fetch events when event type is selected
  useEffect(() => {
    eventType.ifSome((et) => {
      getEvents({
        month: today.month,
        date: today.date,
        eventType: et,
      });
    });
  }, [eventType, getEvents, today.month, today.date]);

  // Initialize game when events are loaded
  useEffect(() => {
    if (events) {
      setPartialEvents(events);
      setGameStatus("ongoing");
      scoredRoundsRef.current = new Set();
      setRevealReady(false);
      setEarlier(GameEngine.generateRandomBoolean());
      clearTimers();
    }
  }, [events, clearTimers]);

  // Check if game is finished
  useEffect(() => {
    current.ifSome((idx) => {
      if (
        gameStatus === "ongoing" &&
        GameEngine.isGameFinished(idx, totalRound)
      ) {
        setGameStatus("finished");
        ScoreCalculator.saveBestScore(points);
        clearTimers();
      }
    });
  }, [current, gameStatus, totalRound, clearTimers, points]);

  // ---------------------------------------------------------------------------
  // Effects - Data Management
  // ---------------------------------------------------------------------------

  // Update detailed events when fetched
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

  // ---------------------------------------------------------------------------
  // Effects - Game Timing & Scoring
  // ---------------------------------------------------------------------------

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

      const handleScore = () => {
        OptionExt.ifSome2({
          opt1: selectedId,
          opt2: current,
          handlers: (selectedId, current) => {
            if (GameEngine.canScoreRound(current, scoredRoundsRef.current)) {
              currentDetailPair.ifSome(([f, s]) => {
                const isCorrect = ScoreCalculator.isCorrectSelection(
                  f,
                  s,
                  selectedId,
                  earlier
                );

                if (isCorrect) {
                  setPoints((prevPoints) => prevPoints + 1);
                }

                GameEngine.markRoundAsScored(current, scoredRoundsRef.current);
              });
            }
          },
        });
      };

      startTimers(delay, handleReveal, handleScore);
    }

    return () => {
      clearTimers();
    };
  }, [
    selectedId,
    currentDetailPair,
    current,
    gameStatus,
    earlier,
    startTimers,
    clearTimers,
  ]);

  // ---------------------------------------------------------------------------
  // Callbacks - User Actions
  // ---------------------------------------------------------------------------

  const handleCardClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev.isSome() ? prev : Option.Some(id)));
  }, []);

  const selectEventType = useCallback((et: EventType) => {
    setEventType(Option.Some(et));
  }, []);

  const nextPair = useCallback(() => {
    clearTimers();

    // Reset UI state
    setRevealReady(false);
    setSelectedId(Option.None());

    // Move to next round and randomize
    setCurrent((prev) => prev.map((c) => c + 1));
    setEarlier(GameEngine.generateRandomBoolean());
  }, [clearTimers]);

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const value: SingleplayerGameContextType = useMemo(
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
      resultYear,
      earlier,
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
      resultYear,
      today.month,
      today.date,
      earlier,
    ]
  );

  return (
    <SingleplayerGameContext.Provider value={value}>
      {children}
    </SingleplayerGameContext.Provider>
  );
};
