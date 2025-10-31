import axios from "axios";
import Option from "@/lib/rust_prelude/option/Option";
import Result from "@/lib/rust_prelude/result/result";
import EventDateImpl from "@/lib/types/events/eventdate";
import { EventData } from "@/lib/types/common/database.types";
import EventDatabaseInstance, {
  NotFoundError,
  StaleDataError,
} from "@/services/server/event/EventDatabase";
import {
  transformEvents,
  transformToWikipediaEvent,
  normalizeWikiUrl,
} from "@/lib/util/EventProcess";
import { FullEvent } from "@/lib/types/events/event";
import { PostgrestError } from "@supabase/supabase-js";
import EventPayloadImpl, {
  EventPayload,
} from "@/lib/types/events/event-payload";
import { Pair } from "@/lib/types/events/pairevent";

class EventService {
  private static _instance: EventService | null = null;
  private apiBaseUrl: URL;

  private constructor() {
    this.apiBaseUrl = Option.into(process.env.API)
      .map((url) => new URL(url.trim()))
      .expect("Missing API base URL configuration");
  }

  static get instance(): EventService {
    if (!this._instance) this._instance = new EventService();
    return this._instance;
  }

  // Public API
  async getDetailEvents(
    ids: string[]
  ): Promise<Result<EventData[], PostgrestError | NotFoundError>> {
    return EventDatabaseInstance.getDetailEvents(ids);
  }

  async getOnThisDayData(
    eventDate: EventDateImpl
  ): Promise<Result<FullEvent, PostgrestError | NotFoundError>> {
    // fetch raw rows by type and map to WikipediaEvent shape
    const [eventsR, birthsR, deathsR] = await Promise.all([
      EventDatabaseInstance.getContentForDateAndType(eventDate, "event"),
      EventDatabaseInstance.getContentForDateAndType(eventDate, "birth"),
      EventDatabaseInstance.getContentForDateAndType(eventDate, "death"),
    ]);

    if (eventsR.isErr()) return Result.Err(eventsR.value() as PostgrestError);
    if (birthsR.isErr()) return Result.Err(birthsR.value() as PostgrestError);
    if (deathsR.isErr()) return Result.Err(deathsR.value() as PostgrestError);

    const wikipediaData: FullEvent = {
      events: transformToWikipediaEvent(eventsR.unwrap()),
      births: transformToWikipediaEvent(birthsR.unwrap()),
      deaths: transformToWikipediaEvent(deathsR.unwrap()),
    };
    return Result.Ok(wikipediaData);
  }

  async getEventPairsForDate(
    eventDate: EventDateImpl,
    count = 20
  ): Promise<
    Result<Pair<EventPayload>[], PostgrestError | StaleDataError | Error>
  > {
    const metaResult = await EventDatabaseInstance.getMetadata(eventDate);
    if (metaResult.isOk()) {
      const { fetching } = metaResult.unwrap();
      if (fetching === "available") {
        const cluster = await EventDatabaseInstance.getCluster(
          eventDate,
          "event",
          count
        );
        if (cluster.isErr())
          return Result.Err(cluster.value() as PostgrestError | NotFoundError);
        const payload = new EventPayloadImpl(cluster.unwrap());
        return Result.Ok(payload.pair());
      }
      if (fetching === "ongoing") {
        return Result.Err(
          new StaleDataError("Data fetch in progress. Please retry later.")
        );
      }
      const stored = await this.fetchAndStore(eventDate);
      if (stored.isErr())
        return Result.Err(
          stored.value() as PostgrestError | StaleDataError | Error
        );
      const cluster = await EventDatabaseInstance.getCluster(
        eventDate,
        "event",
        count
      );
      if (cluster.isErr())
        return Result.Err(cluster.value() as PostgrestError | NotFoundError);
      const payload = new EventPayloadImpl(cluster.unwrap());
      return Result.Ok(payload.pair());
    }

    // On metadata error: if NotFound -> fetch & store, else propagate
    const metaErr = metaResult.value() as PostgrestError | NotFoundError;
    if (metaErr instanceof NotFoundError) {
      const stored = await this.fetchAndStore(eventDate);
      if (stored.isErr())
        return Result.Err(
          stored.value() as PostgrestError | StaleDataError | Error
        );
      const cluster = await EventDatabaseInstance.getCluster(
        eventDate,
        "event",
        count
      );
      if (cluster.isErr())
        return Result.Err(cluster.value() as PostgrestError | NotFoundError);
      const payload = new EventPayloadImpl(cluster.unwrap());
      return Result.Ok(payload.pair());
    }
    return Result.Err(metaErr);
  }

  private async fetchAndStore(
    eventDate: EventDateImpl
  ): Promise<Result<void, PostgrestError | StaleDataError | Error>> {
    const acquired = await EventDatabaseInstance.beginFetch(eventDate);
    if (!acquired) {
      return Result.Err(
        new StaleDataError("Data is being updated by another process.")
      );
    }

    const month = eventDate.month.toString().padStart(2, "0");
    const day = eventDate.date.toString().padStart(2, "0");
    const externalUrl = new URL(this.apiBaseUrl.toString());
    externalUrl.pathname = `/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;

    try {
      const response = await axios.get<FullEvent>(externalUrl.toString());
      const apiData = response.data;

      const allTransformed = [
        ...transformEvents(
          apiData.events,
          "event",
          eventDate.date,
          eventDate.month
        ),
        ...transformEvents(
          apiData.births,
          "birth",
          eventDate.date,
          eventDate.month
        ),
        ...transformEvents(
          apiData.deaths,
          "death",
          eventDate.date,
          eventDate.month
        ),
      ];

      // fetch existing rows for that date to avoid re-inserting duplicates
      const existingR = await EventDatabaseInstance.getContentForDate(
        eventDate
      );
      if (existingR.isErr()) {
        await EventDatabaseInstance.endFetch(eventDate, "not_available");
        return Result.Err(existingR.value() as PostgrestError);
      }
      const existing = existingR.unwrap();
      const existingKeySet = new Set<string>();
      for (const row of existing) {
        const cu = row.content_urls as unknown as { desktop?: string };
        const durl = normalizeWikiUrl(cu?.desktop) ?? cu?.desktop;
        if (durl) {
          existingKeySet.add(
            `${row.day}-${row.month}-${row.year}-${row.event_type}-${durl}`
          );
        }
      }

      const toInsert = allTransformed.filter((e) => {
        const durl =
          normalizeWikiUrl(e.content_urls.desktop) ?? e.content_urls.desktop;
        const key = `${e.day}-${e.month}-${e.year}-${e.event_type}-${durl}`;
        return !existingKeySet.has(key);
      });

      const ins = await EventDatabaseInstance.insertEvents(
        toInsert as unknown as Array<
          import("@/lib/types/common/database.types").Database["events"]["Tables"]["content"]["Insert"]
        >
      );
      if (ins.isErr()) {
        await EventDatabaseInstance.endFetch(eventDate, "not_available");
        return Result.Err(ins.value() as PostgrestError);
      }

      const upd = await EventDatabaseInstance.updateLastApiUpdate(
        eventDate,
        Date.now()
      );
      if (upd.isErr()) {
        await EventDatabaseInstance.endFetch(eventDate, "not_available");
        return Result.Err(upd.value() as PostgrestError);
      }

      await EventDatabaseInstance.endFetch(eventDate, "available");
      return Result.Ok(void 0);
    } catch (e: unknown) {
      await EventDatabaseInstance.endFetch(eventDate, "not_available");
      const err = e instanceof Error ? e : new Error("External API error");
      return Result.Err(err);
    }
  }
}

const EventServiceInstance = EventService.instance;
export default EventServiceInstance;
export { EventService };
