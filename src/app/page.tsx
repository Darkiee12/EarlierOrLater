import Link from "next/link";
import { DailyChallengeCard } from "@/components/game/DailyChallengeCard";
import { BRAND_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/common/constants";

// Force static generation for SEO - revalidate daily since date changes
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate once per day

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${BRAND_NAME} - A history timeline game`,
    "description": DEFAULT_DESCRIPTION,
    "url": SITE_URL,
    "applicationCategory": "Game",
    "genre": ["Educational", "Trivia", "History"],
    "browserRequirements": "Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Students, History Enthusiasts, General Public"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6">
        <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center gap-8 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{BRAND_NAME}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-2">
              Test your knowledge of historical events with our daily timeline game
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <DailyChallengeCard />

            <Link
              href="/free"
              className="group relative overflow-hidden rounded-2xl border-4 border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-8 hover:scale-105 transition-transform duration-200 ease-in-out shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-3xl font-bold mb-2 text-green-700 dark:text-green-200">
                  Free Play
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Practice with random historical events anytime
                </p>
              </div>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            <p className="mb-4">
              Choose your preferred mode and select a category to start playing. 
              Can you master the timeline of history?
            </p>
          </div>

          {/* SEO Content - visible to search engines but hidden from users */}
          <div className="sr-only">
            <h2>About {BRAND_NAME} History Timeline Game</h2>
            <p>
              Welcome to {BRAND_NAME}, the ultimate history timeline game that challenges your knowledge
              of historical events. Test yourself daily with events that happened on this date throughout history.
              Our educational trivia game features three exciting categories: historical events, famous births,
              and notable deaths.
            </p>
            <h3>How to Play</h3>
            <p>
              Choose your preferred category and guess which of two events happened earlier or later 
              in history. Each correct answer earns you points as you race against time to complete all rounds. 
              The game features real historical data from Wikipedia, ensuring accurate and fascinating facts 
              about world history, famous people, and significant moments that shaped our world.
            </p>
            <h3>Who Should Play</h3>
            <p>
              Whether you&apos;re a history student, teacher, or enthusiast, {BRAND_NAME} offers an engaging
              way to learn about historical timelines, practice your chronological reasoning, and discover
              interesting facts about events that occurred on today&apos;s date. Play daily to improve your 
              historical knowledge and compete for the best score.
            </p>
            <h3>Game Features</h3>
            <ul>
              <li>Daily changing historical events based on the current date</li>
              <li>Three game categories: events, births, and deaths</li>
              <li>Score tracking system</li>
              <li>Detailed event information with images</li>
              <li>Mobile-friendly responsive design</li>
              <li>Completely free to play</li>
              <li>Perfect for history education and classroom activities</li>
            </ul>
            <p>
              Start playing now by selecting a category above. Learn more about the game on our{" "}
              <Link href="/about">about page</Link> or read the{" "}
              <Link href="/how-to-play">instructions</Link>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}