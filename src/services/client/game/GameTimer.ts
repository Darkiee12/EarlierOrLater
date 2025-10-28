export class GameTimer {
  private revealTimer: number | null = null;
  private scoreTimer: number | null = null;

  /**
   * Starts timers for reveal and scoring phases
   * @param delayMs - Delay in milliseconds
   * @param onReveal - Callback when reveal phase starts
   * @param onScore - Callback when scoring phase starts
   */
  startTimers(
    delayMs: number,
    onReveal: () => void,
    onScore: () => void
  ): void {
    this.clearTimers();

    this.revealTimer = window.setTimeout(() => {
      onReveal();
      this.revealTimer = null;
    }, delayMs);

    this.scoreTimer = window.setTimeout(() => {
      onScore();
      this.scoreTimer = null;
    }, delayMs);
  }

  clearTimers(): void {
    if (this.revealTimer !== null) {
      clearTimeout(this.revealTimer);
      this.revealTimer = null;
    }
    if (this.scoreTimer !== null) {
      clearTimeout(this.scoreTimer);
      this.scoreTimer = null;
    }
  }

  hasActiveTimers(): boolean {
    return this.revealTimer !== null || this.scoreTimer !== null;
  }
}
