import {
  createClient,
  PostgrestError,
  SupabaseClient,
} from "@supabase/supabase-js";
import {
  Database,
  EventData,
  EventType,
} from "@/lib/types/common/database.types";
import Option from "@/lib/rust_prelude/option";
import Result from "@/lib/rust_prelude/result";
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

  public async getCluster(
    event_type: EventType,
    count: number,
    range?: number
  ): Promise<Result<EventData[], PostgrestError | NotFoundError>> {
    const { data, error } = await this.supabase.rpc("random_cluster_v6", {
      p_event_type: event_type,
      p_num_items: count,
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

  public async getEventById(
    eventId: string
  ): Promise<Result<EventData, PostgrestError | NotFoundError>> {
    const { data, error } = await this.supabase
      .from("content")
      .select("*")
      .eq("id", eventId)
      .single();
    if (error) {
      return Result.Err(error);
    }
    if (!data) {
      return Result.Err(
        new NotFoundError(`No event found with ID: ${eventId}`)
      );
    }
    return Result.Ok(data);
  }

  public async getEventsByIds(
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

  public async getPartialEventListFromDate(
    day: number,
    month: number,
    event_type: EventType,
    rows: number[],
  ): Promise<Result<EventData[], PostgrestError | NotFoundError>> {  
    const { data, error: dataError } = await this.supabase.rpc(
      "get_events_by_row_numbers",
      {
        p_day: day,
        p_month: month,
        p_event_type: event_type,
        p_indices: rows,
      }
    );

    if (dataError) {
      return Result.Err(dataError);
    }

    if (!data || data.length === 0) {
      return Result.Err(
        new NotFoundError(
          `No events found for indices at day: ${day}, month: ${month}, event_type: ${event_type}`
        )
      );
    }

    return Result.Ok(data as EventData[]);
  }

  public async count(date: {day: number, month: number}, event_type: EventType): Promise<Result<number, PostgrestError>> {
    const { count, error } = await this.supabase
      .from("content")
      .select("*", { count: "exact" })
      .filter("month", "eq", date.month)
      .filter("day", "eq", date.day)
      .filter("event_type", "eq", event_type);
      
    if (error) {
      return Result.Err(error);
    }
    return Result.Ok(count ?? 0);
  }

}

const EventDatabaseInstance = EventDatabase.createInstance();
export default EventDatabaseInstance;
