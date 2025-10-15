import Result from "@/common/result";
import { z, ZodError } from 'zod';

const eventDateSchema = z.object({
  date: z.number().int().min(1).max(31),
  month: z.number().int().min(1).max(12),
});

type EventDate = z.infer<typeof eventDateSchema>;

class InvalidDateError extends Error {
  constructor(month: number, date: number) {
    super(`Invalid date ${date} for month ${month}`);
    this.name = "InvalidDateError";
  }
}

export default class EventDateImpl implements EventDate {
  private constructor(public date: number, public month: number) {}
  static fromNumber(
    month: number,
    date: number
  ): Result<EventDateImpl, Error> {
    {
      switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
          if (date < 1 || date > 31) {
            return Result.Err(new InvalidDateError(month, date));
          }
          break;
        case 4:
        case 6:
        case 9:
        case 11:
          if (date < 1 || date > 30) {
            return Result.Err(new InvalidDateError(month, date));
          }
          break;
        case 2:
          if (date < 1 || date > 28) {
            return Result.Err(new InvalidDateError(month, date));
          }
          break;
        default:
          return Result.Err(new InvalidDateError(month, date));
      }
      return Result.Ok(new EventDateImpl(date, month));
    }
  }

  static fromJSON(data: string): Result<EventDateImpl, Error>{
    const eventDate = Result.fromTryCatch<EventDate, ZodError>(eventDateSchema.parse(data));
    return eventDate.match({
      Ok: (value) => EventDateImpl.fromNumber(value.month, value.date),
      Err: (error) => {
        console.error(error);
        return Result.Err<EventDateImpl, ZodError>(error)
      }
    });
    
  }

  static today(): EventDateImpl {
    const today = new Date();
    return new EventDateImpl(today.getDate(), today.getMonth() + 1);
  }

  toString(): string{
    return `${this.month}/${this.date}`;
  } 

  toJSON(): string{
    return JSON.stringify({ month: this.month, date: this.date });
  }
}
