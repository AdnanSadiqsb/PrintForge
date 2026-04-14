import type { fabric } from "fabric";

const OBJECT_ID_KEY = "editorObjectId";

type FabricObjectWithData = fabric.Object & {
  data?: Record<string, unknown>;
};

export const ensureObjectId = (object: fabric.Object, fallback: string) => {
  const target = object as FabricObjectWithData;
  const currentId = typeof target.data?.[OBJECT_ID_KEY] === "string" ? target.data[OBJECT_ID_KEY] : undefined;

  if (currentId) {
    return currentId;
  }

  const nextId = fallback;
  target.data = {
    ...(target.data ?? {}),
    [OBJECT_ID_KEY]: nextId,
  };

  return nextId;
};

export const getObjectId = (object: fabric.Object) => {
  const target = object as FabricObjectWithData;
  return typeof target.data?.[OBJECT_ID_KEY] === "string" ? target.data[OBJECT_ID_KEY] : undefined;
};

export const ensureCanvasObjectIds = (canvas: fabric.Canvas) => {
  canvas.getObjects().forEach((object, index) => {
    ensureObjectId(object, `object-${index + 1}`);
  });
};
