import type { Metadata } from "next";
import { BRAND_NAME } from "@/common/constants";

export const metadata: Metadata = {
  title: `Time Mode - ${BRAND_NAME} | Free Play`,
  description: `Race against the clock in Time Mode! Answer as many questions as you can in 60 seconds with ${BRAND_NAME}.`,
};

export default function FreeTimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
