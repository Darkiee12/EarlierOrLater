"use client";
import { useSingleplayerGame } from "@/contexts/SingleplayerGameContext";

import Carousel from "./Carousel";



const GameResult = () => {
  const { points, detailedEvents } = useSingleplayerGame();
  const allEvents = Array.from(detailedEvents.values());
 

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold pt-5">Game Over!</h2>
      <p className="text-xl py-1">Your final score is: {points}</p>
      <p>Review which event happens today!</p>
      <div className="h-full max-w-[600px] flex items-center justify-center">
      <Carousel slides={allEvents}/>    
      </div>
    </div>
  );
};

export default GameResult;
