import type { Metadata } from "next";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `Free Play - ${BRAND_NAME} | Practice History Timeline`,
  description: `Practice your history skills with random events in Free Play mode. Unlimited games with ${BRAND_NAME} to improve your timeline knowledge.`,
};

export default function FreePlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

