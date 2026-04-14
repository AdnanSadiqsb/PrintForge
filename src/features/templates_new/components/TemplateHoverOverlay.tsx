import { FiCheck, FiEye, FiZap } from "react-icons/fi";
import { cn } from "../../../lib/utils";

export const TemplateHoverOverlay = ({
  isApplied,
  onPreview,
}: {
  isApplied: boolean;
  onPreview?: () => void;
}) => (
  <div className="absolute inset-0 flex flex-col justify-between bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.74)_58%,rgba(15,23,42,0.88)_100%)] p-3 text-white opacity-100 transition duration-200 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
    <div className="flex justify-end gap-2">
      {onPreview && (
        <button
          className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 text-xs font-medium backdrop-blur transition hover:bg-white/20"
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
          type="button"
        >
          <FiEye />
          Preview
        </button>
      )}
    </div>

    <div className="space-y-2">
      {isApplied && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-50">
          <FiCheck />
          Applied
        </span>
      )}
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-1 py-1 text-xsm  shadow-lg backdrop-blur transition",
          isApplied ? "bg-emerald-400/20 text-emerald-50" : "bg-white text-slate-900"
        )}
      >
        <FiZap />
        {isApplied ? "Use Again" : "Use Temp.."}
      </div>
    </div>
  </div>
);
