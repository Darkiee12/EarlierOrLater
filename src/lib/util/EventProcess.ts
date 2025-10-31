import { EventData, EventType } from "@/lib/types/common/database.types";
import { WikipediaEvent } from "@/lib/types/events/event";

type TransformedEvent = {
  day: number;
  month: number;
  year: number;
  event_type: EventType;
  title: string;
  text: string;
  extract: string;
  thumbnail: { source: string; width: number; height: number } | null;
  original_image: { source: string; width: number; height: number } | null;
  content_urls: {
    desktop: string;
    mobile: string;
  };
  wiki_metadata: {
    wikibase_item: string;
    pageid: number;
  };
};

// Normalize Wikipedia URLs so small variations don't bypass deduplication
// - force https
// - drop query/hash
// - keep path case as-is (Wikipedia can be case-sensitive beyond first char)
// - return original if parsing fails
export function normalizeWikiUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    u.protocol = "https:";
    u.hash = "";
    u.search = "";
    // Optional: remove trailing slash if not root
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    // Best-effort fallback: strip fragment
    const idx = url.indexOf("#");
    return idx >= 0 ? url.slice(0, idx) : url;
  }
}

const getEventQualityScore = (evt: TransformedEvent) => {
  let score = 0;
  if (evt.thumbnail) score++;
  if (evt.original_image) score++;
  if (evt.extract) score++;
  if (evt.title) score++;
  return score;
};

const transformEvents = (
  events: WikipediaEvent[],
  eventType: EventType,
  day: number,
  month: number
) => {
  // Deduplicate by the canonical identity of an event row we store:
  // day, month, year, event_type and the Wikipedia page URL (desktop).
  const deduplicatedMap = new Map<string, TransformedEvent>();

  for (const event of events) {
    for (const page of event.pages) {
      const currentEvent: TransformedEvent = {
        day,
        month,
        year: event.year,
        event_type: eventType,
        title: page.titles.normalized,
        text: event.text,
        extract: page.extract,
        thumbnail: page.thumbnail || null,
        original_image: page.originalimage || null,
        content_urls: {
          desktop: normalizeWikiUrl(page.content_urls.desktop.page) || page.content_urls.desktop.page,
          mobile: page.content_urls.mobile.page,
        },
        wiki_metadata: {
          wikibase_item: page.wikibase_item,
          pageid: page.pageid,
        },
      };

      // Prefer stable key based on normalized URL; fallback to title only if URL is missing for some reason
      const desktopUrl = normalizeWikiUrl(page.content_urls?.desktop?.page);
      const key = desktopUrl
        ? `${day}-${month}-${event.year}-${eventType}-${desktopUrl}`
        : `${day}-${month}-${event.year}-${eventType}-${page.titles.normalized}`;

      const existingEvent = deduplicatedMap.get(key);

      if (!existingEvent) {
        deduplicatedMap.set(key, currentEvent);
      } else {
        const existingScore = getEventQualityScore(existingEvent);
        const currentScore = getEventQualityScore(currentEvent);

        if (
          currentScore > existingScore ||
          (currentScore === existingScore &&
            currentEvent.original_image &&
            !existingEvent.original_image)
        ) {
          deduplicatedMap.set(key, currentEvent);
        }
      }
    }
  }

  return Array.from(deduplicatedMap.values());
};

const transformToWikipediaEvent = (rows: EventData[]): WikipediaEvent[] => {
  const byYear = rows.reduce((acc, row) => {
    if (!acc[row.year]) {
      acc[row.year] = [];
    }
    acc[row.year].push(row);
    return acc;
  }, {} as Record<number, EventData[]>);

  return Object.entries(byYear).map(([year, eventsList]) => ({
    text: eventsList[0].text,
    year: parseInt(year),
    pages: eventsList.map((e) => {
      const wikiMeta = e.wiki_metadata as unknown as {
        wikibase_item: string;
        pageid: number;
      };
      const contentUrls = e.content_urls as unknown as {
        desktop: string;
        mobile: string;
      };
      const thumbnail = e.thumbnail as unknown as {
        source: string;
        width: number;
        height: number;
      } | null;
      const originalImage = e.original_image as unknown as {
        source: string;
        width: number;
        height: number;
      } | null;

      return {
        wikibase_item: wikiMeta.wikibase_item,
        titles: { normalized: e.title },
        pageid: wikiMeta.pageid,
        ...(thumbnail && { thumbnail }),
        ...(originalImage && { originalimage: originalImage }),
        content_urls: {
          desktop: { page: contentUrls.desktop },
          mobile: { page: contentUrls.mobile },
        },
        extract: e.extract,
      };
    }),
  }));
};

export { transformEvents, transformToWikipediaEvent };
