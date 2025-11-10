import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `Privacy Policy - ${BRAND_NAME}`,
  description: `Privacy Policy for ${BRAND_NAME}. Learn how we handle your data and protect your privacy while playing our history game.`,
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 min-h-0 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto">
      <article className="max-w-3xl w-full prose dark:prose-invert">
        <h2 className="text-3xl font-bold mb-4">Privacy Policy</h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Last Updated: November 4, 2025
        </p>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Introduction</h3>
          <p className="mb-4">
            {BRAND_NAME} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information 
            when you use our history game website.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Information We Collect</h3>
          <p className="mb-4">
            {BRAND_NAME} is designed to be privacy-friendly. We collect minimal information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Local Storage:</strong> Your best score is stored locally in your browser&apos;s 
              local storage. This data never leaves your device.
            </li>
            <li>
              <strong>Theme Preference:</strong> Your dark/light mode preference is stored locally 
              in your browser.
            </li>
            <li>
              <strong>No Personal Data:</strong> We do not collect names, email addresses, or any 
              personally identifiable information.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Third-Party Services</h3>
          <p className="mb-4">
            We use the following third-party services:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Wikipedia API:</strong> Historical event data is fetched from the Wikipedia API. 
              Please refer to the{" "}
              <a 
                href="https://foundation.wikimedia.org/wiki/Privacy_policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Wikimedia Privacy Policy
              </a>{" "}
              for information about their data practices.
            </li>
            <li>
              <strong>Hosting:</strong> Our website is hosted on Netlify. Please refer to{" "}
              <a 
                href="https://www.netlify.com/privacy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Netlify&apos;s Privacy Policy
              </a>.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Cookies</h3>
          <p className="mb-4">
            We do not use cookies for tracking or analytics. Any cookies present are essential 
            for the website&apos;s functionality (such as session management) or are set by third-party 
            services mentioned above.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Data Security</h3>
          <p className="mb-4">
            Since we store data only in your browser&apos;s local storage, you have full control over 
            your data. You can clear this data at any time through your browser settings.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Children&apos;s Privacy</h3>
          <p className="mb-4">
            Our game is educational and suitable for all ages. We do not knowingly collect any 
            personal information from anyone, including children under 13.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Changes to This Policy</h3>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify users of any 
            changes by updating the &quot;Last Updated&quot; date at the top of this policy.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-2xl font-semibold mb-3">Contact Us</h3>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please visit our{" "}
            <Link href="/about" className="text-blue-600 dark:text-blue-400 underline">
              About page
            </Link>.
          </p>
        </section>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/" 
            className="inline-block px-8 py-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            🎮 Back to Game
          </Link>
          <Link 
            href="/about" 
            className="inline-block px-8 py-4 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            ℹ️ About Us
          </Link>
        </div>
      </article>
    </main>
  );
}
