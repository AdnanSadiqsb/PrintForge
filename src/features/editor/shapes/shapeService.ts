import { fabric } from "fabric";
import type { FabricJSEditor } from "fabricjs-react";
import { createFabricShapeObject, type ShapeFabricObject } from "./fabricShapeFactory";
import type { EditorShapeType, ShapeDashStyle, ShapeEditorState } from "./shape.types";

export const SHAPE_SERIALIZE_PROPS = [
  "rx",
  "ry",
  "radius",
  "strokeDashArray",
  "strokeLineCap",
  "strokeLineJoin",
  "strokeUniform",
  "flipX",
  "flipY",
  "opacity",
  "angle",
  "scaleX",
  "scaleY",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
  "data",
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getObjectKind = (object?: fabric.Object | null) => {
  if (!object) {
    return "unknown";
  }

  if (
    object.type === "rect" ||
    object.type === "circle" ||
    object.type === "ellipse" ||
    object.type === "triangle" ||
    object.type === "line" ||
    object.type === "polygon" ||
    object.type === "path"
  ) {
    return "shape";
  }

  return "unknown";
};

const getObjectBounds = (object: fabric.Object) => object.getBoundingRect(true, true);

const clampShapeInsideCanvas = (object: fabric.Object, canvas: fabric.Canvas) => {
  const bounds = getObjectBounds(object);
  let nextLeft = object.left ?? 0;
  let nextTop = object.top ?? 0;

  if (bounds.left < 0) {
    nextLeft += Math.abs(bounds.left);
  }

  if (bounds.top < 0) {
    nextTop += Math.abs(bounds.top);
  }

  const overflowRight = bounds.left + bounds.width - canvas.getWidth();
  if (overflowRight > 0) {
    nextLeft -= overflowRight;
  }

  const overflowBottom = bounds.top + bounds.height - canvas.getHeight();
  if (overflowBottom > 0) {
    nextTop -= overflowBottom;
  }

  object.set({ left: nextLeft, top: nextTop });
  object.setCoords();
};

export const getActiveShapeObject = (editor?: FabricJSEditor) => {
  const active = editor?.canvas?.getActiveObject();

  if (!active || getObjectKind(active) !== "shape") {
    return undefined;
  }

  return active as ShapeFabricObject;
};

export const addShapeObject = (editor: FabricJSEditor | undefined, shapeType: EditorShapeType) => {
  const canvas = editor?.canvas;

  if (!canvas) {
    return undefined;
  }

  const object = createFabricShapeObject({
    dashStyle: "solid",
    fill: shapeType === "line" ? undefined : "#38bdf8",
    left: canvas.getWidth() / 2,
    objectLabel:
      shapeType === "rounded-rect"
        ? "Rounded Rectangle"
        : shapeType === "rect"
          ? "Rectangle"
          : shapeType === "line"
            ? "Line"
            : shapeType === "star"
              ? "Star"
              : shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
    shapeType,
    stroke: shapeType === "line" ? "#0f172a" : "#ffffff",
    strokeWidth: shapeType === "line" ? 8 : 2,
    top: canvas.getHeight() / 2,
  });

  canvas.add(object);
  canvas.setActiveObject(object);
  clampShapeInsideCanvas(object, canvas);
  canvas.requestRenderAll();
  return object;
};

const updateLineGeometry = (line: fabric.Line, width: number) => {
  line.set({
    x1: -width / 2,
    x2: width / 2,
    y1: 0,
    y2: 0,
  });
};

const updateShapeGeometry = (
  shape: ShapeFabricObject,
  updates: { displayedHeight?: number; displayedWidth?: number; rx?: number; ry?: number; starPoints?: number }
) => {
  const data = shape.data ?? {};
  const shapeType = (data.shapeType ?? shape.type) as EditorShapeType;
  const safeWidth = Math.max(10, updates.displayedWidth ?? getObjectBounds(shape).width);
  const safeHeight = Math.max(10, updates.displayedHeight ?? getObjectBounds(shape).height);

  if (shapeType === "circle" && shape.type === "circle") {
    (shape as fabric.Circle).set({ radius: Math.max(5, safeWidth / 2), scaleX: 1, scaleY: 1 });
  } else if (shapeType === "ellipse" && shape.type === "ellipse") {
    (shape as fabric.Ellipse).set({ rx: Math.max(5, safeWidth / 2), ry: Math.max(5, safeHeight / 2), scaleX: 1, scaleY: 1 });
  } else if ((shapeType === "rect" || shapeType === "rounded-rect") && shape.type === "rect") {
    (shape as fabric.Rect).set({
      height: safeHeight,
      rx: clamp(updates.rx ?? ((shape as fabric.Rect).rx ?? 0), 0, safeWidth / 2),
      ry: clamp(updates.ry ?? ((shape as fabric.Rect).ry ?? 0), 0, safeHeight / 2),
      scaleX: 1,
      scaleY: 1,
      width: safeWidth,
    });
  } else if (shapeType === "triangle" && shape.type === "triangle") {
    (shape as fabric.Triangle).set({ height: safeHeight, scaleX: 1, scaleY: 1, width: safeWidth });
  } else if (shapeType === "line" && shape.type === "line") {
    updateLineGeometry(shape as fabric.Line, safeWidth);
    shape.set({ scaleX: 1, scaleY: 1, strokeWidth: Math.max(1, safeHeight) });
  } else if (shapeType === "star" && shape.type === "polygon") {
    const outerRadius = Math.max(safeWidth, safeHeight) / 2;
    const nextPoints = Math.max(4, Math.round(updates.starPoints ?? (typeof data.starPoints === "number" ? data.starPoints : 5)));
    const innerRadius = outerRadius * 0.48;
    (shape as fabric.Polygon).set({
      points: Array.from({ length: nextPoints * 2 }, (_, index) => {
        const radius = index % 2 === 0 ? outerRadius : innerRadius;
        const angle = (index * Math.PI) / nextPoints - Math.PI / 2;
        return new fabric.Point(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }),
      scaleX: 1,
      scaleY: 1,
    });
    shape.data = {
      ...data,
      innerRadius,
      outerRadius,
      starPoints: nextPoints,
    };
  }

  shape.setCoords();
};

export const updateShapeObject = (
  editor: FabricJSEditor | undefined,
  updates: Partial<fabric.Object> & {
    dashStyle?: ShapeDashStyle;
    displayedHeight?: number;
    displayedWidth?: number;
    rx?: number;
    ry?: number;
    starPoints?: number;
  }
) => {
  const shape = getActiveShapeObject(editor);
  const canvas = editor?.canvas;

  if (!shape || !canvas) {
    return;
  }

  shape.set({
    ...updates,
    strokeDashArray:
      updates.dashStyle !== undefined
        ? updates.dashStyle === "dashed"
          ? [Math.max((shape.strokeWidth ?? 1) * 2, 8), Math.max(shape.strokeWidth ?? 1, 4)]
          : undefined
        : updates.strokeDashArray,
  });

  if (
    updates.displayedWidth !== undefined ||
    updates.displayedHeight !== undefined ||
    updates.rx !== undefined ||
    updates.ry !== undefined ||
    updates.starPoints !== undefined
  ) {
    updateShapeGeometry(shape, updates);
  }

  if (updates.dashStyle !== undefined) {
    shape.data = {
      ...(shape.data ?? {}),
      dashStyle: updates.dashStyle,
    };
  }

  if (updates.starPoints !== undefined) {
    shape.data = {
      ...(shape.data ?? {}),
      starPoints: updates.starPoints,
    };
  }

  shape.setCoords();
  clampShapeInsideCanvas(shape, canvas);
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: shape });
};

export const centerShape = (editor: FabricJSEditor | undefined, axis: "x" | "y" | "both") => {
  const shape = getActiveShapeObject(editor);
  const canvas = editor?.canvas;

  if (!shape || !canvas) {
    return;
  }

  shape.set({
    left: axis === "y" ? shape.left : canvas.getWidth() / 2,
    originX: "center",
    originY: "center",
    top: axis === "x" ? shape.top : canvas.getHeight() / 2,
  });
  shape.setCoords();
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: shape });
};

export const reorderShapeLayer = (
  editor: FabricJSEditor | undefined,
  action: "forward" | "backward" | "front" | "back"
) => {
  const shape = getActiveShapeObject(editor);
  const canvas = editor?.canvas;

  if (!shape || !canvas) {
    return;
  }

  if (action === "forward") {
    canvas.bringForward(shape);
  } else if (action === "backward") {
    canvas.sendBackwards(shape);
  } else if (action === "front") {
    canvas.bringToFront(shape);
  } else {
    canvas.sendToBack(shape);
  }

  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: shape });
};

export const resetShapeTransform = (editor: FabricJSEditor | undefined) => {
  const shape = getActiveShapeObject(editor);
  const canvas = editor?.canvas;

  if (!shape || !canvas) {
    return;
  }

  shape.set({
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
  });
  clampShapeInsideCanvas(shape, canvas);
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: shape });
};

export const getShapeEditorState = (shape?: ShapeFabricObject): ShapeEditorState => {
  const data = shape?.data ?? {};
  const bounds = shape ? getObjectBounds(shape) : { width: 0, height: 0 };
  const dashStyle =
    typeof data.dashStyle === "string"
      ? data.dashStyle
      : Array.isArray(shape?.strokeDashArray) && shape?.strokeDashArray.length
        ? "dashed"
        : "solid";

  return {
    dashStyle,
    displayedHeight: Math.round(bounds.height),
    displayedWidth: Math.round(bounds.width),
    fill: typeof shape?.fill === "string" ? shape.fill : "#38bdf8",
    flipX: Boolean(shape?.flipX),
    flipY: Boolean(shape?.flipY),
    hasShape: Boolean(shape),
    isAspectLocked: data.aspectRatioLocked !== false,
    left: Math.round(shape?.left ?? 0),
    opacity: shape?.opacity ?? 1,
    radius:
      shape?.type === "circle"
        ? Math.round((shape as fabric.Circle).radius ?? 0)
        : shape?.type === "ellipse"
          ? Math.round((shape as fabric.Ellipse).rx ?? 0)
          : 0,
    rotation: Math.round(shape?.angle ?? 0),
    rx: Math.round(shape?.type === "rect" ? (shape as fabric.Rect).rx ?? 0 : 0),
    ry: Math.round(shape?.type === "rect" ? (shape as fabric.Rect).ry ?? 0 : 0),
    shapeType: (data.shapeType as EditorShapeType) ?? "rect",
    starPoints: typeof data.starPoints === "number" ? data.starPoints : 5,
    stroke: typeof shape?.stroke === "string" ? shape.stroke : "#0f172a",
    strokeWidth: Math.round(shape?.strokeWidth ?? 0),
    top: Math.round(shape?.top ?? 0),
  };
};
