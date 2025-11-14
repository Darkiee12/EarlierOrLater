import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startTranslate, setStartTranslate] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const style: React.CSSProperties & {
    "--dot-size"?: string;
    "--dot-gap"?: string;
  } = {
    ...(size ? { "--dot-size": `${size}px` } : {}),
    ...(gap ? { "--dot-gap": `${gap}px` } : {}),
  };

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    const containerWidth = container.offsetWidth;
    const contentWidth = content.offsetWidth;
    
    if (contentWidth <= containerWidth) {
      setTranslateX(0);
      return;
    }

    const maxTranslate = 0;
    const minTranslate = containerWidth - contentWidth;
    
    setTranslateX((prev) => {
      if (prev > maxTranslate) return maxTranslate;
      if (prev < minTranslate) return minTranslate;
      return prev;
    });
  }, [statuses.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartTranslate(translateX);
  }, [translateX]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    const containerWidth = container.offsetWidth;
    const contentWidth = content.offsetWidth;
    
    if (contentWidth <= containerWidth) return;
    
    const deltaX = e.clientX - startX;
    const newTranslate = startTranslate + deltaX;
    const maxTranslate = 0;
    const minTranslate = containerWidth - contentWidth;
    
    setTranslateX(Math.max(minTranslate, Math.min(maxTranslate, newTranslate)));
  }, [isDragging, startX, startTranslate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartTranslate(translateX);
  }, [translateX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current || !contentRef.current) return;
    
    e.preventDefault();
    
    const container = containerRef.current;
    const content = contentRef.current;
    const containerWidth = container.offsetWidth;
    const contentWidth = content.offsetWidth;
    
    if (contentWidth <= containerWidth) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const newTranslate = startTranslate + deltaX;
    const maxTranslate = 0;
    const minTranslate = containerWidth - contentWidth;
    
    setTranslateX(Math.max(minTranslate, Math.min(maxTranslate, newTranslate)));
  }, [isDragging, startX, startTranslate]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      className={clsx(
        "max-w-[200px] sm:max-w-[300px] md:max-w-[400px] overflow-hidden cursor-grab active:cursor-grabbing",
        "[--dot-size:8px] [--dot-gap:6px]",
        "sm:[--dot-size:10px] sm:[--dot-gap:8px]",
        "md:[--dot-size:12px] md:[--dot-gap:8px]",
        "lg:[--dot-size:14px] lg:[--dot-gap:10px]"
      )}
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={contentRef}
        className={clsx(
          "flex items-center select-none min-w-max",
          !isDragging && "transition-transform duration-200 ease-out"
        )}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
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
    </div>
  );
}
