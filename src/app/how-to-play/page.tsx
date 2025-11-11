import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `How to Play - ${BRAND_NAME} | History Game Instructions`,
  description: `Learn how to play ${BRAND_NAME}. Simple rules, scoring system, and tips to improve your historical knowledge and timeline skills.`,
};

// Force static generation for SEO
export const dynamic = 'force-static';

export default function HowToPlayPage() {
  return (
    <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto">
      <article className="max-w-3xl w-full prose dark:prose-invert">
        <h2 className="text-3xl font-bold mb-4">How to Play</h2>
        
        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Game Overview</h3>
          <p className="mb-4">
            {BRAND_NAME} is a timeline-based trivia game where you guess which of two historical 
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

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Controls & Accessibility</h3>
          <p className="mb-4">
            {BRAND_NAME} supports keyboard shortcuts and touch gestures for an accessible gaming experience:
          </p>
          
          <div className="mb-4">
            <h4 className="text-xl font-semibold mb-2">Keyboard Shortcuts (Game)</h4>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>W</strong> or <strong>↑ Arrow Up:</strong> Select the first card</li>
              <li><strong>S</strong> or <strong>↓ Arrow Down:</strong> Select the second card</li>
              <li><strong>Space:</strong> Continue to the next pair (when available)</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="text-xl font-semibold mb-2">Keyboard Shortcuts (Carousel)</h4>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>A</strong> or <strong>← Left Arrow:</strong> Navigate to previous event</li>
              <li><strong>D</strong> or <strong>→ Right Arrow:</strong> Navigate to next event</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="text-xl font-semibold mb-2">Mobile Gestures</h4>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Swipe Left</strong> (right to left): Continue to the next pair (when available)</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Note: All shortcuts respect disabled states and only work when actions are available.
          </p>
        </section>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/" 
            className="inline-block px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            🎮 Start Playing Now
          </Link>
          <Link 
            href="/about" 
            className="inline-block px-8 py-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            ℹ️ About Us
          </Link>
        </div>
      </article>
    </main>
  );
}
