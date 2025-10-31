import Footer from "@/components/general/footer";
import GamePanel from "@/components/game/GamePanel";

export default function Home() {
  return (
    <div className="font-sans flex flex-col h-screen overflow-hidden">
      <div>
        
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <GamePanel />
      </main>
      <div className="flex gap-6 flex-wrap items-center justify-center py-4 text-sm">
        <Footer />
      </div>
    </div>
  );
}