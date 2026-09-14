import { cn } from "@/lib/utils";

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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/thiings/${name}.png`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={cn("select-none object-contain", className)}
    />
  );
}
