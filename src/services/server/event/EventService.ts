import Result from "@/lib/rust_prelude/result";
import EventDateImpl from "@/lib/types/events/eventdate";
import { EventData, EventType } from "@/lib/types/common/database.types";
import EventDatabaseInstance, {
  NotFoundError,
  StaleDataError,
} from "@/services/server/event/EventDatabase";

import { PostgrestError } from "@supabase/supabase-js";
import { Pair } from "@/lib/types/common/pair";
import EventPayloadImpl, {
  EventPayload,
} from "@/lib/types/events/EventPayload";
import RNG from "@/services/server/util/rng";
import ResultExt from "@/lib/rust_prelude/result/ResultExt";

const db = EventDatabaseInstance;

const count = 20;

const getRandomEvents = async (
  eventType: EventType
): Promise<
  Result<Pair<EventPayload>[], PostgrestError | NotFoundError | StaleDataError>
> => {
  const events = await db.getCluster(eventType, count);
  return events.match({
    Ok: (value) => {
      const payload = new EventPayloadImpl(
        value.sort((a, b) => a.year - b.year)
      );
      return Result.Ok(payload.pair());
    },
    Err: (err) => {
      console.error(err);
      return Result.Err(err);
    },
  });
};

const getDetailEvents = async (
  ids: string[]
): Promise<
  Result<EventData[], PostgrestError | NotFoundError | StaleDataError>
> => {
  const events = await db.getEventsByIds(ids);
  return events.match({
    Ok: (value) => Result.Ok(value),
    Err: (err) => {
      console.error(err);
      return Result.Err(err);
    },
  });
};

const getEventsByDate = async (
  date: {
    day: number;
    month: number;
    year: number;
  },
  eventType: EventType
): Promise<
  Result<Pair<EventPayload>[], PostgrestError | NotFoundError | StaleDataError>
> => {
  const data: Result<
    Pair<EventPayload>[],
    PostgrestError | NotFoundError | StaleDataError
  > = await ResultExt.propagateAsync(async () => {
    const count = (
      await db.count({ day: date.day, month: date.month }, eventType)
    ).$();
    if (count === 0) {
      throw new NotFoundError(
        `No events found for day: ${date.day}, month: ${date.month}, event_type: ${eventType}`
      );
    }
    const seed = RNG.generateSeedFromDate(
      `${date.day}${date.month}${date.year}`,
      0,
      count
    );
    const rows = RNG.generateDistinctIndices(seed, 1, count - 1, 20);
    const partialEvents = (
      await db.getPartialEventListFromDate(
        date.day,
        date.month,
        eventType,
        rows
      )
    ).$();
    const payload = new EventPayloadImpl(partialEvents);
    return payload.pair();
  });

  return data.match({
    Ok: (value) => Result.Ok(value),
    Err(error) {
      console.error(error);
      return Result.Err(error);
    },
  });
};

const EventService = {
  getRandomEvents,
  getDetailEvents,
  getEventsByDate,
};

export default EventService;
