import { NextResponse } from "next/server";
import { validate } from "uuid";
import { NotFoundError } from "@/services/server/event/EventDatabase";
import _ from "lodash";
import ApiResponse, { ApiResult } from "@/lib/response";
import { EventData } from "@/lib/types/common/database.types";
import EventService from "@/services/server/event/EventService";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ids: string }> }
): Promise<NextResponse<ApiResult<EventData[]>>> {
  const { ids: idsParam } = await params;
  const ids = idsParam.split(",").map((id) => id.trim());
  if (!_.every(ids, validate)) {
    return NextResponse.json(
      ApiResponse.fail({
        title: "One or more provided IDs are not valid UUIDs.",
      }),
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await EventService.getDetailEvents(ids);
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
        ApiResponse.error("Failed to read detail events", "data_read_error"),
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    },
  });
}
