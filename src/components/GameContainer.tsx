"use client";
import { useState, useEffect, useRef } from "react";
import EventService from "@/app/service/EventService";
import Option from "@/rust_prelude/option/Option";
import { FullEventImpl } from "@/models/event";
import EventDateImpl from "@/models/eventdate";
import GamePanel from "./GamePanel";

export default function GameContainer() {
  const [events, setEvents] = useState<FullEventImpl | null>(null);
  const { mutate, data: rawEvents, error, isLoading } = EventService.usePostEvent(EventDateImpl.today());
  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (rawEvents) {
      const newEvents = FullEventImpl.from(rawEvents);
      setEvents(newEvents);
      localStorage.setItem("todayEvent", JSON.stringify(rawEvents));
      return;
    }
    
    if (error) {
      console.error("Error fetching data:", error);
      setEvents(null);
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const storedEvents = Option.into(localStorage.getItem("todayEvent"));
    
    storedEvents.match({
      Some: (value) => {
        const parsed = FullEventImpl.fromJSON(value);
        parsed.match({
          Ok: (event) => {
            const today = new Date();
            const date = today.getDate();
            const month = today.toLocaleString("default", { month: "long" });
            if (event.date === date && event.month === month) {
              setEvents(event);
            } else {
              mutate(undefined as never);
            }
          },
          Err: (err) => {
            console.error("Error parsing cached events:", err);
            mutate(undefined as never);
          }
        });
      },
      None: () => {
        mutate(undefined as never);
      }
    });
  }, [rawEvents, error, mutate])


  return (
    <div className="w-full max-w-2xl">
      {isLoading ? (
        <p>Loading...</p>
      ) : events ? (
        <GamePanel events={events} />
      ) : (
        <p>Loading</p>
      )}
    </div>
  );
}