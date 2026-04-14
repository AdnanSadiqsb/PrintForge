import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import { FiPlus, FiTrash2, FiType } from "react-icons/fi";
import { Card, Button } from "../../../components/ui";
import { useEditorStore } from "../../../hooks";
import {
  addTextObject,
  applyTextShape,
  centerText,
  getActiveTextObject,
  reorderTextLayer,
  updateTextObject,
  type TextShape,
} from "./FabricTextService";
import { TextPropertiesPanel, type FontOption } from "./TextPropertiesPanel";

type TextEditorState = {
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

const FONT_OPTIONS: FontOption[] = [
  { category: "Popular", family: "Inter", label: "Inter" },
  { category: "Popular", family: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { category: "Popular", family: "Manrope", label: "Manrope" },
  { category: "Popular", family: "Outfit", label: "Outfit" },
  { category: "Sans Serif", family: "Poppins", label: "Poppins" },
  { category: "Sans Serif", family: "Montserrat", label: "Montserrat" },
  { category: "Sans Serif", family: "DM Sans", label: "DM Sans" },
  { category: "Sans Serif", family: "Urbanist", label: "Urbanist" },
  { category: "Sans Serif", family: "Raleway", label: "Raleway" },
  { category: "Heavy", family: "Oswald", label: "Oswald" },
  { category: "Heavy", family: "Archivo Black", label: "Archivo Black" },
  { category: "Heavy", family: "Barlow Condensed", label: "Barlow Condensed" },
  { category: "Elegant", family: "Playfair Display", label: "Playfair" },
  { category: "Elegant", family: "Cormorant Garamond", label: "Cormorant" },
  { category: "Modern", family: "Space Grotesk", label: "Space Grotesk" },
  { category: "Modern", family: "Syne", label: "Syne" },
  { category: "Modern", family: "Rubik", label: "Rubik" },
  { category: "Basic", family: "Source Sans 3", label: "Source Sans 3" },
  { category: "Serif", family: "Lora", label: "Lora" },
  { category: "Serif", family: "Libre Baskerville", label: "Libre Baskerville" },
  { category: "Handwriting", family: "Caveat", label: "Caveat" },
  { category: "Script", family: "Pacifico", label: "Pacifico" },
  { category: "Brush", family: "Satisfy", label: "Satisfy" },
  { category: "Fun", family: "Bangers", label: "Bangers" },
  { category: "Retro", family: "Bebas Neue", label: "Bebas Neue" },
  { category: "Decorative", family: "Abril Fatface", label: "Abril Fatface" },
  { category: "Youthful", family: "Amatic SC", label: "Amatic SC" },
  { category: "Distressed", family: "Permanent Marker", label: "Permanent Marker" },
];

const SWATCHES = ["#111827", "#2563EB", "#DC2626", "#059669", "#D97706", "#0F172A", "#FFFFFF"];

const DEFAULT_STATE: TextEditorState = {
  text: "Your text here",
  fontFamily: "Inter",
  fontWeight: "600",
  fontStyle: "normal",
  fontSize: 36,
  lineHeight: 1.2,
  charSpacing: 0,
  textAlign: "center",
  scaleX: 1,
  scaleY: 1,
  angle: 0,
  fill: "#111827",
  uppercase: false,
  stroke: "#111827",
  strokeWidth: 0,
  opacity: 1,
  shadowColor: "#0f172a",
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  left: 0,
  top: 0,
  shape: "straight",
  curvature: 0,
};

const normalizeFontWeight = (weight?: string | number) => {
  if (typeof weight === "number") {
    return `${weight}`;
  }
  if (!weight) {
    return "600";
  }
  const value = `${weight}`.toLowerCase();
  if (value === "bold") {
    return "700";
  }
  if (value === "normal") {
    return "400";
  }
  return value;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeColor = (value: string) => {
  if (!value.startsWith("#")) {
    const trimmed = value.trim();
    if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
      return `#${trimmed}`;
    }
    return value;
  }
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

export const TextTool = () => {
  const { editor, canvasControls } = useEditorStore();
  const [state, setState] = useState<TextEditorState>(DEFAULT_STATE);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const stateRef = useRef<TextEditorState>(DEFAULT_STATE);
  const isApplyingUiUpdateRef = useRef(false);

  const syncFromCanvas = useCallback(() => {
    if (isApplyingUiUpdateRef.current) {
      isApplyingUiUpdateRef.current = false;
      return;
    }

    const active = getActiveTextObject(editor);
    if (!active) {
      setIsTextSelected(false);
      return;
    }

    const shadow =
      active.shadow && typeof active.shadow === "object"
        ? active.shadow
        : { color: "#0f172a", blur: 0, offsetX: 0, offsetY: 0 };

    const data = active.data as Record<string, unknown> | undefined;

    setState((prev) => {
      const shadowValue = (shadow as fabric.Shadow).color;
      const fallbackShadowColor: string = typeof prev.shadowColor === "string" ? prev.shadowColor : "#0f172a";
      const safeShadowColor: string = typeof shadowValue === "string" ? shadowValue : fallbackShadowColor;

      const nextState: TextEditorState = {
        ...prev,
        text: active.text ?? prev.text,
        fontFamily: active.fontFamily ?? prev.fontFamily,
        fontSize: Math.round(active.fontSize ?? prev.fontSize),
        fontWeight: normalizeFontWeight(active.fontWeight),
        fontStyle: (active.fontStyle ?? "normal") as fabric.ITextOptions["fontStyle"],
        textAlign: (active.textAlign as TextEditorState["textAlign"]) ?? "center",
        lineHeight: active.lineHeight ?? prev.lineHeight,
        charSpacing: active.charSpacing ?? 0,
        scaleX: active.scaleX ?? 1,
        scaleY: active.scaleY ?? 1,
        angle: Math.round(active.angle ?? 0),
        fill: typeof active.fill === "string" ? active.fill : prev.fill,
        uppercase: typeof active.text === "string" ? active.text === active.text.toUpperCase() && active.text !== active.text.toLowerCase() : prev.uppercase,
        stroke: typeof active.stroke === "string" ? active.stroke : prev.stroke,
        strokeWidth: active.strokeWidth ?? 0,
        opacity: active.opacity ?? 1,
        shadowColor: safeShadowColor,
        shadowBlur: (shadow as fabric.Shadow).blur ?? 0,
        shadowOffsetX: (shadow as fabric.Shadow).offsetX ?? 0,
        shadowOffsetY: (shadow as fabric.Shadow).offsetY ?? 0,
        left: active.left ?? prev.left,
        top: active.top ?? prev.top,
        shape: (data?.textShape as TextShape) ?? "straight",
        curvature: typeof data?.textCurvature === "number" ? (data.textCurvature as number) : 0,
      };
      stateRef.current = nextState;
      return nextState;
    });

    setIsTextSelected(true);
  }, [editor]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = editor?.canvas;
    if (!canvas) {
      return;
    }

    syncFromCanvas();

    canvas.on("selection:created", syncFromCanvas);
    canvas.on("selection:updated", syncFromCanvas);
    canvas.on("selection:cleared", syncFromCanvas);
    canvas.on("object:modified", syncFromCanvas);
    canvas.on("text:changed", syncFromCanvas);

    return () => {
      canvas.off("selection:created", syncFromCanvas);
      canvas.off("selection:updated", syncFromCanvas);
      canvas.off("selection:cleared", syncFromCanvas);
      canvas.off("object:modified", syncFromCanvas);
      canvas.off("text:changed", syncFromCanvas);
    };
  }, [editor, syncFromCanvas]);

  const applyTextUpdates = useCallback(
    (updates: TextEditorState, emitTextChange = false) => {
      if (!isTextSelected) {
        return;
      }

      const nextStrokeWidth = updates.strokeWidth;
      const nextStroke = updates.stroke;
      const nextShadow = new fabric.Shadow({
        color: normalizeColor(updates.shadowColor),
        blur: updates.shadowBlur,
        offsetX: updates.shadowOffsetX,
        offsetY: updates.shadowOffsetY,
      });

      updateTextObject(editor, {
        text: updates.uppercase ? updates.text.toUpperCase() : updates.text,
        fontFamily: updates.fontFamily,
        fontSize: updates.fontSize,
        fontWeight: updates.fontWeight,
        fontStyle: updates.fontStyle,
        textAlign: updates.textAlign,
        lineHeight: updates.lineHeight,
        charSpacing: updates.charSpacing,
        scaleX: updates.scaleX,
        scaleY: updates.scaleY,
        angle: updates.angle,
        fill: updates.fill,
        stroke: nextStrokeWidth > 0 ? nextStroke : undefined,
        strokeWidth: nextStrokeWidth,
        opacity: updates.opacity,
        shadow: nextShadow,
        left: updates.left,
        top: updates.top,
      }, { emitTextChange });
    },
    [editor, isTextSelected]
  );

  const handleStateChange = (updates: Partial<TextEditorState>, emitTextChange = false) => {
    const nextState: TextEditorState = { ...stateRef.current, ...updates };
    stateRef.current = nextState;
    setState(nextState);

    if (!isTextSelected) {
      return;
    }

    isApplyingUiUpdateRef.current = true;
    applyTextUpdates(nextState, emitTextChange);
  };

  const handleAddText = () => {
    const added = addTextObject(editor, {
      text: state.text,
      fill: state.fill,
      fontFamily: state.fontFamily,
      fontSize: state.fontSize,
      fontWeight: state.fontWeight,
      fontStyle: state.fontStyle,
    });
    if (added) {
      setIsTextSelected(true);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      });
    }
  };

  const handleAlignChange = (value: TextEditorState["textAlign"]) => {
    handleStateChange({ textAlign: value });
  };

  const handlePositionChange = (axis: "x" | "y", value: number) => {
    const next = axis === "x" ? { left: value } : { top: value };
    handleStateChange(next);
  };

  const handleShapeChange = (shape: TextShape) => {
    handleStateChange({ shape });
    applyTextShape(editor, shape, state.curvature);
  };

  const handleCurvatureChange = (value: number) => {
    const safe = clamp(value, 0, 100);
    handleStateChange({ curvature: safe });
    applyTextShape(editor, state.shape, safe);
  };

  const colorValue = useMemo(() => normalizeColor(state.fill), [state.fill]);

  return (
    <Card
      className="border-slate-200/70 bg-slate-50/70 shadow-none"
      description=""
      title=""
    >
      <div className="space-y-5">
        <TextPropertiesPanel
          disabled={!isTextSelected}
          fonts={FONT_OPTIONS}
          textActions={
            <>
              <Button className="gap-2" onClick={handleAddText} variant="primary">
                <FiPlus className="text-sm" />
                <span>{isTextSelected ? "Add Another Text" : "Add Text"}</span>
              </Button>
              {isTextSelected && (
                   <Button

                className="gap-2"
                disabled={!isTextSelected}
                onClick={canvasControls.deleteSelected}
                variant="secondary"
              >
                <FiTrash2 className="text-sm" />
                <span>Delete Selected</span>
              </Button>
              )}
           
              {!isTextSelected && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
                  <FiType className="text-sm" />
                  <span>{isTextSelected ? "Editing selected text" : "Select or add text to edit"}</span>
                </div>
              )}
            </>
          }
          textareaRef={textareaRef}
          onAngleChange={(value) => handleStateChange({ angle: clamp(value, -180, 180) })}
          onCenter={(axis) => centerText(editor, axis)}
          onCharSpacingChange={(value) => handleStateChange({ charSpacing: clamp(value, -20, 200) })}
          onCurvatureChange={handleCurvatureChange}
          onFillChange={(value) => handleStateChange({ fill: normalizeColor(value) })}
          onRgbChange={(target, channel, value) => {
            const safeValue = clamp(value, 0, 255);
            const source =
              target === "stroke"
                ? normalizeColor(stateRef.current.stroke)
                : target === "shadow"
                  ? normalizeColor(stateRef.current.shadowColor)
                  : normalizeColor(stateRef.current.fill);
            const normalizedSource = source.replace("#", "");
            const base = normalizedSource.length === 6
              ? {
                  r: parseInt(normalizedSource.slice(0, 2), 16),
                  g: parseInt(normalizedSource.slice(2, 4), 16),
                  b: parseInt(normalizedSource.slice(4, 6), 16),
                }
              : { r: 17, g: 24, b: 39 };
            const next = { ...base, [channel]: safeValue };
            const nextHex = rgbToHex(next.r, next.g, next.b);

            if (target === "stroke") {
              handleStateChange({ stroke: nextHex });
              return;
            }

            if (target === "shadow") {
              handleStateChange({ shadowColor: nextHex });
              return;
            }

            handleStateChange({ fill: nextHex });
          }}
          onFontFamilyChange={(value) => handleStateChange({ fontFamily: value })}
          onFontSizeChange={(value) => handleStateChange({ fontSize: clamp(value, 10, 160) })}
          onFontStyleChange={(value) => handleStateChange({ fontStyle: value })}
          onFontWeightChange={(value) => handleStateChange({ fontWeight: value })}
          onLayerChange={(direction) => reorderTextLayer(editor, direction)}
          onLineHeightChange={(value) => handleStateChange({ lineHeight: clamp(value, 0.8, 2) })}
          onOpacityChange={(value) => handleStateChange({ opacity: clamp(value / 100, 0.1, 1) })}
          onPositionChange={handlePositionChange}
          onScaleXChange={(value) => handleStateChange({ scaleX: clamp(value, 0.5, 2) })}
          onScaleYChange={(value) => handleStateChange({ scaleY: clamp(value, 0.5, 2) })}
          onShadowBlurChange={(value) => handleStateChange({ shadowBlur: clamp(value, 0, 40) })}
          onShadowColorChange={(value) => handleStateChange({ shadowColor: normalizeColor(value) })}
          onShadowOffsetXChange={(value) => handleStateChange({ shadowOffsetX: clamp(value, -40, 40) })}
          onShadowOffsetYChange={(value) => handleStateChange({ shadowOffsetY: clamp(value, -40, 40) })}
          onShapeChange={handleShapeChange}
          onStrokeChange={(value) => handleStateChange({ stroke: normalizeColor(value) })}
          onStrokeWidthChange={(value) => handleStateChange({ strokeWidth: clamp(value, 0, 12) })}
          onTextAlignChange={handleAlignChange}
          onTextChange={(value) => handleStateChange({ text: value }, true)}
          onUppercaseToggle={(value) => handleStateChange({ uppercase: value }, true)}
          swatches={SWATCHES}
          state={{
            ...state,
            fill: colorValue,
            shadowColor: normalizeColor(state.shadowColor),
            stroke: normalizeColor(state.stroke),
          }}
        />
      </div>
    </Card>
  );
};
