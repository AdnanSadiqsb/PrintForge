import { fabric } from "fabric";
import type { FabricJSEditor } from "fabricjs-react";
import { ensureObjectId } from "../../../lib/fabric";
import { createFabricShapeObject } from "../../editor/shapes/fabricShapeFactory";
import type {
  EditorLayer,
  ImageLayer,
  NormalizedTemplateDefinition,
  ShapeLayer,
  TemplateApplyMode,
  TemplateDefinition,
  TemplateObjectData,
  TextLayer,
  VectorLayer,
} from "../types/template.types";
import { getTemplateLayers } from "./templatePreview";
import { normalizeTemplate } from "./templateSchema";
import { applyFabricStroke, buildImageFilters, toFabricFill, toFabricShadow } from "./templateRenderUtils";

type TemplateFabricObject = fabric.Object & {
  data?: Record<string, unknown>;
  initDimensions?: () => void;
  path?: fabric.Path;
  setPathInfo?: () => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createArcPath = (width: number, curvature: number, direction: "up" | "down") => {
  const safeWidth = Math.max(width, 220);
  const normalized = clamp(curvature, 0, 100);
  const radius = Math.max(140, 520 - normalized * 3.2);
  const sweepFlag = direction === "up" ? 0 : 1;

  return new fabric.Path(`M 0 0 A ${radius} ${radius} 0 0 ${sweepFlag} ${safeWidth} 0`, {
    evented: false,
    fill: "",
    selectable: false,
  });
};

const attachTemplateMetadata = (
  object: TemplateFabricObject,
  template: NormalizedTemplateDefinition,
  templateObject: EditorLayer,
  artboardId: string,
  quickEditKey?: string
) => {
  const templateData: TemplateObjectData = {
    artboardId,
    groupId: templateObject.groupId,
    isTemplateObject: true,
    placeholderKey: templateObject.placeholderKey,
    quickEditKey,
    templateId: template.id,
    templateName: template.name,
    templateObjectId: templateObject.id,
    templateSide: template.primaryArtboard.name,
  };

  object.data = {
    ...(object.data ?? {}),
    ...templateObject.metadata,
    ...templateData,
    editable: templateObject.editable,
    isLocked: templateObject.locked ?? false,
    isVisible: templateObject.visible ?? true,
    objectLabel: templateObject.name ?? templateObject.placeholderKey ?? templateObject.id,
  };
};

const getEditableFlags = (editable: EditorLayer["editable"]) => {
  if (typeof editable === "boolean") {
    return {
      allowMove: editable,
      allowResize: editable,
      allowRotate: editable,
      allowTextEdit: editable,
    };
  }

  return editable ?? {};
};

const applySharedOptions = (
  object: TemplateFabricObject,
  canvas: fabric.Canvas,
  template: NormalizedTemplateDefinition,
  templateObject: EditorLayer
) => {
  const artboard = template.primaryArtboard;
  const scaleX = canvas.getWidth() / artboard.width;
  const scaleY = canvas.getHeight() / artboard.height;
  const editable = getEditableFlags(templateObject.editable);

  object.set({
    angle: templateObject.rotation ?? templateObject.angle ?? 0,
    borderColor: "#38bdf8",
    cornerColor: "#0ea5e9",
    cornerStrokeColor: "#ffffff",
    cornerStyle: "circle",
    evented: templateObject.selectable !== false && templateObject.visible !== false,
    flipX: templateObject.flipX ?? false,
    flipY: templateObject.flipY ?? false,
    globalCompositeOperation: templateObject.blendMode as GlobalCompositeOperation | undefined,
    hasControls: editable.allowResize !== false && templateObject.locked !== true,
    left: templateObject.left * scaleX,
    lockMovementX: editable.allowMove === false || templateObject.locked === true,
    lockMovementY: editable.allowMove === false || templateObject.locked === true,
    lockRotation: editable.allowRotate === false || templateObject.locked === true,
    lockScalingX: editable.allowResize === false || templateObject.locked === true,
    lockScalingY: editable.allowResize === false || templateObject.locked === true,
    opacity: templateObject.opacity ?? 1,
    originX: templateObject.originX ?? "center",
    originY: templateObject.originY ?? "center",
    selectable: templateObject.selectable !== false && templateObject.visible !== false,
    shadow: toFabricShadow(templateObject.shadow),
    top: templateObject.top * scaleY,
    transparentCorners: false,
    visible: templateObject.visible ?? true,
  });

  applyFabricStroke(object, templateObject.strokeStyle, scaleX, scaleY);
  object.setCoords();
};

const createTextObject = (
  canvas: fabric.Canvas,
  template: NormalizedTemplateDefinition,
  item: TextLayer,
  quickEditKey?: string
) => {
  const artboard = template.primaryArtboard;
  const scale = canvas.getWidth() / artboard.width;
  const object = new fabric.IText(item.text, {
    charSpacing: item.charSpacing ?? 0,
    fill: toFabricFill(item.fill, item.width * scale, item.height * scale) ?? "#111827",
    fontFamily: item.fontFamily,
    fontSize: item.fontSize * scale,
    fontStyle: item.fontStyle ?? "normal",
    fontWeight: item.fontWeight ?? 600,
    lineHeight: item.lineHeight ?? 1.1,
    textAlign: item.textAlign ?? "center",
    underline: item.underline ?? false,
  }) as TemplateFabricObject;

  const shape = item.textShape === "arc-down" ? "down" : "up";
  const curvature = item.warp?.type === "arc" ? item.warp.amount : item.curvature ?? 0;
  if (item.textShape && item.textShape !== "straight") {
    object.path = createArcPath(item.width * scale, curvature, shape);
    object.setPathInfo?.();
  }

  object.set({
    data: {
      ...(object.data ?? {}),
      horizontalScale: item.horizontalScale ?? 1,
      innerStroke: item.innerStroke ?? null,
      textCurvature: curvature,
      textShape: item.textShape ?? "straight",
      unsupportedWarpType:
        item.warp && item.warp.type !== "none" && item.warp.type !== "arc" ? item.warp.type : undefined,
      warp: item.warp,
    },
    scaleX: item.horizontalScale ?? 1,
    stroke: item.stroke?.color,
    strokeWidth: item.stroke?.width ? item.stroke.width * scale : 0,
  });

  if (item.outlineOnly) {
    object.set({
      fill: "transparent",
    });
  }

  applySharedOptions(object, canvas, template, item);
  attachTemplateMetadata(object, template, item, artboard.id, quickEditKey);
  ensureObjectId(object, `${template.id}-${item.id}`);
  object.initDimensions?.();
  object.setCoords();
  return object;
};

const createShapeObject = (
  canvas: fabric.Canvas,
  template: NormalizedTemplateDefinition,
  item: ShapeLayer,
  quickEditKey?: string
) => {
  const artboard = template.primaryArtboard;
  const scaleX = canvas.getWidth() / artboard.width;
  const scaleY = canvas.getHeight() / artboard.height;
  const shapeType = item.shapeType === "polygon" ? "star" : item.shapeType === "path" ? "rect" : item.shapeType;

  const object = createFabricShapeObject({
    angle: item.rotation ?? item.angle,
    dashStyle: item.stroke?.dashArray?.length ? "dashed" : "solid",
    fill: typeof item.fill === "string" ? item.fill : undefined,
    flipX: item.flipX,
    flipY: item.flipY,
    height: item.height * scaleY,
    innerRadius: item.innerRadius ? item.innerRadius * Math.min(scaleX, scaleY) : undefined,
    left: item.left * scaleX,
    objectLabel: item.name ?? item.placeholderKey ?? item.id,
    opacity: item.opacity,
    outerRadius: item.radius ? item.radius * Math.min(scaleX, scaleY) : undefined,
    pathData: item.pathData,
    points: item.points,
    radius: item.radius ? item.radius * Math.min(scaleX, scaleY) : undefined,
    rx: item.rx ? item.rx * scaleX : undefined,
    ry: item.ry ? item.ry * scaleY : undefined,
    shapeType,
    stroke: item.stroke?.color,
    strokeWidth: item.stroke?.width ? item.stroke.width * Math.min(scaleX, scaleY) : undefined,
    top: item.top * scaleY,
    width: item.width * scaleX,
  });

  object.set({
    fill: toFabricFill(item.fill, item.width * scaleX, item.height * scaleY) ?? object.fill,
  });

  applySharedOptions(object as TemplateFabricObject, canvas, template, item);
  applyFabricStroke(object, item.stroke, scaleX, scaleY);
  attachTemplateMetadata(object as TemplateFabricObject, template, item, artboard.id, quickEditKey);
  ensureObjectId(object, `${template.id}-${item.id}`);
  return object as TemplateFabricObject;
};

const loadFabricImage = (src: string) =>
  new Promise<fabric.Image | undefined>((resolve) => {
    fabric.Image.fromURL(src, (image) => resolve(image ?? undefined), { crossOrigin: "anonymous" });
  });

const loadFabricVector = (src: string) =>
  new Promise<fabric.Object | undefined>((resolve) => {
    fabric.loadSVGFromURL(src, (objects, options) => {
      if (!objects || objects.length === 0) {
        resolve(undefined);
        return;
      }
      resolve(fabric.util.groupSVGElements(objects, options));
    });
  });

const applyImageGeometry = (
  image: fabric.Image | fabric.Object,
  item: ImageLayer | VectorLayer,
  canvas: fabric.Canvas,
  template: NormalizedTemplateDefinition
) => {
  const artboard = template.primaryArtboard;
  const scaleX = canvas.getWidth() / artboard.width;
  const scaleY = canvas.getHeight() / artboard.height;
  const sourceWidth = image.width ?? 1;
  const sourceHeight = image.height ?? 1;
  const targetWidth = item.width * scaleX;
  const targetHeight = item.height * scaleY;

  let nextScaleX = targetWidth / sourceWidth;
  let nextScaleY = targetHeight / sourceHeight;

  if ("fit" in item && item.fit === "contain") {
    const ratio = Math.min(nextScaleX, nextScaleY);
    nextScaleX = ratio;
    nextScaleY = ratio;
  } else if ("fit" in item && item.fit === "cover") {
    const ratio = Math.max(nextScaleX, nextScaleY);
    nextScaleX = ratio;
    nextScaleY = ratio;
  }

  image.set({
    left: item.left * scaleX,
    originX: item.originX ?? "center",
    originY: item.originY ?? "center",
    scaleX: nextScaleX * ("crop" in item && item.crop ? item.crop.scale : 1),
    scaleY: nextScaleY * ("crop" in item && item.crop ? item.crop.scale : 1),
    top: item.top * scaleY,
  });

  if ("crop" in item && item.crop && image instanceof fabric.Image) {
    image.set({
      cropX: item.crop.x,
      cropY: item.crop.y,
    });
  }
};

const createImageObject = async (
  canvas: fabric.Canvas,
  template: NormalizedTemplateDefinition,
  item: ImageLayer,
  quickEditKey?: string
) => {
  const image = await loadFabricImage(item.src);
  if (!image) {
    return undefined;
  }

  applyImageGeometry(image, item, canvas, template);
  image.set({
    clipPath: item.clipPath
      ? new fabric.Path(item.clipPath, { absolutePositioned: true, originX: "center", originY: "center" })
      : undefined,
  });
  image.filters = buildImageFilters(item.filters, item.monochrome, item.tint ?? item.colorOverlay?.color ?? null);
  image.applyFilters();

  if (item.colorOverlay) {
    image.filters = [
      ...(image.filters ?? []),
      new fabric.Image.filters.BlendColor({
        alpha: item.colorOverlay.opacity,
        color: item.colorOverlay.color,
        mode: "tint",
      }),
    ];
    image.applyFilters();
  }

  applySharedOptions(image as TemplateFabricObject, canvas, template, item);
  attachTemplateMetadata(image as TemplateFabricObject, template, item, template.primaryArtboard.id, quickEditKey);
  ensureObjectId(image, `${template.id}-${item.id}`);
  (image as TemplateFabricObject).data = {
    ...((image as TemplateFabricObject).data ?? {}),
    fitMode: item.fit,
    originalSrc: item.src,
  };
  return image as TemplateFabricObject;
};

const createVectorObject = async (
  canvas: fabric.Canvas,
  template: NormalizedTemplateDefinition,
  item: VectorLayer,
  quickEditKey?: string
) => {
  const vector = await loadFabricVector(item.src);
  if (!vector) {
    return undefined;
  }

  applyImageGeometry(vector, item, canvas, template);
  if (item.monochrome || item.colorOverrides) {
    const groupVector = vector as fabric.Group;
    groupVector.getObjects?.().forEach((child: fabric.Object) => {
      const currentFill = typeof child.fill === "string" ? child.fill.toLowerCase() : undefined;
      const override =
        (currentFill && item.colorOverrides?.[currentFill]) ||
        (currentFill && item.colorOverrides?.[currentFill.replace("#", "")]) ||
        (item.monochrome ? Object.values(item.colorOverrides ?? {})[0] ?? "#111827" : undefined);
      if (override) {
        child.set({ fill: override });
      }
    });
  }

  applySharedOptions(vector as TemplateFabricObject, canvas, template, item);
  attachTemplateMetadata(vector as TemplateFabricObject, template, item, template.primaryArtboard.id, quickEditKey);
  ensureObjectId(vector, `${template.id}-${item.id}`);
  return vector as TemplateFabricObject;
};

const createFabricObject = async (
  canvas: fabric.Canvas,
  template: NormalizedTemplateDefinition,
  item: EditorLayer,
  placeholderMap: Map<string, string>
) => {
  const quickEditKey = item.placeholderKey ? placeholderMap.get(item.placeholderKey) : undefined;

  if (item.type === "text") {
    return createTextObject(canvas, template, item, quickEditKey);
  }

  if (item.type === "shape") {
    return createShapeObject(canvas, template, item, quickEditKey);
  }

  if (item.type === "image") {
    return createImageObject(canvas, template, item, quickEditKey);
  }

  if (item.type === "vector") {
    return createVectorObject(canvas, template, item, quickEditKey);
  }

  return undefined;
};

export const applyTemplateToCanvas = async ({
  activeSide,
  editor,
  mode = "add",
  template,
}: {
  activeSide?: string;
  editor?: FabricJSEditor;
  mode?: TemplateApplyMode;
  template: TemplateDefinition;
}) => {
  const canvas = editor?.canvas;
  if (!canvas) {
    return [];
  }

  const normalized = normalizeTemplate(template);
  const artboardName = activeSide && normalized.sides.some((artboard) => artboard.name === activeSide) ? activeSide : undefined;
  const runtimeTemplate: NormalizedTemplateDefinition = {
    ...normalized,
    primaryArtboard: artboardName
      ? normalized.sides.find((artboard) => artboard.name === artboardName) ?? normalized.primaryArtboard
      : normalized.primaryArtboard,
  };

  if (mode === "replace") {
    canvas.getObjects().slice().forEach((object) => canvas.remove(object));
    canvas.discardActiveObject();
  }

  const orderedObjects = getTemplateLayers(runtimeTemplate, runtimeTemplate.primaryArtboard.name)
    .slice()
    .sort((left, right) => left.zIndex - right.zIndex);
  const placeholderMap = new Map(runtimeTemplate.placeholders?.map((placeholder) => [placeholder.key, placeholder.key]) ?? []);
  const createdObjects: TemplateFabricObject[] = [];

  for (const item of orderedObjects) {
    if (item.type === "group") {
      continue;
    }
    const nextObject = await createFabricObject(canvas, runtimeTemplate, item, placeholderMap);
    if (!nextObject) {
      continue;
    }
    createdObjects.push(nextObject);
  }

  if (createdObjects.length === 0) {
    return [];
  }

  createdObjects.forEach((object) => canvas.add(object));

  if (createdObjects.length === 1) {
    canvas.setActiveObject(createdObjects[0]);
  } else {
    canvas.setActiveObject(new fabric.ActiveSelection(createdObjects, { canvas }));
  }

  canvas.requestRenderAll();
  return createdObjects;
};

export const updateSelectedTemplateObject = (
  editor: FabricJSEditor | undefined,
  updates: Partial<fabric.Object> & { text?: string }
) => {
  const canvas = editor?.canvas;
  const active = canvas?.getActiveObject() as (fabric.Object & { data?: Record<string, unknown>; text?: string }) | undefined;

  if (!canvas || !active || active.data?.isTemplateObject !== true) {
    return;
  }

  if (typeof updates.text === "string" && "text" in active) {
    active.set("text", updates.text);
  }

  active.set(updates);
  active.setCoords();
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: active });
  if (typeof updates.text === "string") {
    canvas.fire("text:changed", { target: active });
  }
};
