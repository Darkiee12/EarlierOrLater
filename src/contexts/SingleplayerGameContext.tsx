"use client";
import EventService from "@/hooks/event/useEvent";
import { EventType } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/EventPayload";
import EventDateImpl from "@/lib/types/events/eventdate";
import { Pair } from "@/lib/types/common/pair";
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
import Option, { OptionExt } from "@/lib/rust_prelude/option";
import { PHASE_DURATION_SECONDS } from "@/common/constants";
import { GameEngine, ScoreCalculator } from "@/lib/game";
import { useGameTimer } from "@/hooks/game";
import { DetailedEventType } from "@/lib/types/events/DetailedEvent";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type GameStatusType = "loading" | "lobby" | "ongoing" | "finished";

interface SingleplayerGameContextType {
  // Game Data
  detailedEvents: Map<string, DetailedEventType>;
  currentPair: Option<Pair<EventPayload>>;
  currentIndex: Option<number>;
  eventType: Option<EventType>;

  // Game State
  gameStatus: GameStatusType;
  points: number;
  answers: Option<boolean>[];
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
  const [today] = useState(() => EventDateImpl.fullToday());
  const [eventType, setEventType] = useState<Option<EventType>>(Option.None());
  const [gameStatus, setGameStatus] = useState<GameStatusType>("lobby");

  // ---------------------------------------------------------------------------
  // State - Events & Data
  // ---------------------------------------------------------------------------
  const [partialEvents, setPartialEvents] = useState<Pair<EventPayload>[]>([]);
  const [detailedEvents, setDetailedEvents] = useState<
    Map<string, DetailedEventType>
  >(new Map());
  const detailedEventsRef = useRef<Map<string, DetailedEventType>>(new Map());

  // ---------------------------------------------------------------------------
  // State - Game Progress
  // ---------------------------------------------------------------------------
  const [current, setCurrent] = useState<Option<number>>(Option.Some(0));
  const [points, setPoints] = useState<number>(0);
  const [answers, setAnswers] = useState<Option<boolean>[]>([]);
  const [selectedId, setSelectedId] = useState<Option<string>>(Option.None());
  const [earlier, setEarlier] = useState<boolean>(true);
  const [revealReady, setRevealReady] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const scoredRoundsRef = useRef<Set<number>>(new Set());

  // ---------------------------------------------------------------------------
  // Hooks - Client-side
  // ---------------------------------------------------------------------------
  const { startTimers, clearTimers } = useGameTimer();

  // ---------------------------------------------------------------------------
  // API Hooks
  // ---------------------------------------------------------------------------
  const { data: events } = EventService.useGetEventPairs(
    today.date,
    today.month,
    today.year,
    eventType.unwrapOr("event"),
    eventType.isSome()
  );

  const totalRound = useMemo(() => partialEvents.length, [partialEvents]);

  const currentIndex = current.unwrapOr(-1);

  const currentPair: Option<Pair<EventPayload>> = useMemo(
    () =>
      currentIndex >= 0 && currentIndex < totalRound
        ? Option.Some(partialEvents[currentIndex])
        : Option.None(),
    [currentIndex, partialEvents, totalRound]
  );

  const requestedEventIds = useMemo(() => {
    return currentPair.map((p) => [p.first.id, p.second.id]).unwrapOr([]);
  }, [currentPair]);

  const hasSelection = useMemo(() => selectedId.isSome(), [selectedId]);

  const currentDetailPair = useMemo<
    Option<[DetailedEventType, DetailedEventType]>
  >(() => {
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
    return currentDetailPair.andThen(([first, second]) => {
      const year = ScoreCalculator.getResultYear(first, second, earlier);
      return year !== null ? Option.Some(year) : Option.None();
    });
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

  useEffect(() => {
    eventType.ifSome(() => {
      setGameStatus("loading");
      setPartialEvents([]);
    });
  }, [eventType]);

  useEffect(() => {
    events.ifSomeWithPredicate(
      (evs) => evs.length > 0 && gameStatus === "loading",
      (evs) => {
        setPartialEvents(evs);
        setAnswers(Array(evs.length).fill(Option.None()));
        setGameStatus("ongoing");
        scoredRoundsRef.current = new Set();
        setRevealReady(false);
        setEarlier(GameEngine.generateRandomBoolean());
        clearTimers();
      }
    );
  }, [events, clearTimers, gameStatus]);

  useEffect(() => {
    current.ifSomeWithPredicate(
      (idx) =>
        gameStatus === "ongoing" && GameEngine.isGameFinished(idx, totalRound),
      () => {
        setGameStatus("finished");
        ScoreCalculator.saveBestScore(points);
        clearTimers();
      }
    );
  }, [current, gameStatus, totalRound, clearTimers, points]);

  // ---------------------------------------------------------------------------
  // Effects - Data Management
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!fetchedDetailEvents) return;

    setDetailedEvents((prev) => {
      let changed = false;
      const newMap: Map<string, DetailedEventType> = new Map(prev);
      for (const ev of fetchedDetailEvents.unwrapOr([])) {
        
        const existing = newMap.get(ev.id);
        if (!existing) {
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
                  setAnswers((prevAnswers) => {
                    const newAnswers = [...prevAnswers];
                    newAnswers[current] = Option.Some(true);
                    return newAnswers;
                  });
                } else{
                  setAnswers((prevAnswers) => {
                    const newAnswers = [...prevAnswers];
                    newAnswers[current] = Option.Some(false);
                    return newAnswers;
                  });
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

  useEffect(() => {
    detailedEventsRef.current = detailedEvents;
  }, [detailedEvents]);

  const value: SingleplayerGameContextType = useMemo(
    () => ({
      detailedEvents: detailedEventsRef.current,
      currentPair,
      currentIndex: current,
      month: today.month,
      date: today.date,
      selectedId,
      points,
      answers,
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
      currentPair,
      current,
      selectedId,
      points,
      answers,
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
