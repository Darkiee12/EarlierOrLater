import type { Metadata } from "next";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `Daily Challenge - ${BRAND_NAME} | Today's Historical Events`,
  description: `Play today's daily history challenge with ${BRAND_NAME}. Test your knowledge of events that happened on this day throughout history.`,
};

export default function OnThisDayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

