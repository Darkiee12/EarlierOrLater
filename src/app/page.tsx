import ClientDate from "@/components/ClientDate";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start text-center">
        <ClientDate />
      </main>
      <footer className="row-start-5 flex gap-[24px] flex-wrap items-center justify-center">
        <p>Historical data provided by <a href="https://zenquotes.io/" target="_blank">ZenQuotes API</a></p>
      </footer>
    </div>
  );
}