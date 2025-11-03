import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/general/header";
import Footer from "@/components/general/footer";

export const metadata: Metadata = {
  title: "How to Play - Earlier or Later | History Game Instructions",
  description: "Learn how to play Earlier or Later. Simple rules, scoring system, and tips to improve your historical knowledge and timeline skills.",
};

export default function HowToPlayPage() {
  return (
    <div className="font-sans flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="flex-shrink-0 flex-grow-0">
        <Header />
      </header>
      <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto">
        <article className="max-w-3xl w-full prose dark:prose-invert">
          <h2 className="text-3xl font-bold mb-4">How to Play</h2>
          
          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Game Overview</h3>
            <p className="mb-4">
              Earlier or Later is a timeline-based trivia game where you guess which of two historical 
              events happened first (earlier) or second (later). All events occurred on today&apos;s date 
              in history, making each day a unique challenge!
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Getting Started</h3>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>
                <strong>Choose a Category:</strong> Select from Historical Events, Births, or Deaths. 
                Each category features events that happened on today&apos;s date throughout history.
              </li>
              <li>
                <strong>Read the Question:</strong> You&apos;ll be asked which event happened &quot;earlier&quot; or &quot;later&quot; 
                - the question changes randomly each round.
              </li>
              <li>
                <strong>View Two Events:</strong> Two historical events are displayed with descriptions 
                and images (when available).
              </li>
              <li>
                <strong>Make Your Selection:</strong> Click on the event you think matches the question 
                (happened earlier or later).
              </li>
            </ol>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">After Your Selection</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The years for both events will be revealed with an animation</li>
              <li>Your answer will be marked as correct (green border) or incorrect (red border)</li>
              <li>Correct answers earn you 1 point</li>
              <li>Click &quot;Continue&quot; to move to the next pair of events</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Scoring</h3>
            <p className="mb-4">
              Your score is tracked throughout the game. Try to answer as many questions correctly as 
              possible! The game tracks your progress with dots at the bottom of the screen:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Green dot:</strong> Correct answer</li>
              <li><strong>Red dot:</strong> Incorrect answer</li>
              <li><strong>Gray dot:</strong> Not yet answered</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Tips for Success</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Read event descriptions carefully for historical context clues</li>
              <li>Consider major historical periods and eras</li>
              <li>Remember that events span from ancient times to recent history</li>
              <li>Play regularly to improve your historical knowledge</li>
              <li>Learn from incorrect answers to build your understanding</li>
            </ul>
          </section>

          <div className="mt-8">
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Start Playing Now
            </Link>
          </div>
        </article>
      </main>
      <footer className="flex-shrink-0 flex-grow-0 flex flex-wrap items-center justify-center py-2 text-sm">
        <Footer />
      </footer>
    </div>
  );
}
