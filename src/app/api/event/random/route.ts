import { NextRequest, NextResponse } from "next/server";
import { NotFoundError } from "@/services/server/event/EventDatabase";
import ApiResponse, { ApiResult } from "@/lib/response";
import { EventPayload } from "@/lib/types/events/EventPayload";
import { Pair } from "@/lib/types/common/pair";
import EventService from "@/services/server/event/EventService";
import { z } from "zod";
import { EventType, RandomPairEvent } from "@/lib/types/common/database.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const randomEventQuerySchema = z.object({
  eventType: z.enum(["event", "birth", "death"]).optional(),
  mode: z.enum(["single", "multiple"]).optional().default("multiple"),
});

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResult<Pair<EventPayload>[] | RandomPairEvent>>> {
  const searchParams = request.nextUrl.searchParams;
  const eventType = searchParams.get("eventType");
  const mode = searchParams.get("mode");

  const validationResult = randomEventQuerySchema.safeParse({
    eventType: eventType || undefined,
    mode: mode || undefined,
  });

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    return NextResponse.json(
      ApiResponse.error(
        `Invalid query parameters: ${errorMessages}`,
        "invalid_query_params"
      ),
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { eventType: validEventType, mode: validMode } = validationResult.data;
  const typeToUse: EventType = validEventType || "event";

  const result = validMode === "single" 
    ? await EventService.getRandomPair(typeToUse)
    : await EventService.getRandomEvents(typeToUse);

  return result.match({
    Ok: (value) => {
      return NextResponse.json(ApiResponse.success(value), {
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    },
    Err: (error) => {
      if (error instanceof NotFoundError) {
        return NextResponse.json(
          ApiResponse.fail({
            title: error.message,
          }),
          { status: 404, headers: { "Cache-Control": "no-store" } }
        );
      }
      console.error(error);
      return NextResponse.json(
        ApiResponse.error("Failed to get random events", "data_read_error"),
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    },
  });
}
