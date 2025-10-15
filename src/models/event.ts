import Result from "@/common/result";
import { YearImpl } from "@/models/year";
import z from "zod";

export interface Event {
  text: string;
  html: string;
  links: Map<string, Map<string, string>>;
}

export default class EventImpl implements Event {
  private constructor(
    public year: YearImpl,
    public text: string,
    public html: string,
    public links: Map<string, Map<string, string>>
  ) {}

  static create(
    text: string,
    html: string,
    links: Map<string, Map<string, string>>
  ) {
    const year = YearImpl.fromString(text).unwrapOr(YearImpl.defaultYear());
    const clonedLinks = new Map<string, Map<string, string>>();
    if (links) {
      for (const [outerKey, innerMap] of links.entries()) {
        clonedLinks.set(outerKey, new Map(Array.from(innerMap.entries())));
      }
    }
    return new EventImpl(year, text, html, clonedLinks);
  }
}

const linksSchema = z
  .record(z.string(), z.record(z.string(), z.string()))
  .transform((obj) => {
    const outerMap = new Map<string, Map<string, string>>();
    for (const outerKey in obj) {
      const innerMap = new Map(Object.entries(obj[outerKey]));
      outerMap.set(outerKey, innerMap);
    }
    return outerMap;
  });

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

export class FullEventImpl implements FullEvent {
  private constructor(
    public info: string,
    public date: string,
    public updated: string,
    public data: {
      Births: EventImpl[];
      Deaths: EventImpl[];
      Events: EventImpl[];
    }
  ) {}
  static fromJSON(data: string): Result<FullEventImpl, Error> {
    const parsed = Result.fromTryCatch<FullEvent, z.ZodError>(
      fullEventSchema.parse(JSON.parse(data))
    );
    return parsed.match({
      Ok: (value) => {
        const births = value.data.Births.map((e) =>
          EventImpl.create(e.text, e.html, e.links)
        );
        const deaths = value.data.Deaths.map((e) =>
          EventImpl.create(e.text, e.html, e.links)
        );
        const events = value.data.Events.map((e) =>
          EventImpl.create(e.text, e.html, e.links)
        );
        return Result.Ok(
          new FullEventImpl(value.info, value.date, value.updated, {
            Births: births,
            Deaths: deaths,
            Events: events,
          })
        );
      },
      Err: (error) => {
        console.error(error);
        return Result.Err(error);
      },
    });
  }
}