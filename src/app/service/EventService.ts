
import EventDateImpl from "@/models/eventdate";
import { FullEvent } from "@/models/event";
import { usePost } from "@/app/hooks";

const usePostEvent = () => {
  const clientDate = EventDateImpl.today();
  const queryKey = [clientDate.month, clientDate.date];
  const header = {
    "Content-Type": "application/json",
  };
  const payload = clientDate.toJSON();
  return usePost<number, typeof payload, FullEvent>(queryKey, {
    url: "/api/date",
    payload: payload,
    config: { headers: header },
  });
};

const EventService = {
  usePostEvent,
};

export default EventService;
