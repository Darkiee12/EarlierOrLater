import GamePanel from "@/components/game/GamePanel";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `Daily Challenge - ${BRAND_NAME} | Today's Historical Events`,
  description: `Play today's daily history challenge with ${BRAND_NAME}. Test your knowledge of events that happened on this date throughout history.`,
};

const DailyPage = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full h-full max-w-[1200px] px-4">
        <GamePanel />
      </div>
    </div>
  );
};

export default DailyPage;
