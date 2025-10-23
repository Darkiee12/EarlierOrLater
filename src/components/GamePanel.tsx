"use client";
import EventImpl, { FullEventImpl } from "@/models/event";
import { memo, useEffect, useState } from "react";
import { GameProvider, useGameContext } from "@/contexts/GameContext";
import { PositionImpl } from "@/models/pairevent";
import { FaLongArrowAltRight } from "react-icons/fa";
import CountUp from "react-countup";
import { PHASE_DURATION_SECONDS } from "@/common/constants";
const GamePanelContent = memo(() => {
  const { currentPairIndex, revealedYear, setRevealedYear, nextPair, ongoing } =
    useGameContext();
  const handleNextClick = () => {
    setRevealedYear(false);
    nextPair();
  };

  useEffect(() => {
    setRevealedYear(false);
  }, [currentPairIndex, setRevealedYear]);
  return (
    <div className="w-full">
      {ongoing ? <InnerPanel /> : <GameResult />}
      <div className="flex items-center justify-center mt-3 h-[52px]">
        {revealedYear && (
          <button
            className="border-2 border-black rounded-lg py-3 px-2 hover:cursor-pointer"
            onClick={() => handleNextClick()}
          >
            Continue {<FaLongArrowAltRight className="inline-block ml-2" />}
          </button>
        )}
      </div>
    </div>
  );
});
GamePanelContent.displayName = "GamePanelContent";

const InnerPanel: React.FC = () => {
  const { pairs, currentPairIndex, points } = useGameContext();
  return (
    <>
      <div className="flex flex-col justify-between items-center mb-4">
        <h2 className="font-bold text-2xl py-2 w-full text-center">
          Which came first?
        </h2>
        <p className="text-xl font-semibold">Score: {points}</p>
      </div>
      <div className="flex flex-col gap-y-5 items-center w-full">
        <GameCard
          data={pairs[currentPairIndex].firstEvent}
          eventOrder={PositionImpl.first()}
        />
        <GameCard
          data={pairs[currentPairIndex].secondEvent}
          eventOrder={PositionImpl.second()}
        />
      </div>
    </>
  );
};

const GameCard: React.FC<{
  data: EventImpl;
  eventOrder: PositionImpl;
}> = ({ data, eventOrder }) => {
  const { revealedYear, handleCardClick, month, date, currentPair } =
    useGameContext();
  return (
    <GameCardButton />
  );

  function GameCardButton() {
    const [showBorderColor, setShowBorderColor] = useState(false);

    useEffect(() => {
      let t: ReturnType<typeof setTimeout> | undefined;
      if (revealedYear) {
        t = setTimeout(() => setShowBorderColor(true), 1500);
      } else {
        setShowBorderColor(false);
      }
      return () => {
        if (t) clearTimeout(t);
      };
    }, []);

    return (
      <button
        type="button"
        className={`border-4 rounded-xl p-2 py-4 w-full max-w-[500px] relative ${
          showBorderColor
            ? currentPair.expectedResult.bool(eventOrder)
              ? "border-green-500"
              : "border-red-500"
            : "border-black"
        } hover:cursor-pointer hover:scale-[1.02] transition-all duration-200 ease-in-out`}
        onClick={() => handleCardClick(eventOrder)}
        disabled={revealedYear}
      >
        <div className="h-[28px] flex items-center justify-center py-2">
          {revealedYear && (
            <div className="w-full flex flex-col items-center justify-center font-bold">
              <span>{`${month} ${date},`}</span>
              <span className="text-2xl">
                <CountUp start={0} end={data.year.get()} duration={PHASE_DURATION_SECONDS} separator="">
                  {({ countUpRef }) => (
                    <div>
                      <span ref={countUpRef} />
                    </div>
                  )}
                </CountUp>
              </span>
            </div>
          )}
        </div>
        <p className="py-6 px-2">{data.text}</p>
      </button>
    );
  }
};

const GameResult = () => {
  const { points } = useGameContext();
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold">Game Over!</h2>
      <p className="text-xl mt-4">Your final score is: {points}</p>
    </div>
  );
};

const GamePanel: React.FC<{ events: FullEventImpl }> = ({ events }) => {
  return (
    <GameProvider events={events}>
      <GamePanelContent />
    </GameProvider>
  );
};

export default GamePanel;
