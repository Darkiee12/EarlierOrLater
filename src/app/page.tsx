import GamePanel from "./components/GamePanel";

export default function Home() {
  return (
    <div className="font-sans flex flex-col h-screen overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <GamePanel />
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center py-4 text-sm">
        <p>Historical data provided by <a href="https://zenquotes.io/" target="_blank">ZenQuotes API</a></p>
      </footer>
    </div>
  );
}