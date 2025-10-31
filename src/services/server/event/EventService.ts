
import Result from "@/lib/rust_prelude/result/Result";
import EventDateImpl from "@/lib/types/events/eventdate";
import { EventData, EventType } from "@/lib/types/common/database.types";
import EventDatabaseInstance, {
  NotFoundError,
  StaleDataError,
} from "@/services/server/event/EventDatabase";

import { PostgrestError } from "@supabase/supabase-js";
import { Pair } from "@/lib/types/common/pair";
import EventPayloadImpl, { EventPayload } from "@/lib/types/events/EventPayload";

const db = EventDatabaseInstance;

const count = 20;

const getEventPairsForDate = async (date: EventDateImpl, eventType: EventType): Promise<Result<Pair<EventPayload>[], PostgrestError | NotFoundError | StaleDataError>> => {
  const events = await db.getCluster(date, eventType, count);
  return events.match({
    Ok: (value) => {
      const payload = new EventPayloadImpl(value);
      return Result.Ok(payload.pair());
    },
    Err: (err) => {
      console.error(err);
      return Result.Err(err);
    }
  })
}

const getDetailEvents = async(ids: string[]): Promise<Result<EventData[], PostgrestError | NotFoundError | StaleDataError>> => {
  const events = await db.getEventsByIds(ids);
  return events.match({
    Ok: (value) => Result.Ok(value),
    Err: (err) => {
      console.error(err);
      return Result.Err(err);
    }
  });
};

const EventService = {
  getEventPairsForDate,
  getDetailEvents,
}

export default EventService;