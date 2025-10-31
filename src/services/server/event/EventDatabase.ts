import { createClient, PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { Database, EventData, EventType } from "@/lib/types/common/database.types";
import Option from "@/lib/rust_prelude/option/Option";
import Result from "@/lib/rust_prelude/result/Result";
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

  public async getEventById(
    eventId: string
  ): Promise<Result<EventData, PostgrestError | NotFoundError>> {
    const { data, error} = await this.supabase.from("content").select("*").eq("id", eventId).single();
    if (error) {
      return Result.Err(error);
    }
    if (!data) {
      return Result.Err(new NotFoundError(`No event found with ID: ${eventId}`));
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

}

const EventDatabaseInstance = EventDatabase.createInstance();
export default EventDatabaseInstance;
