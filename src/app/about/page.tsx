import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/general/header";
import Footer from "@/components/general/footer";

export const metadata: Metadata = {
  title: "About - Earlier or Later | History Timeline Game",
  description: "Learn about Earlier or Later, the educational history game that challenges you to guess which events happened first. Discover our mission to make learning history fun.",
};

export default function AboutPage() {
  return (
    <div className="font-sans flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="flex-shrink-0 flex-grow-0">
        <Header />
      </header>
      <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto">
        <article className="max-w-3xl w-full prose dark:prose-invert">
          <h2 className="text-3xl font-bold mb-4">About Earlier or Later</h2>
          
          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">What is Earlier or Later?</h3>
            <p className="mb-4">
              Earlier or Later is an engaging educational game that tests your knowledge of historical events, 
              births, and deaths that occurred on today&apos;s date throughout history. Challenge yourself to 
              determine which of two events happened first and learn fascinating historical facts along the way.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Our Mission</h3>
            <p className="mb-4">
              We believe learning history should be fun and interactive. By presenting historical events as 
              an engaging game, we aim to make history more accessible and memorable for everyone, from 
              students to history enthusiasts.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Data Source</h3>
            <p className="mb-4">
              All historical data is sourced from the{" "}
              <a 
                href="https://wikimediafoundation.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Wikimedia Foundation
              </a>
              {" "}via the Wikipedia API. We&apos;re grateful for their commitment to free knowledge and open access 
              to historical information.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-2xl font-semibold mb-3">Game Features</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Daily changing historical events based on today&apos;s date</li>
              <li>Three categories: Historical Events, Births, and Deaths</li>
              <li>Score tracking to monitor your progress</li>
              <li>Educational content with detailed event information</li>
              <li>Mobile-friendly design for learning on the go</li>
            </ul>
          </section>

          <div className="mt-8">
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Start Playing
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
