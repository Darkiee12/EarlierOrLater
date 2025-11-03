import Link from "next/link";
import Header from "@/components/general/header";
import Footer from "@/components/general/footer";

export default function NotFound() {
  return (
    <div className="font-sans flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="flex-shrink-0 flex-grow-0">
        <Header />
      </header>
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-6">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
            Oops! The page you&apos;re looking for seems to have been lost in history.
          </p>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
            Don&apos;t worry though, we can help you find your way back to learning about historical events!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors min-w-[200px]"
            >
              Back to Home
            </Link>
            <Link 
              href="/about"
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors min-w-[200px]"
            >
              Learn About Us
            </Link>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                Play Game
              </Link>
              <Link href="/how-to-play" className="text-blue-600 dark:text-blue-400 hover:underline">
                How to Play
              </Link>
              <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
                About
              </Link>
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </nav>
          </div>

          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, please let us know so we can fix it!
          </p>
        </div>
      </main>
      <footer className="flex-shrink-0 flex-grow-0 flex flex-wrap items-center justify-center py-2 text-sm">
        <Footer />
      </footer>
    </div>
  );
}
