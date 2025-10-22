import Result from "@/rust_prelude/result/result";
import { YearImpl } from "@/models/year";
import z from "zod";
import _ from 'lodash';
import { Ord, Ordering } from "@/rust_prelude/cmp/ord";
import Option from "@/rust_prelude/option/Option";
import { PositionImpl, PairEvent } from "./pairevent";

export interface Event {
  text: string;
  html: string;
  links: Record<string, Record<string, string>>;
}




export default class EventImpl implements Ord {
  private constructor(
    public year: YearImpl,
    public text: string,
    public html: string,
    public links: Map<string, Map<string, string>>
  ) {}

  static create(
    text: string,
    html: string,
    links: Record<string, Record<string, string>>
  ) {
    const year = YearImpl.fromString(text).match({
      Ok: (year) => year,
      Err: (e) => {
        console.error(`Error parsing year from text "${text}":`, e);
        return YearImpl.defaultYear();
      }
    });
    const processedText = text.split(";")[1]?.trim() ?? text;
    const clonedLinks = linkBuilder(links);
    return new EventImpl(year, processedText, html, clonedLinks);
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

  partialCmp(other: unknown): Option<Ordering> {
    if (other instanceof EventImpl) {
      return Option.Some(this.cmp(other));
    }
    return Option.None();
  }

  cmp(other: EventImpl): Ordering {
    return this.year.get() < other.year.get()
      ? Ordering.Less
      : this.year.get() > other.year.get()
      ? Ordering.Greater
      : Ordering.Equal;
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

  private static mapEventData(data: FullEvent["data"]): {
    Births: EventImpl[];
    Deaths: EventImpl[];
    Events: EventImpl[];
  } {
    return {
      Births: data.Births.map((e) => EventImpl.create(e.text, e.html, e.links)),
      Deaths: data.Deaths.map((e) => EventImpl.create(e.text, e.html, e.links)),
      Events: data.Events.map((e) => EventImpl.create(e.text, e.html, e.links)),
    };
  }

  static fromJSON(data: string): Result<FullEventImpl, Error> {
    const parsed = Result.fromTryCatch<FullEvent, z.ZodError>(
      fullEventSchema.parse(JSON.parse(data))
    ); 
    return parsed.match({
      Ok: (value) => {
        const mappedData = FullEventImpl.mapEventData(value.data);
        const [month, date] = value.date.split("_");
        return Result.Ok(
          new FullEventImpl(value.info, parseInt(date), month, value.updated, mappedData)
        );
      },
      Err: (error) => {
        console.error(error);
        return Result.Err(error);
      },
    });
  }

  static from(data: FullEvent): FullEventImpl {
    const mappedData = FullEventImpl.mapEventData(data.data);
    const [month, date] = data.date.split("_");
    return new FullEventImpl(data.info, parseInt(date), month, data.updated, mappedData);
  }

  prepareEvents(count: number = 10): PairEvent[] {
    const slice = _.sampleSize(this.data.Events, count << 1);
    const pairs: PairEvent[] = [];
    for (let i = 0; i < slice.length; i += 2) {
      if (i + 1 < slice.length) {
        const firstEvent = slice[i];
        const secondEvent = slice[i + 1];
        pairs.push({
          firstEvent: firstEvent,
          secondEvent: secondEvent,
          expectedResult: firstEvent.year.eq(secondEvent.year) ? PositionImpl.both()
            : firstEvent.year.get() < secondEvent.year.get() ? PositionImpl.first()
            : PositionImpl.second(),
        });
      }
    }
    return pairs;
  }

}

function linkBuilder(obj: Record<string, Record<string, string>>): Map<string, Map<string, string>> {
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