import Footer from "@/components/general/footer";
import Header from "@/components/general/header";
import GamePanel from "@/components/game/GamePanel";
import Link from "next/link";

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://earlierorlater.netlify.app';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Earlier or Later",
    "description": "Challenge yourself with our daily history timeline game! Guess which historical events, births, or deaths happened earlier.",
    "url": siteUrl,
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
      <div className="font-sans flex flex-col h-screen max-h-screen overflow-hidden">
        <header className="flex-shrink-0 flex-grow-0">
          <Header />
        </header>
        <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6">
          <div className="sr-only">
            <h2>Play Earlier or Later History Game</h2>
            <p>
              Welcome to Earlier or Later, the ultimate history timeline game that challenges your knowledge 
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
              Whether you&apos;re a history student, teacher, or enthusiast, Earlier or Later offers an engaging 
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
          <GamePanel />
        </main>
        <footer className="flex-shrink-0 flex-grow-0 flex flex-wrap items-center justify-center py-2 text-sm">
          <Footer />
        </footer>
      </div>
    </>
  );
}