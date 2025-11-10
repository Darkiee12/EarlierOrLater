import Option from "@/lib/rust_prelude/option";
import { BRAND_NAME, SITE_URL } from "@/common/constants";

export class ShareService {
  private static answersToEmoji(answers: Option<boolean>[]): string {
    return answers
      .map((answer) =>
        answer.match({
          Some: (correct) => (correct ? "🟩" : "🟥"),
          None: () => "⬜",
        })
      )
      .join("");
  }

  static generateShareText(
    answers: Option<boolean>[],
    score: number,
    currentStreak?: number,
    date?: string
  ): string {
    const emoji = this.answersToEmoji(answers);
    const correctCount = answers.filter((a) =>
      a.match({
        Some: (correct) => correct,
        None: () => false,
      })
    ).length;
    const totalQuestions = answers.length;

    let shareText = "";

    if (date) {
      shareText = `I played On This Date at ${BRAND_NAME}! 📅\n`;
      shareText += `${date}\n\n`;
    } else {
      shareText = `I played ${BRAND_NAME}! 🎮\n\n`;
    }

    shareText += `Score: ${score} 🎯\n`;
    shareText += `${correctCount}/${totalQuestions} correct\n`;

    if (currentStreak !== undefined && currentStreak > 0) {
      shareText += `Streak: ${currentStreak} 🔥\n`;
    }

    shareText += `\n${emoji}\n\n`;
    shareText += `${SITE_URL}`;

    return shareText;
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  }

  static async shareResults(
    answers: Option<boolean>[],
    score: number,
    currentStreak?: number,
    date?: string
  ): Promise<boolean> {
    const shareText = this.generateShareText(
      answers,
      score,
      currentStreak,
      date
    );
    return await this.copyToClipboard(shareText);
  }
}

export default ShareService;
