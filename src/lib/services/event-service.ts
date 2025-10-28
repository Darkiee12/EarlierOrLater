import {
  createClient,
  PostgrestError,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Database, EventData, EventType } from "@/lib/types/common/database.types";
import { FullEvent, FullEventImpl } from "@/lib/types/events/event";
import Option from "@/lib/rust_prelude/option/Option";
import Result from "../rust_prelude/result/result";
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
      }
    );
  }

  static createInstance(): EventDatabase {
    if (this._instance === null) {
      this._instance = new EventDatabase();
    }
    return this._instance;
  }

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
      .schema("events")
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

  private async tryAcquireLock(eventDate: EventDateImpl): Promise<boolean> {
    const { month, date: day } = eventDate;
    const upd1 = await this.supabase
      .schema("events")
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
      .schema("events")
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
      .schema("events")
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

  private async releaseLock(
    eventDate: EventDateImpl,
    status: "available" | "not_available" = "available"
  ) {
    const { month, date: day } = eventDate;
    await this.supabase
      .schema("events")
      .from("metadata")
      .update({ fetching: status })
      .eq("month", month)
      .eq("day", day);
  }

  public async store(
    eventDate: EventDateImpl,
    apiData: FullEventImpl
  ): Promise<Result<void, PostgrestError | StaleDataError>> {
    console.log("Storing data for date:", eventDate.month, eventDate.date);
    const { month, date: day } = eventDate;
    const apiUpdateTime = Number(apiData.updated);
    const acquired = await this.tryAcquireLock(eventDate);
    if (!acquired) {
      console.error("Another process is already updating this date's data.");
      return Result.Err(
        new StaleDataError("Data is being updated by another process.")
      );
    }
    const { error } = await this.supabase
      .schema("events")
      .rpc("update_daily_events", {
        p_month: month,
        p_day: day,
        p_api_update_time: apiUpdateTime,
        p_events: apiData.data.Events.map((e) => e.toJson()),
        p_births: apiData.data.Births.map((e) => e.toJson()),
        p_deaths: apiData.data.Deaths.map((e) => e.toJson()),
      });
    if (error) {
      console.error(`Failed to store data: ${error.message}`);
      await this.releaseLock(eventDate, "not_available");
      return Result.Err(error);
    }
    await this.releaseLock(eventDate, "available");
    return Result.Ok(void 0);
  }

  private async getFinalData(
    month: number,
    day: number
  ): Promise<Result<FullEvent, PostgrestError | NotFoundError>> {
    const { data, error } = await this.supabase
      .schema("events")
      .rpc("get_fullevent_for_date", {
        p_month: month,
        p_day: day,
      });

    if (error) {
      return Result.Err(error);
    }

    if (!data) {
      return Result.Err(
        new NotFoundError(`No full event found for date: ${month}-${day}`)
      );
    }

    return Result.Ok(data as unknown as FullEvent);
  }

  public async getOnThisDayData(
    eventDate: EventDateImpl
  ): Promise<Result<FullEvent, PostgrestError | NotFoundError>> {
    return this.getFinalData(eventDate.month, eventDate.date);
  }

  public async getCluster(
    date: EventDateImpl,
    event_type: EventType,
    count: number, 
    range?: number): Promise<Result<EventData[], PostgrestError | NotFoundError>> {
    const { data, error } = await this.supabase.schema("events").rpc("random_cluster_with_filter", {
      p_in_day: date.date,
      p_in_month: date.month,
      p_event_type: event_type,
      p_k: count, 
      radius: range
    })
    if(error){
      return Result.Err(error);
    }
    if(!data){
      return Result.Err(
        new NotFoundError(`No cluster found with count: ${count} and range: ${range}`)
      );
    }
    return Result.Ok(data);
  }

  public async getDetailEvents(eventIds: string[]): Promise<Result<EventData[], PostgrestError | NotFoundError>> {
    const { data, error } = await this.supabase.schema("events").from("detail").select("*").in("id", eventIds);
    if(error){
      return Result.Err(error);
    }
    if(!data || data.length === 0){
      return Result.Err(
        new NotFoundError(`No detail events found for IDs: ${eventIds.join(", ")}`)
      );
    }
    return Result.Ok(data);
  }
}

const EventDatabaseInstance = EventDatabase.createInstance();
export default EventDatabaseInstance;
