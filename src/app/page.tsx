import Link from "next/link";
import { DailyChallengeButton } from "@/components/game/DailyChallengeButton";
import { BRAND_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/common/constants";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${BRAND_NAME} - A history timeline game`,
    "description": DEFAULT_DESCRIPTION,
    "url": SITE_URL,
    "applicationCategory": "Game",
    "genre": ["Educational", "Trivia", "History"],
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
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
        <div className="sr-only">
          <h2>Play {BRAND_NAME} History Game</h2>
          <p>
            Welcome to {BRAND_NAME}, the ultimate history timeline game that challenges your knowledge
            of historical events. Test yourself daily with events that happened on this date throughout history.
            Our educational trivia game features three exciting categories: historical events, famous births,
            and notable deaths.
          </p>
          <p>
            How to play: Choose your preferred category and guess which of two events happened earlier or later 
            in history. Each correct answer earns you points as you race against time to complete all rounds. 
            The game features real historical data from Wikipedia, ensuring accurate and fascinating facts 
            about world history, famous people, and significant moments that shaped our world.
          </p>
          <p>
            Whether you&apos;re a history student, teacher, or enthusiast, {BRAND_NAME} offers an engaging
            way to learn about historical timelines, practice your chronological reasoning, and discover
            interesting facts about events that occurred on today&apos;s date. Play daily to improve your 
            historical knowledge and compete for the best score.
          </p>
          <p>
            Features include: Daily changing historical events based on the current date, three game categories 
            (events, births, deaths), score tracking system, detailed event information with images, 
            mobile-friendly responsive design, and completely free to play. Perfect for history education, 
            classroom activities, or casual learning.
          </p>
          <p>
            Start playing now by selecting a category below. Learn more about the game on our{" "}
            <Link href="/about">about page</Link> or read the{" "}
            <Link href="/how-to-play">instructions</Link>.
          </p>
        </div>
        <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center gap-8 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">{BRAND_NAME}</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <DailyChallengeButton />

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
            <p>
              Choose your preferred mode and select a category to start playing. 
              Can you master the timeline of history?
            </p>
          </div>
        </div>
      </main>
    </>
  );
}