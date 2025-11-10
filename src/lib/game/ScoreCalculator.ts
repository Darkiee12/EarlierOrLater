import { DetailedEventType } from "../types/events/DetailedEvent";

/**
 * Pure scoring logic for the game (isomorphic - works on client & server)
 */
export class ScoreCalculator {
  /**
   * Converts a DetailedEventType to a comparable timestamp
   * @param event - The event to convert
   * @returns A number representing the date (YYYYMMDD format for easy comparison)
   */
  private static eventToTimestamp(event: DetailedEventType): number {
    return event.year * 10000 + event.month * 100 + event.day;
  }

  /**
   * Determines if the user's selection is correct
   * @param firstEvent - First event in the pair
   * @param secondEvent - Second event in the pair
   * @param selectedId - ID of the event the user selected
   * @param shouldPickEarlier - Whether the user should pick the earlier event (true) or later (false)
   * @returns true if the selection is correct, false otherwise
   */
  static isCorrectSelection(
    firstEvent: DetailedEventType,
    secondEvent: DetailedEventType,
    selectedId: string,
    shouldPickEarlier: boolean
  ): boolean {
    const firstTimestamp = this.eventToTimestamp(firstEvent);
    const secondTimestamp = this.eventToTimestamp(secondEvent);
    
    const isTie = firstTimestamp === secondTimestamp;
    
    if (isTie) {
      // Always correct if dates are equal
      return true;
    }

    const pickEarlier = (a: DetailedEventType, b: DetailedEventType) => 
      this.eventToTimestamp(a) < this.eventToTimestamp(b) ? a : b;
    const pickLater = (a: DetailedEventType, b: DetailedEventType) => 
      this.eventToTimestamp(a) > this.eventToTimestamp(b) ? a : b;

    const winner = shouldPickEarlier 
      ? pickEarlier(firstEvent, secondEvent) 
      : pickLater(firstEvent, secondEvent);

    return winner.id === selectedId;
  }

  /**
   * Gets the result event ID to display based on the game mode
   * @param firstEvent - First event in the pair
   * @param secondEvent - Second event in the pair
   * @param shouldPickEarlier - Whether the user should pick the earlier event
   * @returns The event ID that should be highlighted as correct
   */
  static getResultEventId(
    firstEvent: DetailedEventType,
    secondEvent: DetailedEventType,
    shouldPickEarlier: boolean
  ): string {
    const firstTimestamp = this.eventToTimestamp(firstEvent);
    const secondTimestamp = this.eventToTimestamp(secondEvent);
    
    if (shouldPickEarlier) {
      return firstTimestamp < secondTimestamp ? firstEvent.id : secondEvent.id;
    } else {
      return firstTimestamp > secondTimestamp ? firstEvent.id : secondEvent.id;
    }
  }

  /**
   * Gets the result year to display based on the game mode
   * @param firstEvent - First event in the pair
   * @param secondEvent - Second event in the pair
   * @param shouldPickEarlier - Whether the user should pick the earlier event
   * @returns The year that should be highlighted as correct
   */
  static getResultYear(
    firstEvent: DetailedEventType,
    secondEvent: DetailedEventType,
    shouldPickEarlier: boolean
  ): number {
    const firstTimestamp = this.eventToTimestamp(firstEvent);
    const secondTimestamp = this.eventToTimestamp(secondEvent);
    
    return shouldPickEarlier 
      ? (firstTimestamp < secondTimestamp ? firstEvent.year : secondEvent.year)
      : (firstTimestamp > secondTimestamp ? firstEvent.year : secondEvent.year);
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
