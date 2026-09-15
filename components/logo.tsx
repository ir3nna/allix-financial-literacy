// Лого на Allix — растерна илюстрация (3D букви + шапка).
// Синият вариант се показва в светла тема, белият — в тъмна.

import { cn } from "@/lib/utils";

export function Logo({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  const width = size === "sm" ? "w-20" : "w-28";
  return (
    <span className={cn("inline-block select-none", className)}>
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src="/allix-blue.png"
        alt="Allix"
        className={cn(width, "h-auto dark:hidden")}
        draggable={false}
      />
      <img
        src="/allix-white.png"
        alt="Allix"
        className={cn(width, "hidden h-auto dark:block")}
        draggable={false}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </span>
  );
}
