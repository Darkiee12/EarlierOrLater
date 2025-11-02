import z from "zod";
import {
  ContentUrlsSchema,
  PayloadImage,
  PayloadImageSchema,
} from "@/lib/types/common";
import Option from "@/lib/rust_prelude/option";
import { EventData, Json } from "../common/database.types";
// export interface Wikipedia {
//   births: Event[];
//   deaths: Event[];
//   events: Event[];
// }

// export interface Event {
//   text: string;
//   pages: Page[];
//   year: number;
// }

// export interface Page {
//   wikibase_item: string;
//   titles: Titles;
//   pageid: number;
//   thumbnail?: OriginalImage;
//   originalimage?: OriginalImage;
//   content_urls: ContentUrls;
//   extract: string;
// }

// interface ContentUrls {
//   desktop: PageUrl;
//   mobile: PageUrl;
// }

// interface PageUrl {
//   page: string;
// }

// interface OriginalImage {
//   source: string;
//   width: number;
//   height: number;
// }

// interface Titles {
//   normalized: string;
// }

const DetailedEventSchema = z.object({
  createdAt: z.string().nullable(),
  day: z.number(),
  month: z.number(),
  year: z.number(),
  eventType: z.enum(["event", "birth", "death"]),
  contentUrls: ContentUrlsSchema,
  extract: z.string(),
  id: z.uuid(),
  originalImage: PayloadImageSchema.nullable().transform((val) => Option.into(val)),
  thumbnail: PayloadImageSchema.nullable().transform((val) => Option.into(val)),
  title: z.string(),
});

export type DetailedEventType = z.infer<typeof DetailedEventSchema>;


const getOriginalImage = (
  img: Json | null | undefined
): Option<PayloadImage> => {
  if (!img) {
    return Option.None();
  }
  const result = PayloadImageSchema.safeParse(img);
  return result.success ? Option.Some(result.data) : Option.None();
};

const from = (event: EventData): DetailedEventType => {
  const contentUrls = ContentUrlsSchema.parse(event.content_urls);
  return {
    id: event.id,
    createdAt: event.created_at,
    day: event.day,
    month: event.month,
    year: event.year,
    eventType: event.event_type,
    contentUrls: contentUrls,
    extract: event.extract,
    originalImage: getOriginalImage(event.original_image),
    thumbnail: getOriginalImage(event.thumbnail),
    title: event.title,
  };
};

const DetailedEvent = {
    from,
    DetailedEventSchema,
}

export default DetailedEvent;
