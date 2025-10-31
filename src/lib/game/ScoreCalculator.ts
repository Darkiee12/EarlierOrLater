import { EventData } from "@/lib/types/common/database.types";

/**
 * Pure scoring logic for the game (isomorphic - works on client & server)
 */
export class ScoreCalculator {
  /**
   * Determines if the user's selection is correct
   * @param firstEvent - First event in the pair
   * @param secondEvent - Second event in the pair
   * @param selectedId - ID of the event the user selected
   * @param shouldPickEarlier - Whether the user should pick the earlier event (true) or later (false)
   * @returns true if the selection is correct, false otherwise
   */
  static isCorrectSelection(
    firstEvent: EventData,
    secondEvent: EventData,
    selectedId: string,
    shouldPickEarlier: boolean
  ): boolean {
    const isTie = firstEvent.year === secondEvent.year;
    
    if (isTie) {
      // Always correct if years are equal
      return true;
    }

    const pickEarlier = (a: EventData, b: EventData) => (a.year < b.year ? a : b);
    const pickLater = (a: EventData, b: EventData) => (a.year > b.year ? a : b);

    const winner = shouldPickEarlier 
      ? pickEarlier(firstEvent, secondEvent) 
      : pickLater(firstEvent, secondEvent);

    return winner.id === selectedId;
  }

  /**
   * Gets the result year to display based on the game mode
   * @param firstEvent - First event in the pair
   * @param secondEvent - Second event in the pair
   * @param shouldPickEarlier - Whether the user should pick the earlier event
   * @returns The year that should be highlighted as correct
   */
  static getResultYear(
    firstEvent: EventData,
    secondEvent: EventData,
    shouldPickEarlier: boolean
  ): number {
    return shouldPickEarlier 
      ? Math.min(firstEvent.year, secondEvent.year)
      : Math.max(firstEvent.year, secondEvent.year);
  }

  static saveBestScore(score: number){
    const bestScore = Math.max(this.getBestScore(), score);
    localStorage.setItem('bestScore', bestScore.toString());
  }

  static getBestScore(): number {
    const bestScore = localStorage.getItem('bestScore');
    return bestScore ? parseInt(bestScore, 10) : 0;
  }
}
