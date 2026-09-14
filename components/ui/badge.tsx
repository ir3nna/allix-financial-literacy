import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "orange" | "gray" | "red";

const tones: Record<Tone, string> = {
  blue: "bg-allianz/10 text-allianz",
  green: "bg-success/10 text-green-700 dark:text-green-400",
  orange: "bg-warning/10 text-amber-700 dark:text-amber-400",
  gray: "bg-soft text-muted",
  red: "bg-danger/10 text-red-700 dark:text-red-400",
};

export function Badge({
  className,
  tone = "blue",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
