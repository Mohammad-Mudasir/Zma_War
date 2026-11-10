import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerOutline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-pine-600 text-white hover:bg-pine-700",
  secondary: "bg-surface text-ink border border-line hover:bg-pine-50",
  ghost: "text-pine-700 hover:bg-pine-50",
  danger: "bg-pomegranate-600 text-white hover:bg-pomegranate-700",
  dangerOutline: "border border-pomegranate-600 text-pomegranate-700 hover:bg-pomegranate-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-13 px-7 text-lg",
};

/** Class names so links (<Link>) can look exactly like buttons. */
export function buttonClass(opts: { variant?: Variant; size?: Size; className?: string } = {}): string {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[opts.variant ?? "primary"],
    sizes[opts.size ?? "md"],
    opts.className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}
