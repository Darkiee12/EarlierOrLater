"use client";
import EventService from "@/hooks/event/useEvent";
import { EventType, Json } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { Pair } from "@/lib/types/common/pair";
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
import { PayloadImageSchema } from "@/lib/types/common";
import { ScoreCalculator } from "@/lib/game";

export interface TimeModeGameContextType extends BaseGameContextType {
  timeRemaining: number;
  totalTime: number;
  isLoadingNextPair: boolean;
  accuracy: number;
  fastestTime: number | null;
  averageTime: number;
}

const TimeModeGameContext = createContext<TimeModeGameContextType | undefined>(undefined);

export const useTimeModeGame = () => {
  const context = useContext(TimeModeGameContext);
  if (!context) {
    throw new Error("useTimeModeGame must be used within TimeModeGameProvider");
  }
  return context;
};

interface TimeModeGameProviderProps {
  children: ReactNode;
  initialTime?: number;
}

export const TimeModeGameProvider = ({
  children,
  initialTime = 60,
}: TimeModeGameProviderProps) => {
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(initialTime);
  const [totalTime] = useState<number>(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Game state
  const [eventType, setEventType] = useState<Option<EventType>>(Option.None());
  const [gameStatus, setGameStatus] = useState<GameStatusType>("lobby");
  const [points, setPoints] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [answers, setAnswers] = useState<Option<boolean>[]>([]);
  const currentQuestionIndexRef = useRef<number>(0);
  const hasScoredCurrentQuestionRef = useRef<boolean>(false);
  // Timing measurement variables:
  const questionStartTimesRef = useRef<Map<number, number>>(new Map()); // Used for AVERAGE & FASTEST
  const questionClickTimesRef = useRef<Map<number, number>>(new Map()); // Used for AVERAGE & FASTEST

  // Pair fetching state
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);
  const [currentPair, setCurrentPair] = useState<Option<Pair<EventPayload>>>(Option.None());
  const prevFetchTriggerRef = useRef<number>(0);

  const parseImage = useCallback((img: Json | null | undefined) => {
    if (!img) return null;
    const result = PayloadImageSchema.safeParse(img);
    return result.success ? result.data : null;
  }, []);

  const { data: fetchedPair, isLoading: isLoadingPair, isError: isErrorPair } = EventService.useGetRandomPair(
    eventType.unwrapOr("event"),
    fetchTrigger,
    eventType.isSome() && fetchTrigger > 0
  );

  const baseGame = useBaseGameLogic(currentPair, gameStatus);

  const selectEventType = useCallback(
    (et: EventType) => {
      setEventType(Option.Some(et));
      setGameStatus("loading");
      setPoints(0);
      setQuestionsAnswered(0);
      setAnswers([]);
      currentQuestionIndexRef.current = 0;
      hasScoredCurrentQuestionRef.current = false;
      questionStartTimesRef.current.clear();
      questionClickTimesRef.current.clear();
      setTimeRemaining(initialTime);
      setIsTimerRunning(false);
      setFetchTrigger(1);
    },
    [initialTime]
  );

  useEffect(() => {
    if (!isLoadingPair && fetchTrigger > 0 && fetchTrigger !== prevFetchTriggerRef.current) {
      prevFetchTriggerRef.current = fetchTrigger;

      if (fetchedPair.isSome()) {
        fetchedPair.ifSome((pair) => {
          const convertedPair: Pair<EventPayload> = {
            first: {
              id: pair[0].id,
              text: pair[0].text,
              title: pair[0].title,
              thumbnail: parseImage(pair[0].thumbnail),
              original_image: parseImage(pair[0].original_image),
              event_type: pair[0].event_type,
              day: 0,
              month: 0,
            },
            second: {
              id: pair[1].id,
              text: pair[1].text,
              title: pair[1].title,
              thumbnail: parseImage(pair[1].thumbnail),
              original_image: parseImage(pair[1].original_image),
              event_type: pair[1].event_type,
              day: 0,
              month: 0,
            },
          };

          setCurrentPair(Option.Some(convertedPair));

          if (gameStatus === "loading") {
            setGameStatus("ongoing");
            setIsTimerRunning(true);
            currentQuestionIndexRef.current = 0;
            hasScoredCurrentQuestionRef.current = false;
            // Set start time when first question pair is loaded (for AVERAGE & FASTEST)
            questionStartTimesRef.current.set(0, Date.now());
          } else if (gameStatus === "ongoing") {
            setIsTimerRunning(true);
            currentQuestionIndexRef.current = questionsAnswered;
            hasScoredCurrentQuestionRef.current = false;
            // Set start time when next question pair is loaded (for AVERAGE & FASTEST)
            questionStartTimesRef.current.set(questionsAnswered, Date.now());
          }
        });
      } else if (isErrorPair || fetchedPair.isNone()) {
        console.error("Failed to fetch random pair");
        setGameStatus("lobby");
        setFetchTrigger(0);
        prevFetchTriggerRef.current = 0;
      }
    }
  }, [fetchedPair, fetchTrigger, parseImage, gameStatus, isLoadingPair, isErrorPair, questionsAnswered]);

  useEffect(() => {
    if (isTimerRunning && gameStatus === "ongoing" && timeRemaining > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current !== null) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    } else {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [isTimerRunning, gameStatus, timeRemaining]);

  const calculateStats = useCallback(() => {
    const startTimes = questionStartTimesRef.current;
    const clickTimes = questionClickTimesRef.current;
    const totalQuestions = answers.length;
    
    if (totalQuestions === 0) {
      return { accuracy: 0, fastestTime: null, averageTime: 0 };
    }
    
    const correctCount = answers.filter(a => a.isSome() && a.unwrapOr(false)).length;
    const accuracy = (correctCount / totalQuestions) * 100;
    
    // Calculate time taken for each question
    const questionTimes: number[] = []; // All question times (for AVERAGE calculation)
    const correctTimes: number[] = []; // Only correct answer times (for FASTEST calculation)
    
    for (let i = 0; i < totalQuestions; i++) {
      const startTime = startTimes.get(i);
      const clickTime = clickTimes.get(i);
      
      if (startTime !== undefined && clickTime !== undefined) {
        const timeTaken = clickTime - startTime; // Time difference in milliseconds
        
        // AVERAGE TIME: Uses ALL question times (both correct and incorrect)
        questionTimes.push(timeTaken);
        
        const answer = answers[i];
        // FASTEST TIME: Uses ONLY correct answer times
        if (answer.isSome() && answer.unwrapOr(false)) {
          correctTimes.push(timeTaken);
        }
      }
    }
    
    // AVERAGE TIME calculation: Average of all question times
    const averageTime = questionTimes.length > 0
      ? questionTimes.reduce((sum, time) => sum + time, 0) / questionTimes.length
      : 0;
    
    // FASTEST TIME calculation: Minimum time from correct answers only
    const fastestTime = correctTimes.length > 0
      ? Math.min(...correctTimes)
      : null;
    
    return { accuracy, fastestTime, averageTime };
  }, [answers]);

  useEffect(() => {
    if (timeRemaining === 0 && gameStatus === "ongoing") {
      setIsTimerRunning(false);
      setGameStatus("finished");
      ScoreCalculator.saveBestScore(points);
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [timeRemaining, gameStatus, points]);

  useEffect(() => {
    if (
      gameStatus === "ongoing" &&
      baseGame.nextGameReady &&
      baseGame.selectedId.isSome() &&
      baseGame.currentDetailPair.isSome() &&
      !hasScoredCurrentQuestionRef.current
    ) {
      const questionIndex = currentQuestionIndexRef.current;
      
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
            while (newAnswers.length <= questionIndex) {
              newAnswers.push(Option.None());
            }
            newAnswers[questionIndex] = Option.Some(isCorrect);
            return newAnswers;
          });

          setQuestionsAnswered((prev) => prev + 1);
          hasScoredCurrentQuestionRef.current = true;
        });
      });
    }
  }, [
    gameStatus,
    baseGame.nextGameReady,
    baseGame.selectedId,
    baseGame.currentDetailPair,
    baseGame.earlier,
  ]);

  const handleCardClickWithTiming = useCallback((id: string) => {
    const questionIndex = currentQuestionIndexRef.current;
    // Set click time when user clicks (for AVERAGE & FASTEST)
    if (!questionClickTimesRef.current.has(questionIndex)) {
      questionClickTimesRef.current.set(questionIndex, Date.now());
    }
    baseGame.handleCardClick(id);
  }, [baseGame]);

  const nextPair = useCallback(() => {
    if (timeRemaining > 0) {
      setIsTimerRunning(false);
      baseGame.resetForNextPair();
      setCurrentPair(Option.None());
      const nextIndex = questionsAnswered;
      currentQuestionIndexRef.current = nextIndex;
      hasScoredCurrentQuestionRef.current = false;
      questionStartTimesRef.current.set(nextIndex, Date.now());
      setFetchTrigger((prev) => prev + 1);
    }
  }, [timeRemaining, baseGame, questionsAnswered]);

  const stats = useMemo(() => calculateStats(), [calculateStats]);

  const value: TimeModeGameContextType = useMemo(
    () => ({
      detailedEvents: baseGame.detailedEvents,
      currentPair,
      currentIndex: Option.Some(0),
      eventType,
      gameStatus,
      points,
      answers,
      selectedId: baseGame.selectedId,
      earlier: baseGame.earlier,
      nextGameReady: baseGame.nextGameReady,
      resultYear: baseGame.resultYear,
      resultEventId: baseGame.resultEventId,
      selectEventType,
      handleCardClick: handleCardClickWithTiming,
      nextPair,
      timeRemaining,
      totalTime,
      isLoadingNextPair: isLoadingPair && fetchTrigger > 0,
      accuracy: stats.accuracy,
      fastestTime: stats.fastestTime,
      averageTime: stats.averageTime,
    }),
    [
      baseGame.detailedEvents,
      baseGame.selectedId,
      baseGame.earlier,
      baseGame.nextGameReady,
      baseGame.resultYear,
      baseGame.resultEventId,
      handleCardClickWithTiming,
      currentPair,
      eventType,
      gameStatus,
      points,
      answers,
      selectEventType,
      nextPair,
      timeRemaining,
      totalTime,
      isLoadingPair,
      fetchTrigger,
      stats,
    ]
  );

  return (
    <TimeModeGameContext.Provider value={value}>
      {children}
    </TimeModeGameContext.Provider>
  );
};
