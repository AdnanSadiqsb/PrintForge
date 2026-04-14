import { FiAlignCenter, FiCornerDownLeft, FiCornerDownRight, FiLock, FiMove, FiRefreshCw, FiSlash, FiTrash2, FiUnlock } from "react-icons/fi";
import { cn } from "../../../lib/utils";
import type { EditorShapeType, ShapeDashStyle, ShapeEditorState } from "./shape.types";

type ShapePropertiesPanelProps = {
  disabled: boolean;
  onCenter: (axis: "x" | "y" | "both") => void;
  onDashStyleChange: (value: ShapeDashStyle) => void;
  onDeleteSelected: () => void;
  onFillChange: (value: string) => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onLayerChange: (direction: "forward" | "backward" | "front" | "back") => void;
  onLockAspectToggle: () => void;
  onOpacityChange: (value: number) => void;
  onPositionChange: (axis: "x" | "y", value: number) => void;
  onRadiusChange: (value: number) => void;
  onResetTransform: () => void;
  onRotationChange: (value: number) => void;
  onRxChange: (value: number) => void;
  onRyChange: (value: number) => void;
  onSizeChange: (axis: "width" | "height", value: number) => void;
  onStarPointsChange: (value: number) => void;
  onStrokeChange: (value: string) => void;
  onStrokeWidthChange: (value: number) => void;
  state: ShapeEditorState;
};

const inputClass =
  "w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-300 disabled:bg-slate-50";
const chipButtonClass =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300";
const sliderClass = "h-1.5 w-full accent-sky-500";
const sectionCardClass = "rounded-[20px] border border-slate-200/80 bg-white p-3.5";
const sectionTitleClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400";

const supportsFill = (shapeType: EditorShapeType) => shapeType !== "line";
const supportsRadius = (shapeType: EditorShapeType) => shapeType === "circle" || shapeType === "ellipse";
const supportsCornerRadius = (shapeType: EditorShapeType) => shapeType === "rect" || shapeType === "rounded-rect";
const supportsStarPoints = (shapeType: EditorShapeType) => shapeType === "star";

export const ShapePropertiesPanel = ({
  disabled,
  onCenter,
  onDashStyleChange,
  onDeleteSelected,
  onFillChange,
  onFlipX,
  onFlipY,
  onLayerChange,
  onLockAspectToggle,
  onOpacityChange,
  onPositionChange,
  onRadiusChange,
  onResetTransform,
  onRotationChange,
  onRxChange,
  onRyChange,
  onSizeChange,
  onStarPointsChange,
  onStrokeChange,
  onStrokeWidthChange,
  state,
}: ShapePropertiesPanelProps) => {
  if (!state.hasShape) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">Insert or select a shape to edit</p>
        <p className="mt-1 text-xs text-slate-400">Shapes stay fully editable on canvas and inside templates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <p className={sectionTitleClass}>Transform</p>
        <div className={sectionCardClass}>
          <div className="grid gap-4">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Width</span>
                <input className={inputClass} disabled={disabled} onChange={(event) => onSizeChange("width", Number(event.target.value))} type="number" value={Math.round(state.displayedWidth)} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Height</span>
                <input className={inputClass} disabled={disabled} onChange={(event) => onSizeChange("height", Number(event.target.value))} type="number" value={Math.round(state.displayedHeight)} />
              </label>
              <button className={chipButtonClass} disabled={disabled} onClick={onLockAspectToggle} type="button">
                {state.isAspectLocked ? <FiLock /> : <FiUnlock />}
                <span>{state.isAspectLocked ? "Locked" : "Free"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Position X</span>
                <input className={inputClass} disabled={disabled} onChange={(event) => onPositionChange("x", Number(event.target.value))} type="number" value={state.left} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Position Y</span>
                <input className={inputClass} disabled={disabled} onChange={(event) => onPositionChange("y", Number(event.target.value))} type="number" value={state.top} />
              </label>
            </div>

            <div className="grid grid-cols-[1fr_82px] items-center gap-3">
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-500">Rotation</span>
                <input className={sliderClass} disabled={disabled} max={180} min={-180} onChange={(event) => onRotationChange(Number(event.target.value))} step={1} type="range" value={state.rotation} />
              </label>
              <input className={inputClass} disabled={disabled} onChange={(event) => onRotationChange(Number(event.target.value))} type="number" value={state.rotation} />
            </div>

            <div className="grid grid-cols-[1fr_82px] items-center gap-3">
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-500">Opacity</span>
                <input className={sliderClass} disabled={disabled} max={100} min={5} onChange={(event) => onOpacityChange(Number(event.target.value))} step={1} type="range" value={Math.round(state.opacity * 100)} />
              </label>
              <input className={inputClass} disabled={disabled} onChange={(event) => onOpacityChange(Number(event.target.value))} type="number" value={Math.round(state.opacity * 100)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("x")} type="button"><FiAlignCenter /><span>Center X</span></button>
              <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("y")} type="button"><FiMove /><span>Center Y</span></button>
              <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("both")} type="button"><FiAlignCenter /><span>Center All</span></button>
              <button className={chipButtonClass} disabled={disabled} onClick={onFlipX} type="button"><span>Flip H</span></button>
              <button className={chipButtonClass} disabled={disabled} onClick={onFlipY} type="button"><span>Flip V</span></button>
              <button className={chipButtonClass} disabled={disabled} onClick={onResetTransform} type="button"><FiRefreshCw /><span>Reset</span></button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className={sectionTitleClass}>Appearance</p>
        <div className={sectionCardClass}>
          <div className="grid gap-4">
            {supportsFill(state.shapeType) && (
              <div className="grid grid-cols-[72px_1fr] items-center gap-3">
                <input className="h-11 w-full rounded-xl border border-slate-200/80 bg-white p-1" disabled={disabled} onChange={(event) => onFillChange(event.target.value)} type="color" value={state.fill} />
                <input className={inputClass} disabled={disabled} onChange={(event) => onFillChange(event.target.value)} value={state.fill} />
              </div>
            )}

            <div className="grid grid-cols-[72px_1fr] items-center gap-3">
              <input className="h-11 w-full rounded-xl border border-slate-200/80 bg-white p-1" disabled={disabled} onChange={(event) => onStrokeChange(event.target.value)} type="color" value={state.stroke} />
              <input className={inputClass} disabled={disabled} onChange={(event) => onStrokeChange(event.target.value)} value={state.stroke} />
            </div>

            <div className="grid grid-cols-[1fr_120px] gap-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Stroke Width</span>
                <input className={inputClass} disabled={disabled} min={0} onChange={(event) => onStrokeWidthChange(Number(event.target.value))} type="number" value={state.strokeWidth} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Dash</span>
                <select className={inputClass} disabled={disabled} onChange={(event) => onDashStyleChange(event.target.value as ShapeDashStyle)} value={state.dashStyle}>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                </select>
              </label>
            </div>

            {supportsCornerRadius(state.shapeType) && (
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Radius X</span>
                  <input className={inputClass} disabled={disabled} min={0} onChange={(event) => onRxChange(Number(event.target.value))} type="number" value={state.rx} />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Radius Y</span>
                  <input className={inputClass} disabled={disabled} min={0} onChange={(event) => onRyChange(Number(event.target.value))} type="number" value={state.ry} />
                </label>
              </div>
            )}

            {supportsRadius(state.shapeType) && (
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">{state.shapeType === "ellipse" ? "Radius" : "Circle Radius"}</span>
                <input className={inputClass} disabled={disabled} min={1} onChange={(event) => onRadiusChange(Number(event.target.value))} type="number" value={state.radius} />
              </label>
            )}

            {supportsStarPoints(state.shapeType) && (
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Star Points</span>
                <input className={inputClass} disabled={disabled} max={12} min={4} onChange={(event) => onStarPointsChange(Number(event.target.value))} type="number" value={state.starPoints} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className={sectionTitleClass}>Layer</p>
        <div className={sectionCardClass}>
          <div className="flex flex-wrap gap-2">
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("forward")} type="button"><FiCornerDownRight /><span>Bring Forward</span></button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("backward")} type="button"><FiCornerDownLeft /><span>Send Backward</span></button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("front")} type="button"><FiAlignCenter /><span>Bring Front</span></button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("back")} type="button"><FiSlash /><span>Send Back</span></button>
            <button className={cn(chipButtonClass, "border-rose-200 text-rose-600 hover:border-rose-300")} disabled={disabled} onClick={onDeleteSelected} type="button"><FiTrash2 /><span>Delete</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};
