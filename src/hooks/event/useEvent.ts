
import { useGet, usePost } from "@/hooks/common";
import { EventData, EventType } from "@/lib/types/common/database.types";
import { EventPayload } from "@/lib/types/events/event-payload";
import { Pair } from "@/lib/types/events/pairevent";
import EventDateImpl from "@/lib/types/events/eventdate";
type Payload = {
  month: number;
  date: number;
  eventType: EventType;
}
const usePostEvent = (date: EventDateImpl) => {
  const queryKey = [date.month, date.date];
  const header = { "Content-Type": "application/json" };

  return usePost<number, Payload , Pair<EventPayload>[]>(queryKey, {
    url: "/api/date",
    config: { headers: header },
  });
};

const useGetDetailedEvents = (ids: string[], enable: boolean) => {
  const queryKey = ["detailed_events", ...ids];
  const idsParam = ids.join(",");
  return useGet<string, EventData[]>(
    queryKey,
    {
      "url": `/api/event/${encodeURIComponent(idsParam)}`,
    },
    enable
  );
}


const EventService = { usePostEvent, useGetDetailedEvents };
export default EventService;
