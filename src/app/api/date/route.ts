import { NextResponse } from "next/server";
import EventDateImpl from  "@/lib/types/events/eventdate"
import { PostgrestError } from "@supabase/supabase-js";
import { EventPayload } from "@/lib/types/events/event-payload";
import ApiResponse, { ApiResult } from "@/lib/response";
import { Pair } from "@/lib/types/events/pairevent";
import EventServiceInstance from "@/services/server/event/EventService";
import { StaleDataError } from "@/services/server/event/EventDatabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const COUNT_DEFAULT = 20;

export async function POST(request: Request): Promise<NextResponse<ApiResult<Pair<EventPayload>[]>>> {
  const result = EventDateImpl.fromJSON(await request.json());
  return result.match({
    Ok: async (eventDate) => {
      const pairsResult = await EventServiceInstance.getEventPairsForDate(
        eventDate,
        COUNT_DEFAULT
      );
      return pairsResult.match({
        Ok: (pairs) =>
          NextResponse.json(ApiResponse.success(pairs), {
            status: 200,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
          }),
        Err: (err: PostgrestError | StaleDataError | Error) => {
          if (err instanceof StaleDataError) {
            return NextResponse.json(
              ApiResponse.error("Data fetch in progress. Please retry later.", "fetching_ongoing"),
              { status: 503, headers: { "Cache-Control": "no-store" } }
            );
          }
          console.error(err);
          return NextResponse.json(
            ApiResponse.error("Failed to retrieve data", "data_error"),
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

// All fetch/store orchestration moved into EventService
