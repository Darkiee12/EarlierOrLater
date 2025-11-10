import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME, BRAND_DESCRIPTION } from "@/common/constants";

export const metadata: Metadata = {
  title: `About - ${BRAND_NAME} | History Timeline Game`,
  description: `Learn about ${BRAND_NAME}, the educational history game that challenges you to guess which events happened first. Discover our mission to make learning history fun.`,
};

export default function AboutPage() {
  return (
    <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto">
      <article className="max-w-3xl w-full prose dark:prose-invert">
        <h2 className="text-3xl font-bold mb-4">About {BRAND_NAME}</h2>
        
        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">What is {BRAND_NAME}?</h3>
          <p className="mb-4">
            {BRAND_NAME} is an engaging educational game that tests your knowledge of historical events, 
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

        <div className="mt-8 flex gap-4">
          <Link 
            href="/" 
            className="inline-block px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            🎮 Start Playing
          </Link>
          <Link 
            href="/how-to-play" 
            className="inline-block px-8 py-4 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            📖 How to Play
          </Link>
        </div>
      </article>
    </main>
  );
}
