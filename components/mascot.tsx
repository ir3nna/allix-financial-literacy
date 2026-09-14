// Маскот на платформата — Фини (орелът). Растерна илюстрация с прозрачен фон.

import { cn } from "@/lib/utils";

export function Mascot({ size = 32, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mascot.png"
      alt="Фини"
      className={cn("select-none object-contain", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
