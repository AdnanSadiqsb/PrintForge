import { fabric } from "fabric";
import type { FabricJSEditor } from "fabricjs-react";
import { ensureObjectId } from "../../../lib/fabric";

export type TextShape = "straight" | "arc-up" | "arc-down";

export const TEXT_SERIALIZE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "textAlign",
  "lineHeight",
  "charSpacing",
  "scaleX",
  "scaleY",
  "angle",
  "stroke",
  "strokeWidth",
  "shadow",
  "opacity",
  "path",
  "pathSide",
  "pathStartOffset",
  "pathAlign",
  "originX",
  "originY",
];

type TextDefaults = {
  fill: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: fabric.ITextOptions["fontStyle"];
  fontWeight: string | number;
};

const DEFAULTS: TextDefaults = {
  fill: "#111827",
  fontFamily: "Inter",
  fontSize: 36,
  fontStyle: "normal",
  fontWeight: 600,
};

export const getActiveTextObject = (editor?: FabricJSEditor) => {
  const active = editor?.canvas?.getActiveObject();
  if (!active) {
    return undefined;
  }

  if (active.type === "textbox" || active.type === "text" || active.type === "i-text") {
    return active as fabric.IText;
  }

  return undefined;
};

export const addTextObject = (
  editor: FabricJSEditor | undefined,
  payload?: {
    text?: string;
    fill?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontStyle?: fabric.ITextOptions["fontStyle"];
    
  }
) => {
  const canvas = editor?.canvas;
  if (!canvas) {
    return undefined;
  }

  const text = payload?.text?.trim() ? payload.text : "Your text here";
  const textObject = new fabric.IText(text, {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
    fill: payload?.fill ?? DEFAULTS.fill,
    fontFamily: payload?.fontFamily ?? DEFAULTS.fontFamily,
    fontSize: payload?.fontSize ?? DEFAULTS.fontSize,
    fontStyle: payload?.fontStyle ?? DEFAULTS.fontStyle,
    fontWeight: payload?.fontWeight ?? DEFAULTS.fontWeight,
    textAlign: "center",
    lineHeight: 1.2,
  });

  ensureObjectId(textObject, `object-${canvas.getObjects().length + 1}`);
  textObject.set({
    data: {
      ...(textObject.data ?? {}),
      textShape: "straight",
      textCurvature: 0,
    },
  });

  canvas.add(textObject);
  canvas.setActiveObject(textObject);
  textObject.setCoords();
  canvas.requestRenderAll();
  return textObject;
};

export const updateTextObject = (
  editor: FabricJSEditor | undefined,
  updates: Partial<fabric.IText>,
  options?: { emitTextChange?: boolean }
) => {
  const canvas = editor?.canvas;
  const active = getActiveTextObject(editor);

  if (!canvas || !active) {
    return;
  }

  const shouldEmitText = options?.emitTextChange ?? false;
  active.set({
    ...updates,
  });
  active.setCoords();
  canvas.requestRenderAll();

  canvas.fire("object:modified", { target: active });
  if (shouldEmitText) {
    canvas.fire("text:changed", { target: active });
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createArcPath = (width: number, curvature: number, direction: "up" | "down") => {
  const safeWidth = Math.max(width, 220);
  const normalized = clamp(curvature, 0, 100);
  const radius = Math.max(140, 520 - normalized * 3.2);
  const sweepFlag = direction === "up" ? 0 : 1;
  return new fabric.Path(`M 0 0 A ${radius} ${radius} 0 0 ${sweepFlag} ${safeWidth} 0`, {
    fill: "",
    selectable: false,
    evented: false,
  });
};

export const applyTextShape = (editor: FabricJSEditor | undefined, shape: TextShape, curvature: number) => {
  const canvas = editor?.canvas;
  const active = getActiveTextObject(editor);

  if (!canvas || !active) {
    return;
  }

  const textWithPath = active as fabric.IText & {
    path?: fabric.Path;
    setPathInfo?: () => void;
    initDimensions?: () => void;
  };

  if (shape === "straight") {
    (textWithPath as unknown as { path?: fabric.Path }).path = undefined;
  } else {
    const path = createArcPath(active.width ?? 240, curvature, shape === "arc-up" ? "up" : "down");
    (textWithPath as unknown as { path?: fabric.Path }).path = path;
    textWithPath.setPathInfo?.();
  }

  active.set({
    data: {
      ...(active.data ?? {}),
      textShape: shape,
      textCurvature: curvature,
    },
  });

  textWithPath.initDimensions?.();
  active.setCoords();
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: active });
};

export const centerText = (editor: FabricJSEditor | undefined, axis: "x" | "y" | "both") => {
  const canvas = editor?.canvas;
  const active = getActiveTextObject(editor);

  if (!canvas || !active) {
    return;
  }

  const centerX = canvas.getWidth() / 2;
  const centerY = canvas.getHeight() / 2;
  const nextLeft = axis === "y" ? active.left ?? centerX : centerX;
  const nextTop = axis === "x" ? active.top ?? centerY : centerY;

  active.set({
    left: nextLeft,
    top: nextTop,
    originX: "center",
    originY: "center",
  });
  active.setCoords();
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: active });
};

export const reorderTextLayer = (
  editor: FabricJSEditor | undefined,
  action: "forward" | "backward" | "front" | "back"
) => {
  const canvas = editor?.canvas;
  const active = getActiveTextObject(editor);

  if (!canvas || !active) {
    return;
  }

  if (action === "forward") {
    canvas.bringForward(active);
  } else if (action === "backward") {
    canvas.sendBackwards(active);
  } else if (action === "front") {
    canvas.bringToFront(active);
  } else {
    canvas.sendToBack(active);
  }

  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: active });
};
