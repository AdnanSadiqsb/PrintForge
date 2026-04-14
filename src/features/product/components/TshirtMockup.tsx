import type { PropsWithChildren } from "react";
import type { EditorSide } from "../../../types";

type TshirtMockupProps = PropsWithChildren<{
  color: string;
  side: EditorSide;
}>;

export const TshirtMockup = ({ children, color, side }: TshirtMockupProps) => {
  const isBack = side === "back";
  const shirtImage =
    side === "back"
      ? "https://www.uberprints.com/content/products/float/870x960/gig500_2_wht.jpg"
      : "https://www.uberprints.com/content/products/float/870x960/gig500_1_wht.jpg";

  return (
    <div className="relative mx-auto aspect-[13/15] w-full max-w-[850px]">
      <div className="absolute inset-x-10 bottom-2 h-10 rounded-full bg-slate-300/30 blur-2xl" />
      <div
        className="absolute inset-0"
        style={{
          filter: isBack ? "saturate(0.97) brightness(0.985)" : "none",
        }}
      >
        <img
          alt={isBack ? "T-shirt back mockup" : "T-shirt front mockup"}
          className="h-full w-full object-contain"
          src={shirtImage}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          mixBlendMode: "multiply",
          opacity: color === "#FFFFFF" ? 0 : 0.22,
        }}
      />

      <div className="pointer-events-none absolute left-[55%] top-[18%] h-[370px] w-[300px] -translate-x-1/2 rounded-[24px] border border-dashed border-slate-200/70 bg-white/5" />

      <div className="absolute left-[55%] top-[18%] h-[370px] w-[300px] -translate-x-1/2">{children}</div>
    </div>
  );
};
