import Result from "@/lib/rust_prelude/result";

const DB_NAME = "EventfullyGameDB";
const DB_VERSION = 2;
const STORE_NAME = "dailyGames";

export interface DailyGameRecord {
  date: number;
  month: number;
  year: number;
  streak: number;
  bestStreak: number;
  results: boolean[];
  score: number;
  timestamp: number;
  events?: string; // JSON string of DetailedEventType[]
}

interface StreakData {
  currentStreak: number;
  bestStreak: number;
}

export class GameResultService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<Result<IDBDatabase, Error>> {
    if (typeof window === "undefined") {
      return Promise.resolve(Result.Err(new Error("IndexedDB not available")));
    }

    if (this.dbPromise) {
      return this.dbPromise.then((db) => Result.Ok(db));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: ["year", "month", "date"],
          });

          objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });

    return Result.fromPromise(
      this.dbPromise,
      (err) => new Error(`Failed to open database: ${err}`)
    );
  }

  private static getTodayDate(): {
    date: number;
    month: number;
    year: number;
  } {
    const today = new Date();
    return {
      date: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    };
  }

  private static areConsecutiveDays(
    date1: { date: number; month: number; year: number },
    date2: { date: number; month: number; year: number }
  ): boolean {
    const d1 = new Date(date1.year, date1.month - 1, date1.date);
    const d2 = new Date(date2.year, date2.month - 1, date2.date);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  static async getGameRecord(
    date: number,
    month: number,
    year: number
  ): Promise<Result<DailyGameRecord | null, Error>> {
    const dbResult = await this.getDB();

    return dbResult.match({
      Ok: async (db) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);

        return Result.fromPromise<DailyGameRecord | null, Error>(
          new Promise((resolve, reject) => {
            const request = store.get([year, month, date]);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
          }),
          (err) => new Error(`Failed to get game record: ${err}`)
        );
      },
      Err: (error) => Result.Err(error),
    });
  }

  static async getTodayGameRecord(): Promise<
    Result<DailyGameRecord | null, Error>
  > {
    const today = this.getTodayDate();
    return this.getGameRecord(today.date, today.month, today.year);
  }

  static async hasPlayedToday(): Promise<Result<boolean, Error>> {
    const recordResult = await this.getTodayGameRecord();
    return recordResult.map((record) => record !== null);
  }

  static async getAllGameRecords(): Promise<Result<DailyGameRecord[], Error>> {
    const dbResult = await this.getDB();

    return dbResult.match({
      Ok: async (db) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index("timestamp");

        return Result.fromPromise<DailyGameRecord[], Error>(
          new Promise((resolve, reject) => {
            const request = index.openCursor(null, "prev");
            const records: DailyGameRecord[] = [];

            request.onsuccess = (event) => {
              const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
                .result;
              if (cursor) {
                records.push(cursor.value);
                cursor.continue();
              } else {
                resolve(records);
              }
            };
            request.onerror = () => reject(request.error);
          }),
          (err) => new Error(`Failed to get all game records: ${err}`)
        );
      },
      Err: (error) => Result.Err(error),
    });
  }

  static async getCurrentStreak(): Promise<Result<number, Error>> {
    const recordsResult = await this.getAllGameRecords();

    return recordsResult.map((records) => {
      if (records.length === 0) return 0;

      const today = this.getTodayDate();
      const mostRecent = records[0];

      const isToday =
        mostRecent.year === today.year &&
        mostRecent.month === today.month &&
        mostRecent.date === today.date;

      const isYesterday = this.areConsecutiveDays(
        {
          date: mostRecent.date,
          month: mostRecent.month,
          year: mostRecent.year,
        },
        today
      );

      if (!isToday && !isYesterday) {
        return 0;
      }

      let streak = 1;
      for (let i = 1; i < records.length; i++) {
        const current = records[i - 1];
        const previous = records[i];

        if (
          this.areConsecutiveDays(
            {
              date: previous.date,
              month: previous.month,
              year: previous.year,
            },
            { date: current.date, month: current.month, year: current.year }
          )
        ) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    });
  }

  static async getBestStreak(): Promise<Result<number, Error>> {
    const recordsResult = await this.getAllGameRecords();

    return recordsResult.map((records) => {
      if (records.length === 0) return 0;
      return Math.max(...records.map((r) => r.bestStreak));
    });
  }

  static async getStreakData(): Promise<Result<StreakData, Error>> {
    const currentStreakResult = await this.getCurrentStreak();
    const bestStreakResult = await this.getBestStreak();

    return currentStreakResult.andThen((currentStreak) =>
      bestStreakResult.map((bestStreak) => ({
        currentStreak,
        bestStreak,
      }))
    );
  }

  static async saveGameResult(
    results: boolean[],
    score: number,
    events?: any[] // DetailedEventType[] but we'll serialize it
  ): Promise<Result<StreakData, Error>> {
    const today = this.getTodayDate();

    const existingRecordResult = await this.getTodayGameRecord();

    if (existingRecordResult.isErr()) {
      return Result.Err(existingRecordResult.value() as Error);
    }

    const existingRecord = existingRecordResult.unwrap();
    if (existingRecord) {
      return Result.Ok({
        currentStreak: existingRecord.streak,
        bestStreak: existingRecord.bestStreak,
      });
    }

    const currentStreakResult = await this.getCurrentStreak();
    if (currentStreakResult.isErr()) {
      return Result.Err(currentStreakResult.value() as Error);
    }

    const allRecordsResult = await this.getAllGameRecords();
    if (allRecordsResult.isErr()) {
      return Result.Err(allRecordsResult.value() as Error);
    }

    const currentStreak = currentStreakResult.unwrap();
    const allRecords = allRecordsResult.unwrap();

    const newStreak = currentStreak + 1;
    const currentBestStreak =
      allRecords.length > 0
        ? Math.max(...allRecords.map((r) => r.bestStreak))
        : 0;
    const newBestStreak = Math.max(currentBestStreak, newStreak);

    const record: DailyGameRecord = {
      date: today.date,
      month: today.month,
      year: today.year,
      streak: newStreak,
      bestStreak: newBestStreak,
      results,
      score,
      timestamp: Date.now(),
      events: events ? JSON.stringify(events) : undefined,
    };

    const dbResult = await this.getDB();
    if (dbResult.isErr()) {
      return Result.Err(dbResult.value() as Error);
    }

    const db = dbResult.unwrap();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const saveResult = await Result.fromPromise<void, Error>(
      new Promise((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      (err) => new Error(`Failed to save game result: ${err}`)
    );

    return saveResult.map(() => ({
      currentStreak: newStreak,
      bestStreak: newBestStreak,
    }));
  }

  static async resetStreak(): Promise<Result<void, Error>> {
    const dbResult = await this.getDB();

    return dbResult.match({
      Ok: async (db) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        return Result.fromPromise<void, Error>(
          new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          }),
          (err) => new Error(`Failed to reset streak: ${err}`)
        );
      },
      Err: (error) => Result.Err(error),
    });
  }
}

export default GameResultService;
