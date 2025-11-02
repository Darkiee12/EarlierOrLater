import Footer from "@/components/general/footer";
import Header from "@/components/general/header";
import GamePanel from "@/components/game/GamePanel";

export default function Home() {
  return (
    <div className="font-sans flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="flex-shrink-0 flex-grow-0">
        <Header />
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-start px-4 py-6">
        <GamePanel />
      </main>
      <footer className="flex-shrink-0 flex-grow-0 flex gap-6 flex-wrap items-center justify-center py-4 text-sm">
        <Footer />
      </footer>
    </div>
  );
}