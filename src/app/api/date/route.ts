import { NextRequest, NextResponse } from "next/server";
import EventDateImpl from  "@/lib/types/events/EventDate"
import { PostgrestError } from "@supabase/supabase-js";
import { EventPayload } from "@/lib/types/events/EventPayload";
import ApiResponse, { ApiResult } from "@/lib/response";
import { Pair } from "@/lib/types/common/pair";
import { StaleDataError } from "@/services/server/event/EventDatabase";
import EventService from "@/services/server/event/EventService";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const dateQuerySchema = z.object({
  day: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(31)),
  month: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(12)),
  eventType: z.enum(["event", "birth", "death"]).optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse<ApiResult<Pair<EventPayload>[]>>> {
  const searchParams = request.nextUrl.searchParams;
  const day = searchParams.get("day");
  const month = searchParams.get("month");
  const eventType = searchParams.get("eventType");

  const validationResult = dateQuerySchema.safeParse({
    day,
    month,
    eventType: eventType || undefined,
  });

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    ).join(", ");
    return NextResponse.json(
      ApiResponse.error(
        `Invalid query parameters: ${errorMessages}`,
        "invalid_query_params"
      ),
      { status: 400 }
    );
  }

  const { day: validDay, month: validMonth, eventType: validEventType } = validationResult.data;

  const eventDateResult = EventDateImpl.fromNumber(validMonth, validDay);
  
  return eventDateResult.match({
    Ok: async (eventDate) => {
      const typeToUse = validEventType || "event";
      const pairsResult = await EventService.getEventPairsForDate(eventDate, typeToUse);
      
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
        ApiResponse.error("Invalid date", "invalid_date"),
        { status: 400 }
      );
    },
  });
}

// All fetch/store orchestration moved into EventService
