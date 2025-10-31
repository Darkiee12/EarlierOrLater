import { EventData } from "@/lib/types/common/database.types";
import { Pair } from "./pairevent";

export type EventPayload = Omit<EventData, "extract" | "original_image" | "content_urls" | "wiki_metadata" | "created_at" | "updated_at">;
export default class EventPayloadImpl {
  payload: EventPayload[];
  constructor(data: EventData[]) {
    this.payload = data.map((e) => ({
      id: e.id,
      day: e.day,
      month: e.month,
      year: e.year,
      event_type: e.event_type,
      title: e.title,
      text: e.text,
      thumbnail: e.thumbnail,
    }));
  }

  pair(): Pair<EventPayload>[]{
    const pairs: Pair<EventPayload>[] = [];
    for(let i = 0; i < this.payload.length; i +=2){
      pairs.push({
        first: this.payload[i],
        second: this.payload[i + 1],
      });
    }
    return pairs;
  }

}
