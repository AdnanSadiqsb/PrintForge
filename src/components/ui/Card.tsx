import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
};

export const Card = ({
  children,
  className,
  title,
  description,
  ...props
}: PropsWithChildren<CardProps>) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] pt-1",
      className
    )}
    {...props}
  >
    {(title || description) && (
      <div className="mb-4">
        {title && <h3 className="text-sm font-medium text-slate-900">{title}</h3>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
    )}
    {children}
  </div>
);
