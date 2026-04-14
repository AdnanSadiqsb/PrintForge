import type { fabric } from "fabric";
import type { CanvasObjectSummary, EditorObjectKind } from "../../types";
import { ensureObjectId, getObjectId } from "./objectRegistry";

const getObjectKind = (object: fabric.Object): EditorObjectKind => {
  if (object.type === "textbox" || object.type === "text" || object.type === "i-text") {
    return "text";
  }

  if (object.type === "image") {
    return "image";
  }

  if (object.type === "group") {
    const objectData = (object as fabric.Object & { data?: Record<string, unknown> }).data;
    if (Array.isArray(objectData?.childIds)) {
      return "group";
    }
    if (objectData?.templateObjectId && objectData?.originalSrc) {
      return "vector";
    }
  }

  if (
    object.type === "circle" ||
    object.type === "rect" ||
    object.type === "line" ||
    object.type === "triangle" ||
    object.type === "ellipse" ||
    object.type === "polygon" ||
    object.type === "path"
  ) {
    return "shape";
  }

  return "unknown";
};

const getObjectName = (object: fabric.Object, index: number) => {
  const objectData = (object as fabric.Object & { data?: Record<string, unknown> }).data;
  if (typeof objectData?.objectLabel === "string" && objectData.objectLabel.trim()) {
    return objectData.objectLabel;
  }

  const kind = getObjectKind(object);

  if (kind === "text") {
    const textValue = (object as fabric.Textbox).text?.trim();
    return textValue || `Text ${index + 1}`;
  }

  if (kind === "image") {
    return `Image ${index + 1}`;
  }

  if (kind === "vector") {
    return `Vector ${index + 1}`;
  }

  if (kind === "group") {
    return `Group ${index + 1}`;
  }

  if (kind === "shape") {
    const shapeType =
      typeof (object as fabric.Object & { data?: Record<string, unknown> }).data?.shapeType === "string"
        ? ((object as fabric.Object & { data?: Record<string, unknown> }).data?.shapeType as string)
        : object.type ?? "shape";

    if (shapeType === "rounded-rect") {
      return "Rounded Rectangle";
    }

    if (shapeType === "rect") {
      return "Rectangle";
    }

    if (shapeType === "circle") {
      return "Circle";
    }

    if (shapeType === "ellipse") {
      return "Ellipse";
    }

    if (shapeType === "triangle") {
      return "Triangle";
    }

    if (shapeType === "line") {
      return "Line";
    }

    if (shapeType === "star") {
      return "Star";
    }

    return `${shapeType} ${index + 1}`;
  }

  return `Object ${index + 1}`;
};

export const toCanvasObjectSummary = (
  object: fabric.Object,
  index: number,
  activeObject?: fabric.Object
): CanvasObjectSummary => {
  const id = getObjectId(object) ?? ensureObjectId(object, `object-${index + 1}`);
  const kind = getObjectKind(object);
  const base = {
    id,
    kind,
    fabricType: object.type ?? "object",
    name: getObjectName(object, index),
    fill: typeof object.fill === "string" ? object.fill : null,
    groupId:
      typeof (object as fabric.Object & { data?: Record<string, unknown> }).data?.groupId === "string"
        ? ((object as fabric.Object & { data?: Record<string, unknown> }).data?.groupId as string)
        : undefined,
    isActive: activeObject === object,
    isLocked: Boolean((object as fabric.Object & { data?: Record<string, unknown> }).data?.isLocked),
    isVisible: (object.visible ?? true) && (object as fabric.Object & { data?: Record<string, unknown> }).data?.isVisible !== false,
  };

  if (kind === "text") {
    return {
      ...base,
      kind,
      text: (object as fabric.Textbox).text ?? "",
    };
  }

  if (kind === "image") {
    return {
      ...base,
      kind,
      src: typeof (object as fabric.Image).getSrc === "function" ? (object as fabric.Image).getSrc() : undefined,
    };
  }

  if (kind === "shape") {
    return {
      ...base,
      kind,
      shapeType:
        typeof (object as fabric.Object & { data?: Record<string, unknown> }).data?.shapeType === "string"
          ? ((object as fabric.Object & { data?: Record<string, unknown> }).data?.shapeType as string)
          : object.type ?? "shape",
    };
  }

  return base;
};

export const getCanvasObjects = (canvas?: fabric.Canvas) => {
  const activeObject = canvas?.getActiveObject() ?? undefined;
  return (canvas?.getObjects() ?? []).map((object, index) =>
    toCanvasObjectSummary(object, index, activeObject)
  );
};
