import z from "zod";

// Wikipedia API types
export interface WikipediaEvent {
  text: string;
  pages: WikipediaPage[];
  year: number;
}

export interface WikipediaPage {
  wikibase_item: string;
  titles: { normalized: string };
  pageid: number;
  thumbnail?: ImageData;
  originalimage?: ImageData;
  content_urls: ContentUrls;
  extract: string;
}

export interface ImageData {
  source: string;
  width: number;
  height: number;
}

export interface ContentUrls {
  desktop: { page: string };
  mobile: { page: string };
}

export interface Wikipedia {
  births: WikipediaEvent[];
  deaths: WikipediaEvent[];
  events: WikipediaEvent[];
}

// Schema validation for Wikipedia API response
const imageDataSchema = z.object({
  source: z.string(),
  width: z.number(),
  height: z.number(),
});

const contentUrlsSchema = z.object({
  desktop: z.object({ page: z.string() }),
  mobile: z.object({ page: z.string() }),
});

const wikipediaPageSchema = z.object({
  wikibase_item: z.string(),
  titles: z.object({ normalized: z.string() }),
  pageid: z.number(),
  thumbnail: imageDataSchema.optional(),
  originalimage: imageDataSchema.optional(),
  content_urls: contentUrlsSchema,
  extract: z.string(),
});

const wikipediaEventSchema = z.object({
  text: z.string(),
  pages: z.array(wikipediaPageSchema),
  year: z.number(),
});

export const wikipediaResponseSchema = z.object({
  births: z.array(wikipediaEventSchema),
  deaths: z.array(wikipediaEventSchema),
  events: z.array(wikipediaEventSchema),
});

export type FullEvent = Wikipedia;
