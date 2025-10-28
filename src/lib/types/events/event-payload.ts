import { EventData } from "../common/database.types";
import { Pair } from "./pairevent";

export type EventPayload = Omit<EventData, "html" | "links" | "year">;
export default class EventPayloadImpl {
  payload: EventPayload[];
  constructor(data: EventData[]) {
    this.payload = data.map((e) => ({
      id: e.id,
      month: e.month,
      day: e.day,
      event_type: e.event_type,
      text: e.text,
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
