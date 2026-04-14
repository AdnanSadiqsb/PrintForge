import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiAperture, FiMinus, FiPlus, FiSquare, FiTriangle } from "react-icons/fi";
import { Card } from "../../../components/ui";
import { useEditorStore } from "../../../hooks";
import { ShapePropertiesPanel } from "./ShapePropertiesPanel";
import {
  addShapeObject,
  centerShape,
  getActiveShapeObject,
  getShapeEditorState,
  reorderShapeLayer,
  resetShapeTransform,
  updateShapeObject,
} from "./shapeService";
import type { EditorShapeType, ShapeEditorState, ShapeInsertOption } from "./shape.types";

const DEFAULT_STATE: ShapeEditorState = {
  dashStyle: "solid",
  displayedHeight: 0,
  displayedWidth: 0,
  fill: "#38bdf8",
  flipX: false,
  flipY: false,
  hasShape: false,
  isAspectLocked: true,
  left: 0,
  opacity: 1,
  radius: 0,
  rotation: 0,
  rx: 0,
  ry: 0,
  shapeType: "rect",
  starPoints: 5,
  stroke: "#0f172a",
  strokeWidth: 2,
  top: 0,
};

const SHAPE_OPTIONS: ShapeInsertOption[] = [
  { description: "Sharp-edged block", label: "Rectangle", shapeType: "rect" },
  { description: "Soft rounded card", label: "Rounded Rect", shapeType: "rounded-rect" },
  { description: "Classic circle badge", label: "Circle", shapeType: "circle" },
  { description: "Wide oval accent", label: "Ellipse", shapeType: "ellipse" },
  { description: "Directional triangle", label: "Triangle", shapeType: "triangle" },
  { description: "Accent divider", label: "Line", shapeType: "line" },
  { description: "Badge star", label: "Star", shapeType: "star" },
];

const SHAPE_ICON: Record<EditorShapeType, JSX.Element> = {
  circle: <FiAperture className="text-lg" />,
  ellipse: <FiAperture className="text-lg" />,
  line: <FiMinus className="text-lg" />,
  path: <FiTriangle className="text-lg" />,
  polygon: <FiAperture className="text-lg" />,
  rect: <FiSquare className="text-lg" />,
  "rounded-rect": <FiSquare className="text-lg" />,
  star: <FiPlus className="text-lg" />,
  triangle: <FiTriangle className="text-lg" />,
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

export const ShapeTool = () => {
  const { editor, canvasControls } = useEditorStore();
  const [state, setState] = useState<ShapeEditorState>(DEFAULT_STATE);
  const stateRef = useRef<ShapeEditorState>(DEFAULT_STATE);
  const isApplyingUiUpdateRef = useRef(false);

  const syncFromCanvas = useCallback(() => {
    if (isApplyingUiUpdateRef.current) {
      isApplyingUiUpdateRef.current = false;
      return;
    }

    const active = getActiveShapeObject(editor);
    const nextState = getShapeEditorState(active);
    stateRef.current = nextState;
    setState(nextState);
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
    canvas.on("object:added", syncFromCanvas);

    return () => {
      canvas.off("selection:created", syncFromCanvas);
      canvas.off("selection:updated", syncFromCanvas);
      canvas.off("selection:cleared", syncFromCanvas);
      canvas.off("object:modified", syncFromCanvas);
      canvas.off("object:added", syncFromCanvas);
    };
  }, [editor, syncFromCanvas]);

  const handleStateChange = useCallback(
    (updates: Partial<ShapeEditorState>) => {
      const nextState = { ...stateRef.current, ...updates };
      stateRef.current = nextState;
      setState(nextState);

      if (!nextState.hasShape) {
        return;
      }

      isApplyingUiUpdateRef.current = true;
      updateShapeObject(editor, {
        angle: nextState.rotation,
        dashStyle: nextState.dashStyle,
        displayedHeight: nextState.displayedHeight,
        displayedWidth: nextState.displayedWidth,
        fill: nextState.shapeType === "line" ? undefined : normalizeColor(nextState.fill),
        flipX: nextState.flipX,
        flipY: nextState.flipY,
        left: nextState.left,
        opacity: nextState.opacity,
        rx: nextState.rx,
        ry: nextState.ry,
        starPoints: nextState.starPoints,
        stroke: normalizeColor(nextState.stroke),
        strokeWidth: nextState.strokeWidth,
        top: nextState.top,
      });
    },
    [editor]
  );

  const handleAddShape = useCallback((shapeType: EditorShapeType) => {
    const added = addShapeObject(editor, shapeType);
    if (added) {
      syncFromCanvas();
    }
  }, [editor, syncFromCanvas]);

  const quickActions = useMemo(
    () =>
      SHAPE_OPTIONS.map((option) => (
        <button
          key={option.shapeType}
          className="group rounded-[20px] border border-slate-200/80 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
          onClick={() => handleAddShape(option.shapeType)}
          type="button"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition group-hover:bg-sky-50 group-hover:text-sky-600">
            {SHAPE_ICON[option.shapeType]}
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900">{option.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{option.description}</p>
        </button>
      )),
    [handleAddShape]
  );

  return (
    <Card className="border-slate-200/70 bg-slate-50/70 shadow-none" description="" title="">
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Quick Insert</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {quickActions}
          </div>
        </div>

        <ShapePropertiesPanel
          disabled={!state.hasShape}
          onCenter={(axis) => centerShape(editor, axis)}
          onDashStyleChange={(value) => handleStateChange({ dashStyle: value })}
          onDeleteSelected={canvasControls.deleteSelected}
          onFillChange={(value) => handleStateChange({ fill: normalizeColor(value) })}
          onFlipX={() => handleStateChange({ flipX: !stateRef.current.flipX })}
          onFlipY={() => handleStateChange({ flipY: !stateRef.current.flipY })}
          onLayerChange={(direction) => reorderShapeLayer(editor, direction)}
          onLockAspectToggle={() => {
            const active = getActiveShapeObject(editor);
            if (!active) {
              return;
            }
            active.data = {
              ...(active.data ?? {}),
              aspectRatioLocked: active.data?.aspectRatioLocked === false,
            };
            const nextState = {
              ...stateRef.current,
              isAspectLocked: active.data?.aspectRatioLocked !== false,
            };
            stateRef.current = nextState;
            setState(nextState);
            editor?.canvas?.fire("object:modified", { target: active });
          }}
          onOpacityChange={(value) => handleStateChange({ opacity: clamp(value / 100, 0.05, 1) })}
          onPositionChange={(axis, value) => handleStateChange(axis === "x" ? { left: value } : { top: value })}
          onRadiusChange={(value) =>
            handleStateChange({
              displayedHeight: Math.max(10, value * 2),
              displayedWidth: Math.max(10, value * 2),
              radius: Math.max(5, value),
            })
          }
          onResetTransform={() => resetShapeTransform(editor)}
          onRotationChange={(value) => handleStateChange({ rotation: clamp(value, -180, 180) })}
          onRxChange={(value) => handleStateChange({ rx: clamp(value, 0, 200) })}
          onRyChange={(value) => handleStateChange({ ry: clamp(value, 0, 200) })}
          onSizeChange={(axis, value) => {
            const safeValue = Math.max(10, value);
            const current = stateRef.current;
            const ratio = current.displayedHeight > 0 ? current.displayedWidth / current.displayedHeight : 1;

            if (current.isAspectLocked && current.shapeType !== "line") {
              if (axis === "width") {
                handleStateChange({ displayedHeight: Math.max(10, safeValue / ratio), displayedWidth: safeValue });
              } else {
                handleStateChange({ displayedHeight: safeValue, displayedWidth: Math.max(10, safeValue * ratio) });
              }
              return;
            }

            handleStateChange(axis === "width" ? { displayedWidth: safeValue } : { displayedHeight: safeValue });
          }}
          onStarPointsChange={(value) => handleStateChange({ starPoints: clamp(Math.round(value), 4, 12) })}
          onStrokeChange={(value) => handleStateChange({ stroke: normalizeColor(value) })}
          onStrokeWidthChange={(value) => handleStateChange({ strokeWidth: clamp(value, 0, 24) })}
          state={state}
        />
      </div>
    </Card>
  );
};
