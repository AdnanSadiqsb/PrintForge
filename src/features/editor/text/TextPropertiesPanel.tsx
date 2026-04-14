import { useMemo, useState, type ReactNode, type Ref } from "react";
import type { fabric } from "fabric";
import { FiCheck, FiChevronDown, FiX } from "react-icons/fi";
import type { TextShape } from "./FabricTextService";
import { cn } from "../../../lib/utils";

export type FontOption = {
  category: string;
  family: string;
  label: string;
};

type TextProperties = {
  text: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: fabric.ITextOptions["fontStyle"];
  fontSize: number;
  lineHeight: number;
  charSpacing: number;
  textAlign: "left" | "center" | "right" | "justify";
  scaleX: number;
  scaleY: number;
  angle: number;
  fill: string;
  uppercase: boolean;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  left: number;
  top: number;
  shape: TextShape;
  curvature: number;
};

type TextPropertiesPanelProps = {
  disabled: boolean;
  fonts: FontOption[];
  swatches: string[];
  state: TextProperties;
  textActions?: ReactNode;
  textareaRef?: Ref<HTMLTextAreaElement>;
  onTextChange: (value: string) => void;
  onFontFamilyChange: (value: string) => void;
  onFontWeightChange: (value: string) => void;
  onFontStyleChange: (value: fabric.ITextOptions["fontStyle"]) => void;
  onFontSizeChange: (value: number) => void;
  onLineHeightChange: (value: number) => void;
  onCharSpacingChange: (value: number) => void;
  onTextAlignChange: (value: TextProperties["textAlign"]) => void;
  onScaleXChange: (value: number) => void;
  onScaleYChange: (value: number) => void;
  onAngleChange: (value: number) => void;
  onFillChange: (value: string) => void;
  onUppercaseToggle: (value: boolean) => void;
  onRgbChange: (target: "fill" | "stroke" | "shadow", channel: "r" | "g" | "b", value: number) => void;
  onStrokeChange: (value: string) => void;
  onStrokeWidthChange: (value: number) => void;
  onOpacityChange: (value: number) => void;
  onShadowColorChange: (value: string) => void;
  onShadowBlurChange: (value: number) => void;
  onShadowOffsetXChange: (value: number) => void;
  onShadowOffsetYChange: (value: number) => void;
  onShapeChange: (shape: TextShape) => void;
  onCurvatureChange: (value: number) => void;
  onCenter: (axis: "x" | "y" | "both") => void;
  onPositionChange: (axis: "x" | "y", value: number) => void;
  onLayerChange: (direction: "forward" | "backward" | "front" | "back") => void;
};

type ColorPanelKey = "fill" | "stroke" | "shadow" | null;

const SectionTitle = ({ children }: { children: string }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">{children}</p>
);

const inputBase =
  "w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-300 disabled:bg-slate-50";

const rangeBase = "h-1.5 w-full accent-sky-500 disabled:opacity-40";
const labelBase = "text-xs font-medium text-slate-500";
const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return { r: 17, g: 24, b: 39 };
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const ColorChip = ({
  active,
  color,
  disabled,
  empty,
  label,
  onClick,
}: {
  active: boolean;
  color: string;
  disabled: boolean;
  empty?: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    className={cn(
      "flex items-center gap-2 rounded-2xl border px-3 py-2 text-left transition",
      active ? "border-sky-200 bg-sky-50/80" : "border-slate-200/80 bg-white hover:border-slate-300",
      disabled && "pointer-events-none opacity-50"
    )}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    <span className="text-sm font-medium text-slate-600">{label}</span>
    <span className="relative h-8 w-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {!empty && <span className="absolute inset-0" style={{ backgroundColor: color }} />}
      {empty && <span className="absolute inset-0 bg-white" />}
      {empty && <span className="absolute inset-0 origin-center rotate-45 border-t-[3px] border-red-500" />}
    </span>
  </button>
);

const FontBrowserCard = ({
  active,
  font,
  onSelect,
}: {
  active: boolean;
  font: FontOption;
  onSelect: (family: string) => void;
}) => (
  <button
    className={cn(
      "relative flex min-h-[74px] items-center justify-center rounded-2xl border bg-white px-4 py-4 text-center transition",
      active ? "border-sky-300 shadow-[0_10px_28px_rgba(14,165,233,0.12)]" : "border-slate-200/80 hover:border-slate-300"
    )}
    onClick={() => onSelect(font.family)}
    style={{ fontFamily: font.family }}
    type="button"
  >
    <span className="text-[16px] text-slate-800">{font.label}</span>
    {active && <FiCheck className="absolute right-3 top-3 text-sky-500" />}
  </button>
);

const ColorPickerPanel = ({
  color,
  disabled,
  hasNone,
  hexLabel,
  rgb,
  swatches,
  title,
  target,
  onColorChange,
  onClear,
  onRgbChange,
  extra,
}: {
  color: string;
  disabled: boolean;
  extra?: ReactNode;
  hasNone?: boolean;
  hexLabel: string;
  onClear?: () => void;
  rgb: { r: number; g: number; b: number };
  swatches: string[];
  title: string;
  target: "fill" | "stroke" | "shadow";
  onColorChange: (value: string) => void;
  onRgbChange: (target: "fill" | "stroke" | "shadow", channel: "r" | "g" | "b", value: number) => void;
}) => (
  <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">{hexLabel}</span>
    </div>

    <div className="grid grid-cols-[110px_1fr] gap-3">
      <input
        className={cn(inputBase, "h-11 px-2")}
        disabled={disabled}
        onChange={(event) => onColorChange(event.target.value)}
        type="color"
        value={color}
      />
      <input
        className={inputBase}
        disabled={disabled}
        onChange={(event) => onColorChange(event.target.value)}
        type="text"
        value={color}
      />
    </div>

    <div className="grid grid-cols-3 gap-3">
      {(["r", "g", "b"] as const).map((channel) => (
        <label key={channel} className="space-y-1">
          <span className={labelBase}>{channel.toUpperCase()}</span>
          <input
            className={inputBase}
            disabled={disabled}
            max={255}
            min={0}
            onChange={(event) => onRgbChange(target, channel, Number(event.target.value))}
            step={1}
            type="number"
            value={rgb[channel]}
          />
        </label>
      ))}
    </div>

    <div className="flex flex-wrap gap-2">
      {hasNone && (
        <button
          className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-white"
          disabled={disabled}
          onClick={() => onClear?.()}
          type="button"
        >
          <span className="absolute inset-0 origin-center rotate-45 border-t-[3px] border-red-500" />
        </button>
      )}
      {swatches.map((swatch) => (
        <button
          key={swatch}
          className={cn(
            "h-9 w-9 rounded-lg border transition",
            color.toLowerCase() === swatch.toLowerCase() ? "border-slate-900" : "border-slate-200 hover:border-slate-300"
          )}
          disabled={disabled}
          onClick={() => onColorChange(swatch)}
          style={{ backgroundColor: swatch }}
          type="button"
        />
      ))}
    </div>

    {extra}
  </div>
);

export const TextPropertiesPanel = ({
  disabled,
  fonts,
  swatches,
  state,
  textActions,
  textareaRef,
  onTextChange,
  onFontFamilyChange,
  onFontWeightChange,
  onFontStyleChange,
  onFontSizeChange,
  onLineHeightChange,
  onCharSpacingChange,
  onTextAlignChange,
  onScaleXChange,
  onScaleYChange,
  onAngleChange,
  onFillChange,
  onUppercaseToggle,
  onRgbChange,
  onStrokeChange,
  onStrokeWidthChange,
  onOpacityChange,
  onShadowColorChange,
  onShadowBlurChange,
  onShadowOffsetXChange,
  onShadowOffsetYChange,
  onShapeChange,
  onCurvatureChange,
  onCenter,
  onPositionChange,
  onLayerChange,
}: TextPropertiesPanelProps) => {
  const [activeColorPanel, setActiveColorPanel] = useState<ColorPanelKey>(null);
  const [isFontBrowserOpen, setIsFontBrowserOpen] = useState(false);

  const selectedFont = useMemo(
    () => fonts.find((font) => font.family === state.fontFamily) ?? fonts[0],
    [fonts, state.fontFamily]
  );
  const fillRgb = useMemo(() => hexToRgb(state.fill), [state.fill]);
  const strokeRgb = useMemo(() => hexToRgb(state.stroke), [state.stroke]);
  const shadowRgb = useMemo(() => hexToRgb(state.shadowColor), [state.shadowColor]);
  const fontGroups = useMemo(() => {
    const grouped = new Map<string, FontOption[]>();
    fonts.forEach((font) => {
      const current = grouped.get(font.category) ?? [];
      current.push(font);
      grouped.set(font.category, current);
    });
    return Array.from(grouped.entries());
  }, [fonts]);

  return (
    <div className="relative space-y-7">
      <div className="space-y-3">
        <SectionTitle>Text Content</SectionTitle>
      <textarea
        className={cn(inputBase, "min-h-[96px] resize-none")}
        disabled={disabled}
          ref={textareaRef}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Type your design copy"
        rows={4}
        value={state.text}
      />
      {textActions && <div className="flex flex-wrap items-center gap-3">{textActions}</div>}
    </div>

      <div className="space-y-3">
        <SectionTitle>Font</SectionTitle>
        <button
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left transition hover:border-slate-300",
            disabled && "pointer-events-none opacity-50"
          )}
          disabled={disabled}
          onClick={() => setIsFontBrowserOpen(true)}
          type="button"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Font family</p>
            <p className="mt-1 text-[28px] text-slate-800" style={{ fontFamily: selectedFont.family }}>
              {selectedFont.label}
            </p>
          </div>
          <FiChevronDown className="text-lg text-slate-400" />
        </button>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className={labelBase}>Weight</span>
            <select
              className={inputBase}
              disabled={disabled}
              onChange={(event) => onFontWeightChange(event.target.value)}
              value={state.fontWeight}
            >
              <option value="400">Normal</option>
              <option value="600">Semibold</option>
              <option value="700">Bold</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelBase}>Style</span>
            <select
              className={inputBase}
              disabled={disabled}
              onChange={(event) => onFontStyleChange(event.target.value as fabric.ITextOptions["fontStyle"])}
              value={state.fontStyle}
            >
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <SectionTitle>Color & Effects</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <ColorChip
            active={activeColorPanel === "fill"}
            color={state.fill}
            disabled={disabled}
            label="Color"
            onClick={() => setActiveColorPanel(activeColorPanel === "fill" ? null : "fill")}
          />
          <ColorChip
            active={activeColorPanel === "stroke"}
            color={state.stroke}
            disabled={disabled}
            empty={state.strokeWidth === 0}
            label="Stroke"
            onClick={() => setActiveColorPanel(activeColorPanel === "stroke" ? null : "stroke")}
          />
          <ColorChip
            active={activeColorPanel === "shadow"}
            color={state.shadowColor}
            disabled={disabled}
            empty={state.shadowBlur === 0 && state.shadowOffsetX === 0 && state.shadowOffsetY === 0}
            label="Shadow"
            onClick={() => setActiveColorPanel(activeColorPanel === "shadow" ? null : "shadow")}
          />
        </div>

        {activeColorPanel === "fill" && (
          <ColorPickerPanel
            color={state.fill}
            disabled={disabled}
            hexLabel="Fill"
            rgb={fillRgb}
            swatches={swatches}
            target="fill"
            title="Text color"
            onColorChange={onFillChange}
            onRgbChange={onRgbChange}
          />
        )}

        {activeColorPanel === "stroke" && (
          <ColorPickerPanel
            color={state.stroke}
            disabled={disabled}
            extra={
              <div className="grid grid-cols-[1fr_110px] items-center gap-3">
                <label className="space-y-2">
                  <span className={labelBase}>Width</span>
                  <input
                    className={rangeBase}
                    disabled={disabled}
                    max={12}
                    min={0}
                    onChange={(event) => onStrokeWidthChange(Number(event.target.value))}
                    step={0.5}
                    type="range"
                    value={state.strokeWidth}
                  />
                </label>
                <input
                  className={inputBase}
                  disabled={disabled}
                  max={12}
                  min={0}
                  onChange={(event) => onStrokeWidthChange(Number(event.target.value))}
                  step={0.5}
                  type="number"
                  value={state.strokeWidth}
                />
              </div>
            }
            hasNone
            hexLabel="Outline"
            onClear={() => onStrokeWidthChange(0)}
            rgb={strokeRgb}
            swatches={swatches}
            target="stroke"
            title="Stroke color"
            onColorChange={onStrokeChange}
            onRgbChange={onRgbChange}
          />
        )}

        {activeColorPanel === "shadow" && (
          <ColorPickerPanel
            color={state.shadowColor}
            disabled={disabled}
            extra={
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className={labelBase}>Distance X</span>
                    <input
                      className={inputBase}
                      disabled={disabled}
                      max={40}
                      min={-40}
                      onChange={(event) => onShadowOffsetXChange(Number(event.target.value))}
                      step={1}
                      type="number"
                      value={state.shadowOffsetX}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelBase}>Distance Y</span>
                    <input
                      className={inputBase}
                      disabled={disabled}
                      max={40}
                      min={-40}
                      onChange={(event) => onShadowOffsetYChange(Number(event.target.value))}
                      step={1}
                      type="number"
                      value={state.shadowOffsetY}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-[1fr_110px] items-center gap-3">
                  <label className="space-y-2">
                    <span className={labelBase}>Blur</span>
                    <input
                      className={rangeBase}
                      disabled={disabled}
                      max={40}
                      min={0}
                      onChange={(event) => onShadowBlurChange(Number(event.target.value))}
                      step={1}
                      type="range"
                      value={state.shadowBlur}
                    />
                  </label>
                  <input
                    className={inputBase}
                    disabled={disabled}
                    max={40}
                    min={0}
                    onChange={(event) => onShadowBlurChange(Number(event.target.value))}
                    step={1}
                    type="number"
                    value={state.shadowBlur}
                  />
                </div>
              </div>
            }
            hasNone
            hexLabel="Shadow"
            onClear={() => {
              onShadowBlurChange(0);
              onShadowOffsetXChange(0);
              onShadowOffsetYChange(0);
            }}
            rgb={shadowRgb}
            swatches={swatches}
            target="shadow"
            title="Shadow color"
            onColorChange={onShadowColorChange}
            onRgbChange={onRgbChange}
          />
        )}

        <div className="grid grid-cols-[1fr_90px] items-center gap-3">
          <label className="space-y-2">
            <span className={labelBase}>Opacity</span>
            <input
              className={rangeBase}
              disabled={disabled}
              max={100}
              min={0}
              onChange={(event) => onOpacityChange(Number(event.target.value))}
              step={1}
              type="range"
              value={Math.round(state.opacity * 100)}
            />
          </label>
          <input
            className={inputBase}
            disabled={disabled}
            max={100}
            min={0}
            onChange={(event) => onOpacityChange(Number(event.target.value))}
            step={1}
            type="number"
            value={Math.round(state.opacity * 100)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <SectionTitle>Size & Spacing</SectionTitle>
        <div className="grid gap-4">
          <div className="grid grid-cols-[1fr_90px] items-center gap-3">
            <label className="space-y-2">
              <span className={labelBase}>Font size</span>
              <input
                className={rangeBase}
                disabled={disabled}
                max={160}
                min={10}
                onChange={(event) => onFontSizeChange(Number(event.target.value))}
                step={1}
                type="range"
                value={state.fontSize}
              />
            </label>
            <input
              className={inputBase}
              disabled={disabled}
              max={160}
              min={10}
              onChange={(event) => onFontSizeChange(Number(event.target.value))}
              step={1}
              type="number"
              value={state.fontSize}
            />
          </div>

          <div className="grid grid-cols-[1fr_90px] items-center gap-3">
            <label className="space-y-2">
              <span className={labelBase}>Line height</span>
              <input
                className={rangeBase}
                disabled={disabled}
                max={2}
                min={0.8}
                onChange={(event) => onLineHeightChange(Number(event.target.value))}
                step={0.05}
                type="range"
                value={state.lineHeight}
              />
            </label>
            <input
              className={inputBase}
              disabled={disabled}
              max={2}
              min={0.8}
              onChange={(event) => onLineHeightChange(Number(event.target.value))}
              step={0.05}
              type="number"
              value={state.lineHeight}
            />
          </div>

          <div className="grid grid-cols-[1fr_90px] items-center gap-3">
            <label className="space-y-2">
              <span className={labelBase}>Letter spacing</span>
              <input
                className={rangeBase}
                disabled={disabled}
                max={200}
                min={-20}
                onChange={(event) => onCharSpacingChange(Number(event.target.value))}
                step={1}
                type="range"
                value={state.charSpacing}
              />
            </label>
            <input
              className={inputBase}
              disabled={disabled}
              max={200}
              min={-20}
              onChange={(event) => onCharSpacingChange(Number(event.target.value))}
              step={1}
              type="number"
              value={state.charSpacing}
            />
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-3 py-3">
            <span className="text-sm font-medium text-slate-700">Uppercase</span>
            <input
              checked={state.uppercase}
              disabled={disabled}
              onChange={(event) => onUppercaseToggle(event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <SectionTitle>Transform</SectionTitle>
        <div className="grid gap-4">
          <div className="grid grid-cols-[1fr_90px] items-center gap-3">
            <label className="space-y-2">
              <span className={labelBase}>Rotation</span>
              <input
                className={rangeBase}
                disabled={disabled}
                max={180}
                min={-180}
                onChange={(event) => onAngleChange(Number(event.target.value))}
                step={1}
                type="range"
                value={state.angle}
              />
            </label>
            <input
              className={inputBase}
              disabled={disabled}
              max={180}
              min={-180}
              onChange={(event) => onAngleChange(Number(event.target.value))}
              step={1}
              type="number"
              value={state.angle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className={labelBase}>Scale X</span>
              <input
                className={inputBase}
                disabled={disabled}
                max={2}
                min={0.5}
                onChange={(event) => onScaleXChange(Number(event.target.value))}
                step={0.05}
                type="number"
                value={state.scaleX}
              />
            </label>
            <label className="space-y-1">
              <span className={labelBase}>Scale Y</span>
              <input
                className={inputBase}
                disabled={disabled}
                max={2}
                min={0.5}
                onChange={(event) => onScaleYChange(Number(event.target.value))}
                step={0.05}
                type="number"
                value={state.scaleY}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className={labelBase}>Position X</span>
              <input
                className={inputBase}
                disabled={disabled}
                onChange={(event) => onPositionChange("x", Number(event.target.value))}
                step={1}
                type="number"
                value={Math.round(state.left)}
              />
            </label>
            <label className="space-y-1">
              <span className={labelBase}>Position Y</span>
              <input
                className={inputBase}
                disabled={disabled}
                onChange={(event) => onPositionChange("y", Number(event.target.value))}
                step={1}
                type="number"
                value={Math.round(state.top)}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Center X", value: "x" as const },
              { label: "Center Y", value: "y" as const },
              { label: "Center Both", value: "both" as const },
            ].map((item) => (
              <button
                key={item.label}
                className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300"
                disabled={disabled}
                onClick={() => onCenter(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Bring Front", value: "front" as const },
              { label: "Bring Forward", value: "forward" as const },
              { label: "Send Backward", value: "backward" as const },
              { label: "Send to Back", value: "back" as const },
            ].map((item) => (
              <button
                key={item.label}
                className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300"
                disabled={disabled}
                onClick={() => onLayerChange(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionTitle>Text Shape</SectionTitle>
        <div className="grid gap-3">
          <select
            className={inputBase}
            disabled={disabled}
            onChange={(event) => onShapeChange(event.target.value as TextShape)}
            value={state.shape}
          >
            <option value="straight">Straight</option>
            <option value="arc-up">Arc Up</option>
            <option value="arc-down">Arc Down</option>
          </select>
          <div className="grid grid-cols-[1fr_90px] items-center gap-3">
            <label className="space-y-2">
              <span className={labelBase}>Curvature</span>
              <input
                className={rangeBase}
                disabled={disabled || state.shape === "straight"}
                max={100}
                min={0}
                onChange={(event) => onCurvatureChange(Number(event.target.value))}
                step={1}
                type="range"
                value={state.curvature}
              />
            </label>
            <input
              className={inputBase}
              disabled={disabled || state.shape === "straight"}
              max={100}
              min={0}
              onChange={(event) => onCurvatureChange(Number(event.target.value))}
              step={1}
              type="number"
              value={state.curvature}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionTitle>Alignment</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {(["left", "center", "right", "justify"] as const).map((align) => (
            <button
              key={align}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium transition",
                state.textAlign === align
                  ? "border-sky-200 bg-sky-50 text-slate-900"
                  : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300"
              )}
              disabled={disabled}
              onClick={() => onTextAlignChange(align)}
              type="button"
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {isFontBrowserOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4">
          <div className="max-h-[85vh] w-full max-w-[900px] overflow-hidden rounded-[28px] border border-slate-200 bg-[#f7f8fb] shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between bg-slate-700 px-5 py-4 text-white">
              <p className="text-base font-medium">Choose a Font</p>
              <button
                className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                onClick={() => setIsFontBrowserOpen(false)}
                type="button"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="max-h-[calc(85vh-64px)] overflow-y-auto p-4">
              <div className="space-y-6">
                {fontGroups.map(([group, items]) => (
                  <div key={group} className="space-y-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">{group}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((font) => (
                        <FontBrowserCard
                          key={font.family}
                          active={state.fontFamily === font.family}
                          font={font}
                          onSelect={(family) => {
                            onFontFamilyChange(family);
                            setIsFontBrowserOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
