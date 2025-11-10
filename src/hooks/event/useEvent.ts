
import { useGet, usePost } from "@/hooks/common";
import { EventData, EventType } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { Pair } from "@/lib/types/common/pair";
import EventDateImpl from "@/lib/types/events/eventdate";
import DetailedEvent, {DetailedEventType} from "@/lib/types/events/DetailedEvent";
type Payload = {
  month: number;
  date: number;
  eventType: EventType;
}

const useGetEventPairs = (day: number, month: number, year: number, eventType: EventType, enable = true) => {
  const queryKey = ["event_pairs", day.toString(), month.toString(), eventType];
  const params = new URLSearchParams({
    day: day.toString(),
    month: month.toString(),
    year: year.toString(),
    eventType: eventType,
  });
  
  return useGet<string, Pair<EventPayload>[]>(
    queryKey,
    {
      url: `/api/date?${params.toString()}`,
    },
    enable
  );
};

const usePostEvent = (date: EventDateImpl) => {
  const queryKey = [date.month, date.date];
  const header = { "Content-Type": "application/json" };

  return usePost<number, Payload , Pair<EventPayload>[]>(queryKey, {
    url: "/api/date",
    config: { headers: header },
  });
};


const postProcess = (data: EventData[]): DetailedEventType[] => {
  return data.map((e) => DetailedEvent.from(e));
}

const useGetDetailedEvents = (ids: string[], enable: boolean) => {
  const queryKey = ["detailed_events", ...ids];
  const idsParam = ids.join(",");
  return useGet<string, EventData[], DetailedEventType[]>(
    queryKey,
    {
      "url": `/api/event/${encodeURIComponent(idsParam)}`,
    },
    enable,
    postProcess
  );
}

const useGetRandomEvents = (eventType: EventType, enable = true) => {
  const queryKey = ["random_events", eventType];
  const params = new URLSearchParams({
    eventType: eventType,
  });
  
  return useGet<string, Pair<EventPayload>[]>(
    queryKey,
    {
      url: `/api/event/random?${params.toString()}`,
    },
    enable
  );
};


const EventService = { useGetEventPairs, usePostEvent, useGetDetailedEvents, useGetRandomEvents };
export default EventService;
