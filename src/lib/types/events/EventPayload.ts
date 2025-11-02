import Option from "@/lib/rust_prelude/option/Option";
import { EventData, Json } from "@/lib/types/common/database.types";
import { Pair } from "@/lib/types/common/pair";
import { PayloadImage, PayloadImageSchema } from "@/lib/types/common";


export type EventPayload = Omit<EventData, "original_image" | "thumbnail" | "extract" | "content_urls" | "wiki_metadata" | "created_at" | "updated_at" | "year" > & {
  original_image: PayloadImage | null, // Serialized to Json for GET requests
  thumbnail: PayloadImage | null,
};
export default class EventPayloadImpl {
  payload: EventPayload[];
  constructor(data: EventData[]) {
    this.payload = data.map((e) => ({
      id: e.id,
      day: e.day,
      month: e.month,
      event_type: e.event_type,
      original_image: this.getOriginalImage(e.original_image),
      title: e.title,
      text: e.text,
      thumbnail: this.getOriginalImage(e.thumbnail),
    }));
  }

  private getOriginalImage = (img: Json | null | undefined): PayloadImage | null => {
      if(!img ){
        return null;
      }
      const result = PayloadImageSchema.safeParse(img);
      return result.success ? result.data : null;
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
