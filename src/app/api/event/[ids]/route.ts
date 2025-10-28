import { NextResponse } from "next/server";
import { validate } from "uuid";
import EventDatabaseInstance, {
  NotFoundError,
} from "@/lib/services/event-service";
import _ from "lodash";
import ApiResponse, { ApiResult } from "@/lib/response";
import { EventData } from "@/lib/types/common/database.types";
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
      { status: 400 }
    );
  }

  const result = await EventDatabaseInstance.getDetailEvents(ids);
  return result.match({
    Ok: (value) => {
      return NextResponse.json(ApiResponse.success(value), { status: 200 });
    },
    Err: (error) => {
      if (error instanceof NotFoundError) {
        return NextResponse.json(
          ApiResponse.fail({
            title: error.message,
          }),
          { status: 404 }
        );
      }
      console.error(error);
      return NextResponse.json(
        ApiResponse.error("Failed to read detail events", "data_read_error"),
        { status: 500 }
      );
    },
  });
}
