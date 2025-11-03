import z from "zod";
import {
  ContentUrlsSchema,
  PayloadImage,
  PayloadImageSchema,
} from "@/lib/types/common";
import { EventData, Json } from "../common/database.types";

const DetailedEventSchema = z.object({
  createdAt: z.string().nullable(),
  day: z.number(),
  month: z.number(),
  year: z.number(),
  eventType: z.enum(["event", "birth", "death"]),
  contentUrls: ContentUrlsSchema,
  extract: z.string(),
  id: z.uuid(),
  originalImage: PayloadImageSchema.nullable(),
  thumbnail: PayloadImageSchema.nullable(),
  title: z.string(),
});

export type DetailedEventType = z.infer<typeof DetailedEventSchema>;


const getOriginalImage = (
  img: Json | null | undefined
): PayloadImage | null => {
  if (!img) {
    return null;
  }
  const result = PayloadImageSchema.safeParse(img);
  return result.success ? result.data : null;
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
