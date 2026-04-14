import type { ReactNode } from "react";
import {
  FiAlignCenter,
  FiArrowDown,
  FiArrowUp,
  FiCornerDownLeft,
  FiCornerDownRight,
  FiCrop,
  FiImage,
  FiLock,
  FiMaximize2,
  FiMinimize2,
  FiMove,
  FiRefreshCw,
  FiSliders,
  FiSun,
  FiTrash2,
  FiUnlock,
} from "react-icons/fi";
import type { ImageAdjustments } from "./imageService";
import { cn } from "../../../lib/utils";

type ImagePropertiesPanelProps = {
  adjustments: ImageAdjustments;
  disabled: boolean;
  displayedHeight: number;
  displayedWidth: number;
  hasImage: boolean;
  hasUploadedImages?: boolean;
  isAspectLocked: boolean;
  opacity: number;
  position: { x: number; y: number };
  onDeleteSelected: () => void;
  qualityLabel: string;
  qualityTone: "good" | "ok" | "low" | "neutral";
  rotation: number;
  sourceInfo: { height: number; name: string; width: number };
  onAdjustmentChange: (updates: Partial<ImageAdjustments>) => void;
  onCenter: (axis: "x" | "y" | "both") => void;
  onFitMode: (mode: "contain" | "cover") => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onLayerChange: (direction: "forward" | "backward" | "front" | "back") => void;
  onLockAspectToggle: () => void;
  onOpacityChange: (value: number) => void;
  onPositionChange: (axis: "x" | "y", value: number) => void;
  onResetTransform: () => void;
  onRotationChange: (value: number) => void;
  onScaleBy: (delta: number) => void;
  onSizeChange: (axis: "width" | "height", value: number) => void;
};

const sectionTitleClass = "text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400";
const inputClass =
  "w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-300 disabled:bg-slate-50";
const chipButtonClass =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300";
const sliderClass = "h-1.5 w-full accent-sky-500";

const qualityToneMap = {
  good: "bg-emerald-50 text-emerald-700",
  low: "bg-rose-50 text-rose-700",
  neutral: "bg-slate-100 text-slate-600",
  ok: "bg-amber-50 text-amber-700",
};

const AdjustmentSlider = ({
  icon,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  icon: ReactNode;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) => (
  <div className="grid gap-2">
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span>{value.toFixed(step < 1 ? 2 : 0)}</span>
    </div>
    <input
      className={sliderClass}
      max={max}
      min={min}
      onChange={(event) => onChange(Number(event.target.value))}
      step={step}
      type="range"
      value={value}
    />
  </div>
);

const sectionCardClass = "rounded-[20px] border border-slate-200/80 bg-white p-3.5";

const EssentialImageControls = ({
  disabled,
  displayedHeight,
  displayedWidth,
  isAspectLocked,
  onCenter,
  onDeleteSelected,
  onLayerChange,
  onLockAspectToggle,
  onOpacityChange,
  onRotationChange,
  onSizeChange,
  opacity,
  rotation,
}: Pick<
  ImagePropertiesPanelProps,
  | "disabled"
  | "displayedHeight"
  | "displayedWidth"
  | "isAspectLocked"
  | "onCenter"
  | "onDeleteSelected"
  | "onLayerChange"
  | "onLockAspectToggle"
  | "onOpacityChange"
  | "onRotationChange"
  | "onSizeChange"
  | "opacity"
  | "rotation"
>) => (
  <div className={sectionCardClass}>
    <div className="grid gap-4">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Width</span>
          <input
            className={inputClass}
            disabled={disabled}
            onChange={(event) => onSizeChange("width", Number(event.target.value))}
            type="number"
            value={Math.round(displayedWidth)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Height</span>
          <input
            className={inputClass}
            disabled={disabled}
            onChange={(event) => onSizeChange("height", Number(event.target.value))}
            type="number"
            value={Math.round(displayedHeight)}
          />
        </label>
        <button className={chipButtonClass} disabled={disabled} onClick={onLockAspectToggle} type="button">
          {isAspectLocked ? <FiLock /> : <FiUnlock />}
          <span>{isAspectLocked ? "Locked" : "Free"}</span>
        </button>
      </div>

      <div className="grid grid-cols-[1fr_82px] items-center gap-3">
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">Rotation</span>
          <input
            className={sliderClass}
            disabled={disabled}
            max={180}
            min={-180}
            onChange={(event) => onRotationChange(Number(event.target.value))}
            step={1}
            type="range"
            value={rotation}
          />
        </label>
        <input
          className={inputClass}
          disabled={disabled}
          onChange={(event) => onRotationChange(Number(event.target.value))}
          type="number"
          value={rotation}
        />
      </div>

      <div className="grid grid-cols-[1fr_82px] items-center gap-3">
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-500">Opacity</span>
          <input
            className={sliderClass}
            disabled={disabled}
            max={100}
            min={5}
            onChange={(event) => onOpacityChange(Number(event.target.value))}
            step={1}
            type="range"
            value={Math.round(opacity * 100)}
          />
        </label>
        <input
          className={inputClass}
          disabled={disabled}
          onChange={(event) => onOpacityChange(Number(event.target.value))}
          type="number"
          value={Math.round(opacity * 100)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("forward")} type="button">
          <FiCornerDownRight />
          <span>Bring Forward</span>
        </button>
        <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("backward")} type="button">
          <FiCornerDownLeft />
          <span>Send Backward</span>
        </button>
        <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("x")} type="button">
          <FiAlignCenter />
          <span>Center X</span>
        </button>
        <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("y")} type="button">
          <FiMove />
          <span>Center Y</span>
        </button>
        <button
          className={cn(chipButtonClass, "border-rose-200 text-rose-600 hover:border-rose-300")}
          disabled={disabled}
          onClick={onDeleteSelected}
          type="button"
        >
          <FiTrash2 />
          <span>Delete</span>
        </button>
      </div>
    </div>
  </div>
);

const CollapsibleSection = ({
  children,
  defaultOpen = true,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  title: string;
}) => (
  <details className={sectionCardClass} open={defaultOpen}>
    <summary className="cursor-pointer list-none text-sm font-medium text-slate-800 [&::-webkit-details-marker]:hidden">
      <div className="flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs text-slate-400">Toggle</span>
      </div>
    </summary>
    <div className="mt-4">{children}</div>
  </details>
);

export const ImagePropertiesPanel = ({
  adjustments,
  disabled,
  displayedHeight,
  displayedWidth,
  hasImage,
  hasUploadedImages = false,
  isAspectLocked,
  opacity,
  position,
  onDeleteSelected,
  qualityLabel,
  qualityTone,
  rotation,
  sourceInfo,
  onAdjustmentChange,
  onCenter,
  onFitMode,
  onFlipX,
  onFlipY,
  onLayerChange,
  onLockAspectToggle,
  onOpacityChange,
  onPositionChange,
  onResetTransform,
  onRotationChange,
  onScaleBy,
  onSizeChange,
}: ImagePropertiesPanelProps) => {
  if (!hasImage) {
    if (hasUploadedImages) {
      return null;
    }

    return (
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
        <FiImage className="mx-auto text-2xl text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">Upload or select an image to edit</p>
        <p className="mt-1 text-xs text-slate-400">
          The most useful controls appear here automatically after you place artwork on the shirt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <p className={sectionTitleClass}>Essential Controls</p>
        <EssentialImageControls
          disabled={disabled}
          displayedHeight={displayedHeight}
          displayedWidth={displayedWidth}
          isAspectLocked={isAspectLocked}
          onCenter={onCenter}
          onDeleteSelected={onDeleteSelected}
          onLayerChange={onLayerChange}
          onLockAspectToggle={onLockAspectToggle}
          onOpacityChange={onOpacityChange}
          onRotationChange={onRotationChange}
          onSizeChange={onSizeChange}
          opacity={opacity}
          rotation={rotation}
        />
      </div>

      <CollapsibleSection title="Transform" defaultOpen={true}>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <button className={chipButtonClass} disabled={disabled} onClick={() => onScaleBy(0.08)} type="button">
              <FiMaximize2 />
              <span>Scale Up</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onScaleBy(-0.08)} type="button">
              <FiMinimize2 />
              <span>Scale Down</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={onFlipX} type="button">
              <span>Flip H</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={onFlipY} type="button">
              <span>Flip V</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={onResetTransform} type="button">
              <FiRefreshCw />
              <span>Reset</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={chipButtonClass} disabled={disabled} onClick={() => onFitMode("contain")} type="button">
              <FiCrop />
              <span>Fit in Print Area</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onFitMode("cover")} type="button">
              <FiCrop />
              <span>Fill Print Area</span>
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Adjustments" defaultOpen={true}>
        <div className="grid gap-4">
          <AdjustmentSlider
            icon={<FiSun />}
            label="Brightness"
            max={1}
            min={-1}
            onChange={(value) => onAdjustmentChange({ brightness: value })}
            step={0.05}
            value={adjustments.brightness}
          />
          <AdjustmentSlider
            icon={<FiSliders />}
            label="Contrast"
            max={1}
            min={-1}
            onChange={(value) => onAdjustmentChange({ contrast: value })}
            step={0.05}
            value={adjustments.contrast}
          />
          <AdjustmentSlider
            icon={<FiSliders />}
            label="Saturation"
            max={1}
            min={-1}
            onChange={(value) => onAdjustmentChange({ saturation: value })}
            step={0.05}
            value={adjustments.saturation}
          />
          <AdjustmentSlider
            icon={<FiSliders />}
            label="Blur"
            max={1}
            min={0}
            onChange={(value) => onAdjustmentChange({ blur: value })}
            step={0.01}
            value={adjustments.blur}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className={cn(chipButtonClass, adjustments.grayscale && "border-sky-200 bg-sky-50 text-slate-900")}
              disabled={disabled}
              onClick={() => onAdjustmentChange({ grayscale: !adjustments.grayscale })}
              type="button"
            >
              Grayscale
            </button>
            <button
              className={cn(chipButtonClass, adjustments.invert && "border-sky-200 bg-sky-50 text-slate-900")}
              disabled={disabled}
              onClick={() => onAdjustmentChange({ invert: !adjustments.invert })}
              type="button"
            >
              Invert
            </button>
            <button
              className={cn(chipButtonClass, adjustments.monochrome && "border-sky-200 bg-sky-50 text-slate-900")}
              disabled={disabled}
              onClick={() => onAdjustmentChange({ monochrome: !adjustments.monochrome })}
              type="button"
            >
              Monochrome
            </button>
          </div>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-500">Tint</span>
            <input
              className={cn(inputClass, "h-11 px-2")}
              disabled={disabled}
              onChange={(event) => onAdjustmentChange({ tint: event.target.value })}
              type="color"
              value={adjustments.tint}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Position & Layer" defaultOpen={true}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-500">X</span>
              <input
                className={inputClass}
                disabled={disabled}
                onChange={(event) => onPositionChange("x", Number(event.target.value))}
                type="number"
                value={Math.round(position.x)}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-500">Y</span>
              <input
                className={inputClass}
                disabled={disabled}
                onChange={(event) => onPositionChange("y", Number(event.target.value))}
                type="number"
                value={Math.round(position.y)}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("x")} type="button">
              <FiAlignCenter />
              <span>Center X</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("y")} type="button">
              <FiMove />
              <span>Center Y</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onCenter("both")} type="button">
              <FiAlignCenter />
              <span>Center All</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("front")} type="button">
              <FiArrowUp />
              <span>Bring Front</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("forward")} type="button">
              <FiCornerDownRight />
              <span>Bring Forward</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("backward")} type="button">
              <FiCornerDownLeft />
              <span>Send Backward</span>
            </button>
            <button className={chipButtonClass} disabled={disabled} onClick={() => onLayerChange("back")} type="button">
              <FiArrowDown />
              <span>Send to Back</span>
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Quality Info" defaultOpen={true}>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">Print quality</p>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", qualityToneMap[qualityTone])}>
              {qualityLabel}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Displayed size: {Math.round(displayedWidth)} x {Math.round(displayedHeight)}px
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Higher source resolution will keep printed details cleaner and edges sharper.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Source file: {sourceInfo.name || "Selected artwork"} · {sourceInfo.width} x {sourceInfo.height}px
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
};
