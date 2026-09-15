import { cn } from "@/lib/utils";

// Лек глобален коефициент — всички 3D иконки са малко по-едри навсякъде
const ICON_SCALE = 1.15;

// 3D иконка от колекцията Thiings (https://www.thiings.co) — свалена локално в /public/thiings
export function Thiing({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const px = Math.round(size * ICON_SCALE);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/thiings/${name}.png`}
      alt=""
      width={px}
      height={px}
      draggable={false}
      className={cn("select-none object-contain", className)}
    />
  );
}
