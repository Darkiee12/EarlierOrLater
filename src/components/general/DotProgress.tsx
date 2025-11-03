import React from "react";
import Option from "@/lib/rust_prelude/option";
import clsx from "clsx";
type DotsProgressProps = {
  statuses: Option<boolean>[]; 
  currentIndex?: number;
  size?: number; 
  gap?: number; 
  correctClass?: string;
  incorrectClass?: string; 
  noneClass?: string; 
  emphasizeCurrent?: boolean; 
  ariaLabel?: string;
};

export default function DotsProgress({
  statuses,
  currentIndex = -1,
  size,
  gap,
  correctClass = "bg-emerald-500",
  incorrectClass = "bg-red-500",
  noneClass = "bg-transparent",
  emphasizeCurrent = true,
  ariaLabel = "Progress",
}: DotsProgressProps) {
  const style: React.CSSProperties & {
    "--dot-size"?: string;
    "--dot-gap"?: string;
  } = {
    ...(size ? { "--dot-size": `${size}px` } : {}),
    ...(gap ? { "--dot-gap": `${gap}px` } : {}),
  };
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={clsx(
        "flex items-center select-none",
        "[--dot-size:8px] [--dot-gap:6px]",
        "sm:[--dot-size:10px] sm:[--dot-gap:8px]",
        "md:[--dot-size:12px] md:[--dot-gap:8px]",
        "lg:[--dot-size:14px] lg:[--dot-gap:10px]"
      )}
      style={style}
    >
      {statuses.map((st, i) => {
        const isCurrent = i === currentIndex;
        const base = "flex-shrink-0 rounded-full inline-flex items-center justify-center transition-all";
        const stateClasses = st.match({
          Some: (value: boolean) => (value ? correctClass : incorrectClass),
          None: () => noneClass,
        });
        const currentClasses = isCurrent && emphasizeCurrent ? "scale-110 shadow-md" : "";

        const dotClasses = clsx(
          base,
          "border-2 border-solid border-current text-[color:var(--text)]",
          "w-2 h-2 w-[var(--dot-size)] h-[var(--dot-size)] mr-[var(--dot-gap)] last:mr-0",
          stateClasses,
          currentClasses
        );

        return <div key={i} aria-hidden="true" className={dotClasses} />;
      })}
    </div>
  );
}
