import FreePlayGamePanel from "@/components/game/FreePlayGamePanel";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `Free Play - ${BRAND_NAME} | Practice History Timeline`,
  description: `Practice your history skills with random events in Free Play mode. Unlimited games with ${BRAND_NAME} to improve your timeline knowledge.`,
};

const FreePage = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="w-full h-full max-w-[1200px] px-4">
        <FreePlayGamePanel />
      </div>
    </div>
  );
};

export default FreePage;
