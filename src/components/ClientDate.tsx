"use client";
import { useState, useEffect, useCallback } from "react";
import EventService from "@/app/service/EventService";
import Option from "@/common/option";
import { FullEventImpl } from "@/models/event";

export default function ClientDate() {
  const [serverResponse, setServerResponse] = useState<string>("Loading...");
  const { mutate, data: events, error, isSuccess } = EventService.usePostEvent();
  
  const fetchData = useCallback(() => {
    mutate(undefined as never);
  }, [mutate]);

  useEffect(() => {
    const storedEvents = Option.into(localStorage.getItem("todayEvent"));
    storedEvents.match({
      Some: (value) => {
        const parsed = FullEventImpl.fromJSON(value);
        parsed.match({
          Ok: (event) => setServerResponse(event.date),
          Err: (err) => {
            console.error(err);
            fetchData();
          }
        });
      },
      None: () => {
        fetchData();
      }
    });
  }, [fetchData]);

  useEffect(() => {
    if (isSuccess && events) {
      setServerResponse(events.date);
      localStorage.setItem("todayEvent", JSON.stringify(events))
    }
  }, [isSuccess, events]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching data:", error);
      setServerResponse("Error fetching data");
    }
  }, [error])


  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <p className="text-lg font-medium">Message from Server:</p>
      <p className="text-2xl font-bold text-blue-600 mt-2">
        {serverResponse}
      </p>
    </div>

  );
}