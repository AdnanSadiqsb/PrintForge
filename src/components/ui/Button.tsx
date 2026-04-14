import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({
  children,
  className,
  variant = "secondary",
  ...props
}: PropsWithChildren<ButtonProps>) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-100",
      variant === "primary" && "bg-slate-900/95 text-white hover:bg-slate-800",
      variant === "secondary" &&
        "border border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
      variant === "ghost" && "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      className
    )}
    type="button"
    {...props}
  >
    {children}
  </button>
);
