import {
  FiArrowLeft,
  FiArrowRight,
  FiRefreshCw,
  FiShare2,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import type { EditorSide } from "../../../types";
import { Button } from "../../../components/ui";
import { cn } from "../../../lib/utils";
import { useEditorStore } from "../../../hooks";

const sideOptions: EditorSide[] = ["front", "back"];

const toolbarButtonClass =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-[12px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900";
const toolbarGroupClass =
  "flex items-center gap-1 rounded-xl border border-slate-200/70 bg-white/80 px-1 py-1 shadow-[0_1px_2px_rgba(15,23,42,0.02)]";
const dividerClass = "h-4 w-px bg-slate-200/80";

export const TopToolbar = () => {
  const { activeSide, canRedo, canUndo, canvasControls, setActiveSide, zoom } = useEditorStore();

  return (
    <div className="border-b border-slate-200/70 bg-white/70 px-5 py-3 backdrop-blur-sm xl:px-6">
      <div className="flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
        <div className="flex min-w-fit items-center gap-3">
          {/* <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-sky-600/70">Editor Preview</p>
          <div className={dividerClass} /> */}
          <h2 className="text-[18px] font-medium tracking-[-0.02em] text-slate-900">Custom T-Shirt Designer</h2>
        </div>

        <div className="flex min-w-fit items-center gap-2">
          <div className={toolbarGroupClass}>
            <button
              className={cn(toolbarButtonClass, !canUndo && "pointer-events-none opacity-40")}
              onClick={canvasControls.undo}
              type="button"
            >
              <FiArrowLeft className="text-sm" />
              <span>Undo</span>
            </button>
            <button
              className={cn(toolbarButtonClass, !canRedo && "pointer-events-none opacity-40")}
              onClick={canvasControls.redo}
              type="button"
            >
              <FiArrowRight className="text-sm" />
              <span>Redo</span>
            </button>
          </div>

          <div className={dividerClass} />

          <div className={toolbarGroupClass}>
            {sideOptions.map((side) => (
              <button
                key={side}
                className={cn(
                  "h-8 rounded-lg px-3 text-[12px] font-medium capitalize transition",
                  activeSide === side
                    ? "bg-slate-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.1)]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={() => setActiveSide(side)}
                type="button"
              >
                {side}
              </button>
            ))}
          </div>

          <div className={dividerClass} />

          <div className={toolbarGroupClass}>
            <button className={toolbarButtonClass} onClick={canvasControls.zoomOut} type="button">
              <FiZoomOut className="text-sm" />
            </button>
            <span className="min-w-[52px] text-center text-[12px] font-medium text-slate-600">
              {Math.round(zoom * 100)}%
            </span>
            <button className={toolbarButtonClass} onClick={canvasControls.zoomIn} type="button">
              <FiZoomIn className="text-sm" />
            </button>
            <button className={toolbarButtonClass} onClick={canvasControls.resetView} type="button">
              <FiRefreshCw className="text-sm" />
              <span>Reset</span>
            </button>
          </div>

          <div className={dividerClass} />

          <Button className="h-8 px-3 text-[12px]" onClick={canvasControls.downloadPreview}>
            Save
          </Button>
          <Button className="h-8 gap-1.5 px-3 text-[12px]" onClick={canvasControls.shareDesign} variant="ghost">
            <FiShare2 className="text-sm" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};
