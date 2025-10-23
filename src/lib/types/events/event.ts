import Result from "@/lib/rust_prelude/result/result";
import { YearImpl } from "@/lib/types/common/year";
import z from "zod";

import { Ord, OrderingImpl } from "@/lib/rust_prelude/cmp/ord";
import Option from "@/lib/rust_prelude/option/Option";
import { sortByKey } from "@/lib/rust_prelude/cmp/sort";
import { Constants, Json, EventType } from "@/lib/types/common/database.types";
import EventDateImpl from "./eventdate";

import BaseEvent from ".";

export interface Event {
  text: string;
  html: string;
  links: Record<string, Record<string, string>>;
}

export default class EventImpl extends BaseEvent implements Ord {
  private constructor(
    public readonly eventDate: EventDateImpl,
    public readonly year: YearImpl,
    public readonly text: string,
    public readonly html: string,
    public readonly links: Map<string, Map<string, string>>,
    private readonly eventType: EventType
  ) {
    super();
  }

  static create(
    eventDate: EventDateImpl,
    text: string,
    html: string,
    links: Record<string, Record<string, string>>,
    eventType: EventType = Constants.events.Enums.event_type[0]
  ) {
    const year = YearImpl.fromString(text).match({
      Ok: (year) => year,
      Err: (e) => {
        console.error(`Error parsing year from text "${text}":`, e);
        return YearImpl.defaultYear();
      },
    });
    const processedText = text.split(";")[1]?.trim() ?? text;
    const clonedLinks = linkBuilder(links);
    return new EventImpl(
      eventDate,
      year,
      processedText,
      html,
      clonedLinks,
      eventType
    );
  }

  max(other: EventImpl): EventImpl {
    return this.year.get() > other.year.get() ? this : other;
  }

  min(other: EventImpl): EventImpl {
    return this.year.get() < other.year.get() ? this : other;
  }

  eq(other: EventImpl): boolean {
    return this.year.get() === other.year.get();
  }

  partialCmp(other: unknown): Option<OrderingImpl> {
    if (other instanceof EventImpl) {
      return Option.Some(this.cmp(other));
    }
    return Option.None();
  }

  cmp(other: EventImpl): OrderingImpl {
    return this.year.cmp(other.year);
  }

  toJson(): Json {
    const links: Record<string, Record<string, string>> = {};
    this.links.forEach((innerMap, key) => {
      links[key] = Object.fromEntries(innerMap);
    });

    return {
      month: this.eventDate.month,
      date: this.eventDate.date,
      year: this.year.get(),
      event_type: this.eventType,
      text: this.text,
      html: this.html,
      links: links,
    };
  }
}

const linksSchema = z.record(z.string(), z.record(z.string(), z.string()));

const eventSchema = z.object({
  text: z.string(),
  html: z.string(),
  links: linksSchema,
});

const fullEventSchema = z.object({
  info: z.string(),
  date: z.string(),
  updated: z.string(),
  data: z.object({
    Births: z.array(eventSchema),
    Deaths: z.array(eventSchema),
    Events: z.array(eventSchema),
  }),
});

export type FullEvent = z.infer<typeof fullEventSchema>;

export class FullEventImpl {
  private constructor(
    public info: string,
    public date: number,
    public month: string,
    public updated: string,
    public data: {
      Births: EventImpl[];
      Deaths: EventImpl[];
      Events: EventImpl[];
    }
  ) {}

  private static mapEventData(
    data: FullEvent["data"],
    eventDate: EventDateImpl
  ): {
    Births: EventImpl[];
    Deaths: EventImpl[];
    Events: EventImpl[];
  } {
    return {
      Births: sortByKey(
        data.Births.map((e) =>
          EventImpl.create(
            eventDate,
            e.text,
            e.html,
            e.links,
            Constants.events.Enums.event_type[1]
          )
        ),
        (e) => e.year
      ),
      Deaths: sortByKey(
        data.Deaths.map((e) =>
          EventImpl.create(
            eventDate,
            e.text,
            e.html,
            e.links,
            Constants.events.Enums.event_type[2]
          )
        ),
        (e) => e.year
      ),
      Events: sortByKey(
        data.Events.map((e) =>
          EventImpl.create(
            eventDate,
            e.text,
            e.html,
            e.links,
            Constants.events.Enums.event_type[0]
          )
        ),
        (e) => e.year
      ),
    };
  }

  static fromJSON(data: string): Result<FullEventImpl, Error> {
    const parsed = Result.fromTryCatch<FullEvent, z.ZodError>(
      fullEventSchema.parse(JSON.parse(data))
    );
    return parsed.match({
      Ok: (value) => {
        return EventDateImpl.fromMonthDateString(value.date).match({
          Ok: (eventDate) => {
            const mappedData = FullEventImpl.mapEventData(
              value.data,
              eventDate
            );
            return Result.Ok(
              new FullEventImpl(
                value.info,
                eventDate.date,
                eventDate.getMonthString(),
                value.updated,
                mappedData
              )
            );
          },
          Err: (e) => {
            return Result.Err(e);
          },
        });
      },
      Err: (error) => {
        console.error(error);
        return Result.Err(error);
      },
    });
  }

  static from(data: FullEvent): FullEventImpl {
    const eventDate = EventDateImpl.fromMonthDateString(data.date).unwrap();
    const mappedData = FullEventImpl.mapEventData(data.data, eventDate);
    return new FullEventImpl(
      data.info,
      eventDate.date,
      eventDate.getMonthString(),
      data.updated,
      mappedData
    );
  }
}

function linkBuilder(
  obj: Record<string, Record<string, string>>
): Map<string, Map<string, string>> {
  const outer = new Map<string, Map<string, string>>();
  if (!obj) return outer;
  for (const [outerKey, innerObj] of Object.entries(obj)) {
    const innerMap = new Map<string, string>();
    for (const [k, v] of Object.entries(innerObj)) {
      innerMap.set(k, v);
    }
    outer.set(outerKey, innerMap);
  }
  return outer;
}
