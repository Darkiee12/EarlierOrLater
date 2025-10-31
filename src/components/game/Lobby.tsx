import { useSingleplayerGame } from "@/contexts/SingleplayerGameContext";

const Lobby = () => {
  const { selectEventType } = useSingleplayerGame();
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-center">Welcome to the Earlier or Later!</h2>
      <p className="text-xl mt-4">Select the category to start the game.</p>
      <div className="grid grid-cols-3 gap-x-4">
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out"
          type="button"
          onClick={() => selectEventType("event")}
        >
          Historical Events
        </button>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out"
          type="button"
          onClick={() => selectEventType("birth")}
        >
          Births
        </button>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-300 text-white rounded hover:cursor-pointer transition-all duration-200 ease-in-out"
          type="button"
          onClick={() => selectEventType("death")}
        >
          Deaths
        </button>
      </div>
    </div>
  );
};

export default Lobby;