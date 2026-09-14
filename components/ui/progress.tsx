"use client";

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number; // 0–100
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-allianz transition-[width] duration-700 ease-out",
          barClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
