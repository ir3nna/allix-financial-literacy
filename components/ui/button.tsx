import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-allianz text-white hover:bg-allianz-dark shadow-lg shadow-allianz/30",
  secondary: "bg-allianz/10 text-allianz hover:bg-allianz/15",
  outline: "border-2 border-line bg-card text-fg/80 hover:border-allianz hover:text-allianz",
  ghost: "text-muted hover:bg-soft",
  success: "bg-success text-white hover:bg-green-600 shadow-lg shadow-success/30",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
