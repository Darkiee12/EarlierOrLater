import type { Metadata } from "next";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `Classic Mode - ${BRAND_NAME} | Free Play`,
  description: `Play classic mode with unlimited random events. Practice your history skills in Free Play Classic mode with ${BRAND_NAME}.`,
};

export default function FreeClassicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
