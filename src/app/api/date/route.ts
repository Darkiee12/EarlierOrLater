import { NextResponse } from "next/server";
import Result from "@/lib/rust_prelude/result/result";
import EventDateImpl from  "@/lib/types/events/eventdate"
import axios from "axios";
import { FullEvent, FullEventImpl } from "@/lib/types/events/event";
import EventDatabaseInstance, {
  StaleDataError,
} from "@/lib/services/event-service";
import Option from "@/lib/rust_prelude/option/Option";
import { PostgrestError } from "@supabase/supabase-js";
import EventPayloadImpl, { EventPayload } from "@/lib/types/events/event-payload";
import ApiResponse, { ApiResult } from "@/lib/response";
import { Pair } from "@/lib/types/events/pairevent";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const apiBaseUrl = Option.into(process.env.API)
  .map((url) => new URL(url.trim()))
  .expect("Missing API base URL configuration");

const COUNT_DEFAULT = 20;

export async function POST(request: Request): Promise<NextResponse<ApiResult<Pair<EventPayload>[]>>> {
  const result = EventDateImpl.fromJSON(await request.json());
  return result.match({
    Ok: async (eventDate) => {
      const metaResult = await EventDatabaseInstance.getMetadata(eventDate);
      return metaResult.match({
        Ok: async ({ fetching }) => {
          switch (fetching) {
            case "available": {
              return (
                await EventDatabaseInstance.getCluster(
                  eventDate,
                  "events",
                  COUNT_DEFAULT
                )
              ).match({
                Ok: (value) => {
                  const payload = new EventPayloadImpl(value);
                  return NextResponse.json(ApiResponse.success(payload.pair()), {
                    status: 200,
                    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
                  });
                },
                Err: (error) => {
                  console.error(error);
                  return NextResponse.json(
                    ApiResponse.error("Failed to read available data", "data_read_error"),
                    { status: 502 }
                  );
                },
              });
            }
            case "not_available":
            case null:
              return fetchAndStoreThenReturn(eventDate);
            case "ongoing":
              return NextResponse.json(
                ApiResponse.error("Data fetch in progress. Please retry later.", "fetching_ongoing"),
                { status: 503, headers: { "Cache-Control": "no-store" } }
              );
            default:
              return fetchAndStoreThenReturn(eventDate);
          }
        },
        Err: async (err) => {
          if (err.name === "NotFoundError") {
            return fetchAndStoreThenReturn(eventDate);
          }
          console.error(err);
          return NextResponse.json(
            ApiResponse.error("Failed to read metadata", "metadata_error"),
            { status: 502, headers: { "Cache-Control": "no-store" } }
          );
        },
      });
    },
    Err: (error) => {
      console.error(error);
      return NextResponse.json(
        ApiResponse.error("Invalid request body", "invalid_request_body"),
        {
          status: 400,
        }
      );
    },
  });
}

async function fetchAndStoreThenReturn(
  eventDate: EventDateImpl
): Promise<NextResponse<ApiResult<Pair<EventPayload>[]>>> {
  const externalUrl = new URL(apiBaseUrl.toString());
  externalUrl.pathname = `/api/${eventDate.month}/${eventDate.date}`;
  const external = await Result.fromPromise(
    axios.get<FullEvent>(externalUrl.toString())
  );
  return external.match({
    Ok: async (response) => {
      const raw = response.data;
      const fullEvent = FullEventImpl.from(raw);

      const storeResult = await EventDatabaseInstance.store(
        eventDate,
        fullEvent
      );
      const storeResponse = storeResult.match({
        Ok: () => null,
        Err: (err: PostgrestError | StaleDataError) => {
          if (err instanceof StaleDataError) {
            return NextResponse.json(
              ApiResponse.error("Data update is in progress. Please retry later.", "fetching_ongoing"),
              { status: 503, headers: { "Cache-Control": "no-store" } }
            );
          }
          return NextResponse.json(
            ApiResponse.error("Failed to store data", "data_storage_error"),
            { status: 502, headers: { "Cache-Control": "no-store" } }
          );
        },
      });
      if (storeResponse) return storeResponse;

      return (await EventDatabaseInstance.getCluster(eventDate, "events", COUNT_DEFAULT)).match({
        Ok: (data) => {
          const payload = new EventPayloadImpl(data);
          return NextResponse.json(ApiResponse.success(payload.pair()), {
            status: 200,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
          });
        },
        Err: (error) => {
          console.error(error);
          return NextResponse.json(
            ApiResponse.error("Failed to retrieve stored data", "data_retrieval_error"),
            { status: 502, headers: { "Cache-Control": "no-store" } }
          );
        },
      });
    },
    Err: (error) => {
      console.error(error);
      return NextResponse.json(
        ApiResponse.error("Failed to fetch data from external API", "external_api_error"),
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    },
  });
}
