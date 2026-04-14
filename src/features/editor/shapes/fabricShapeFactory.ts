import { fabric } from "fabric";
import { ensureObjectId } from "../../../lib/fabric";
import type { EditorShapeType, ShapeDashStyle, ShapeObjectData } from "./shape.types";

type ShapeFactoryOptions = {
  angle?: number;
  dashStyle?: ShapeDashStyle;
  fill?: string;
  flipX?: boolean;
  flipY?: boolean;
  height?: number;
  id?: string;
  innerRadius?: number;
  left?: number;
  objectLabel?: string;
  opacity?: number;
  outerRadius?: number;
  pathData?: string;
  points?: number;
  radius?: number;
  rx?: number;
  ry?: number;
  shapeType: EditorShapeType;
  starPoints?: number;
  stroke?: string;
  strokeWidth?: number;
  top?: number;
  width?: number;
};

export type ShapeFabricObject = fabric.Object & {
  data?: ShapeObjectData & Record<string, unknown>;
};

const DEFAULT_FILL = "#38bdf8";
const DEFAULT_STROKE = "#0f172a";

const getStrokeDashArray = (dashStyle: ShapeDashStyle, strokeWidth: number) =>
  dashStyle === "dashed" ? [Math.max(strokeWidth * 2, 8), Math.max(strokeWidth, 4)] : undefined;

const createStarPoints = (pointsCount: number, outerRadius: number, innerRadius: number) => {
  const points: Array<{ x: number; y: number }> = [];
  const safePoints = Math.max(4, Math.round(pointsCount));
  const step = Math.PI / safePoints;

  for (let index = 0; index < safePoints * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = index * step - Math.PI / 2;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  return points;
};

const createPolygonPoints = (pointsCount: number, radius: number) => {
  const points: Array<{ x: number; y: number }> = [];
  const safePoints = Math.max(3, Math.round(pointsCount));
  for (let index = 0; index < safePoints; index += 1) {
    const angle = (index * Math.PI * 2) / safePoints - Math.PI / 2;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return points;
};

const applySharedOptions = (object: ShapeFabricObject, options: ShapeFactoryOptions) => {
  const strokeWidth = options.strokeWidth ?? (options.shapeType === "line" ? 6 : 2);
  const dashStyle = options.dashStyle ?? "solid";

  object.set({
    angle: options.angle ?? 0,
    borderColor: "#38bdf8",
    cornerColor: "#0ea5e9",
    cornerStrokeColor: "#ffffff",
    cornerStyle: "circle",
    fill: options.shapeType === "line" ? undefined : options.fill ?? DEFAULT_FILL,
    flipX: options.flipX ?? false,
    flipY: options.flipY ?? false,
    left: options.left ?? 150,
    lockUniScaling: options.shapeType === "circle",
    opacity: options.opacity ?? 1,
    originX: "center",
    originY: "center",
    stroke: options.stroke ?? (options.shapeType === "line" ? DEFAULT_STROKE : "#ffffff"),
    strokeDashArray: getStrokeDashArray(dashStyle, strokeWidth),
    strokeLineCap: "round",
    strokeLineJoin: "round",
    strokeUniform: true,
    strokeWidth,
    top: options.top ?? 185,
    transparentCorners: false,
  });

  object.data = {
    ...(object.data ?? {}),
    aspectRatioLocked: options.shapeType !== "line",
    dashStyle,
    innerRadius: options.innerRadius,
    objectLabel: options.objectLabel,
    outerRadius: options.outerRadius,
    pathData: options.pathData,
    pointsCount: options.points,
    shapeType: options.shapeType,
    starPoints: options.starPoints,
  };
  ensureObjectId(object, options.id ?? `shape-${Date.now()}`);
  object.setCoords();
  return object;
};

export const createFabricShapeObject = (options: ShapeFactoryOptions) => {
  const width = options.width ?? 130;
  const height = options.height ?? 90;
  const radius = options.radius ?? Math.min(width, height) / 2;
  let object: ShapeFabricObject;

  if (options.shapeType === "circle") {
    object = new fabric.Circle({
      radius,
    }) as ShapeFabricObject;
  } else if (options.shapeType === "ellipse") {
    object = new fabric.Ellipse({
      rx: width / 2,
      ry: height / 2,
    }) as ShapeFabricObject;
  } else if (options.shapeType === "triangle") {
    object = new fabric.Triangle({
      width,
      height,
    }) as ShapeFabricObject;
  } else if (options.shapeType === "line") {
    object = new fabric.Line([-width / 2, 0, width / 2, 0], {}) as ShapeFabricObject;
  } else if (options.shapeType === "polygon") {
    object = new fabric.Polygon(createPolygonPoints(options.points ?? 6, Math.max(width, height) / 2), {
      objectCaching: false,
    }) as ShapeFabricObject;
  } else if (options.shapeType === "star") {
    const outerRadius = options.outerRadius ?? Math.max(width, height) / 2;
    const innerRadius = options.innerRadius ?? outerRadius * 0.48;
    object = new fabric.Polygon(createStarPoints(options.starPoints ?? 5, outerRadius, innerRadius), {
      objectCaching: false,
    }) as ShapeFabricObject;
  } else if (options.shapeType === "path") {
    object = new fabric.Path(
      options.pathData ??
        `M ${-width / 2} ${height / 2} Q 0 ${-height / 2} ${width / 2} ${height / 2} Z`,
      {
        objectCaching: false,
      }
    ) as ShapeFabricObject;
  } else {
    object = new fabric.Rect({
      height,
      rx: options.shapeType === "rounded-rect" ? options.rx ?? 18 : options.rx ?? 0,
      ry: options.shapeType === "rounded-rect" ? options.ry ?? 18 : options.ry ?? 0,
      width,
    }) as ShapeFabricObject;
  }

  return applySharedOptions(object, options);
};
