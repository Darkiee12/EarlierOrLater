import { useSingleplayerGame } from "@/contexts/SingleplayerGameContext";

const Lobby = () => {
  const { selectEventType, gameStatus } = useSingleplayerGame();
  const isLoading = gameStatus === "loading";
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-center">Welcome to the Earlier or Later!</h2>
      <p className="text-xl mt-4">Select the category to start the game.</p>
      <div className="grid grid-cols-3 gap-x-4">
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={() => selectEventType("event")}
          disabled={isLoading}
        >
          Historical Events
        </button>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={() => selectEventType("birth")}
          disabled={isLoading}
        >
          Births
        </button>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={() => selectEventType("death")}
          disabled={isLoading}
        >
          Deaths
        </button>
      </div>
      {isLoading && (
        <p className="mt-6 text-gray-600 dark:text-gray-400 animate-pulse">
          Getting events happening today...
        </p>
      )}
    </div>
  );
};

export default Lobby;