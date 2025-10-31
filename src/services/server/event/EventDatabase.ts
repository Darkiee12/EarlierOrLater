import { createClient, PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { Database, EventData, EventType } from "@/lib/types/common/database.types";
import Option from "@/lib/rust_prelude/option/Option";
import Result from "@/lib/rust_prelude/result/result";
import EventDateImpl from "@/lib/types/events/eventdate";
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class StaleDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaleDataError";
  }
}

const SUPABASE_URL = Option.into(process.env.SUPABASE_URL).expect(
  "Supabase URL is not defined in .env"
);

const SUPABASE_SERVICE_ROLE_KEY = Option.into(
  process.env.SUPABASE_SERVICE_ROLE_KEY
).expect("Supabase Service Role Key is not defined in .env");

class EventDatabase {
  private supabase: SupabaseClient<Database>;
  private static _instance: EventDatabase | null = null;

  private constructor() {
    this.supabase = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: "events",
        },
      }
    );
  }

  static createInstance(): EventDatabase {
    if (this._instance === null) {
      this._instance = new EventDatabase();
    }
    return this._instance;
  }

  // Metadata accessors
  public async getMetadata(eventDate: EventDateImpl): Promise<
    Result<
      {
        last_api_update: number;
        fetching: "ongoing" | "available" | "not_available" | null;
        date_string: string;
      },
      PostgrestError | NotFoundError
    >
  > {
    const { month, date: day } = eventDate;
    const { data, error } = await this.supabase
      .from("metadata")
      .select("last_api_update, fetching, date_string")
      .eq("month", month)
      .eq("day", day)
      .single();

    if (error) {
      return Result.Err(error);
    }
    if (!data) {
      return Result.Err(
        new NotFoundError(`No metadata found for date: ${month}-${day}`)
      );
    }
    return Result.Ok(data);
  }

  // Concurrency helpers kept at DB layer
  public async beginFetch(eventDate: EventDateImpl): Promise<boolean> {
    const { month, date: day } = eventDate;
    const upd1 = await this.supabase
      .from("metadata")
      .update({ fetching: "ongoing" })
      .eq("month", month)
      .eq("day", day)
      .in("fetching", ["available", "not_available"] as const)
      .select("month,day");

    if (upd1.error) {
      console.error("Error acquiring lock:", upd1.error.message);
      return false;
    }
    if (Array.isArray(upd1.data) && upd1.data.length === 1) {
      return true;
    }

    const upd2 = await this.supabase
      .from("metadata")
      .update({ fetching: "ongoing" })
      .eq("month", month)
      .eq("day", day)
      .is("fetching", null)
      .select("month,day");

    if (upd2.error) {
      console.error("Error acquiring lock (null state):", upd2.error.message);
      return false;
    }
    if (Array.isArray(upd2.data) && upd2.data.length === 1) {
      return true;
    }

    const date_string = `${month}-${day}`;
    const insertRes = await this.supabase
      .from("metadata")
      .insert({ month, day, date_string, fetching: "ongoing" })
      .select("month,day");

    if (insertRes.error) {
      console.error(
        "Error inserting metadata for lock:",
        insertRes.error.message
      );
      return false;
    }
    return Array.isArray(insertRes.data) && insertRes.data.length === 1;
  }

  public async endFetch(
    eventDate: EventDateImpl,
    status: "available" | "not_available" = "available"
  ): Promise<void> {
    const { month, date: day } = eventDate;
    await this.supabase
      .from("metadata")
      .update({ fetching: status })
      .eq("month", month)
      .eq("day", day);
  }
  // Content accessors (no business transforms)
  public async getContentForDate(
    eventDate: EventDateImpl
  ): Promise<Result<EventData[], PostgrestError>> {
    const { month, date: day } = eventDate;
    const { data, error } = await this.supabase
      .from("content")
      .select("*")
      .eq("month", month)
      .eq("day", day);
    if (error) return Result.Err(error);
    return Result.Ok((data ?? []) as EventData[]);
  }

  public async getContentForDateAndType(
    eventDate: EventDateImpl,
    type: EventType
  ): Promise<Result<EventData[], PostgrestError>> {
    const { month, date: day } = eventDate;
    const { data, error } = await this.supabase
      .from("content")
      .select("*")
      .eq("month", month)
      .eq("day", day)
      .eq("event_type", type);
    if (error) return Result.Err(error);
    return Result.Ok((data ?? []) as EventData[]);
  }

  public async insertEvents(
    events: Database["events"]["Tables"]["content"]["Insert"][]
  ): Promise<Result<void, PostgrestError>> {
    const { error } = await this.supabase.rpc("insert_events", {
      p_events: events,
    });
    if (error) return Result.Err(error);
    return Result.Ok(void 0);
  }

  public async updateLastApiUpdate(
    eventDate: EventDateImpl,
    timestamp: number
  ): Promise<Result<void, PostgrestError>> {
    const { month, date: day } = eventDate;
    const { error } = await this.supabase
      .from("metadata")
      .update({ last_api_update: timestamp })
      .eq("month", month)
      .eq("day", day);
    if (error) return Result.Err(error);
    return Result.Ok(void 0);
  }

  public async getCluster(
    date: EventDateImpl,
    event_type: EventType,
    count: number,
    range?: number
  ): Promise<Result<EventData[], PostgrestError | NotFoundError>> {
    const { data, error } = await this.supabase.rpc("random_cluster", {
      p_day: date.date,
      p_month: date.month,
      p_event_type: event_type,
      p_num_items: count,
      p_range: range,
    });
    if (error) {
      return Result.Err(error);
    }
    if (!data || data.length === 0) {
      return Result.Err(
        new NotFoundError(
          `No cluster found with count: ${count} and range: ${range}`
        )
      );
    }
    return Result.Ok(data as EventData[]);
  }

  public async getDetailEvents(
    eventIds: string[]
  ): Promise<Result<EventData[], PostgrestError | NotFoundError>> {
    const { data, error } = await this.supabase
      .from("content")
      .select("*")
      .in("id", eventIds);
    if (error) {
      return Result.Err(error);
    }
    if (!data || data.length === 0) {
      return Result.Err(
        new NotFoundError(
          `No detail events found for IDs: ${eventIds.join(", ")}`
        )
      );
    }
    return Result.Ok(data);
  }
}

const EventDatabaseInstance = EventDatabase.createInstance();
export default EventDatabaseInstance;
