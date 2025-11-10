import { STREAK_STORAGE_KEY } from "@/common/constants";

interface StreakData {
  currentStreak: number;
  lastPlayedDate: string; // ISO date string (YYYY-MM-DD)
  bestStreak: number;
}

export class StreakService {
  private static getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private static areConsecutiveDays(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  static getStreakData(): StreakData {
    if (typeof window === 'undefined') {
      return { currentStreak: 0, lastPlayedDate: '', bestStreak: 0 };
    }

    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!stored) {
      return { currentStreak: 0, lastPlayedDate: '', bestStreak: 0 };
    }

    try {
      return JSON.parse(stored);
    } catch {
      return { currentStreak: 0, lastPlayedDate: '', bestStreak: 0 };
    }
  }

  /**
   * Update streak when a game is completed
   * Should be called at the end of each daily game
   */
  static updateStreak(): StreakData {
    if (typeof window === 'undefined') {
      return { currentStreak: 0, lastPlayedDate: '', bestStreak: 0 };
    }

    const today = this.getTodayDateString();
    const currentData = this.getStreakData();

    // If already played today, don't update
    if (currentData.lastPlayedDate === today) {
      return currentData;
    }

    let newStreak = 1;

    // Check if this continues the streak
    if (currentData.lastPlayedDate) {
      if (this.areConsecutiveDays(currentData.lastPlayedDate, today)) {
        newStreak = currentData.currentStreak + 1;
      }
    }

    const newBestStreak = Math.max(currentData.bestStreak, newStreak);

    const newData: StreakData = {
      currentStreak: newStreak,
      lastPlayedDate: today,
      bestStreak: newBestStreak,
    };

    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newData));
    return newData;
  }

  static hasPlayedToday(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const today = this.getTodayDateString();
    const data = this.getStreakData();
    return data.lastPlayedDate === today;
  }

  static getCurrentStreak(): number {
    const data = this.getStreakData();
    const today = this.getTodayDateString();

    // If last played was today or yesterday, return current streak
    if (data.lastPlayedDate === today || 
        this.areConsecutiveDays(data.lastPlayedDate, today)) {
      return data.currentStreak;
    }

    // Streak is broken
    return 0;
  }

  static getBestStreak(): number {
    return this.getStreakData().bestStreak;
  }

  static resetStreak(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(STREAK_STORAGE_KEY);
  }
}

export default StreakService;
