/**
 * Core game engine with pure game logic (isomorphic - works on client & server)
 */
export class GameEngine {
  /**
   * Generates a random boolean value using cryptographically secure randomness
   * @returns Random boolean
   */
  static generateRandomBoolean(): boolean {
    const byte = new Uint8Array(1);
    crypto.getRandomValues(byte);
    return (byte[0] & 1) === 1;
  }

  /**
   * Checks if the game is finished
   * @param currentIndex - Current round index
   * @param totalRounds - Total number of rounds
   * @returns true if game is finished
   */
  static isGameFinished(currentIndex: number, totalRounds: number): boolean {
    return currentIndex >= totalRounds;
  }

  /**
   * Validates if a round can be scored
   * @param roundIndex - Index of the round
   * @param scoredRounds - Set of already scored round indices
   * @returns true if the round hasn't been scored yet
   */
  static canScoreRound(roundIndex: number, scoredRounds: Set<number>): boolean {
    return !scoredRounds.has(roundIndex);
  }

  /**
   * Marks a round as scored
   * @param roundIndex - Index of the round
   * @param scoredRounds - Set of scored round indices
   */
  static markRoundAsScored(roundIndex: number, scoredRounds: Set<number>): void {
    scoredRounds.add(roundIndex);
  }
}
