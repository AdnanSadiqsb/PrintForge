import { fabric } from "fabric";
import type { FabricJSEditor } from "fabricjs-react";
import { ensureObjectId } from "../../../lib/fabric";
import { IMAGE_SERIALIZE_PROPS } from "../image/imageService";
import { SHAPE_SERIALIZE_PROPS } from "../shapes/shapeService";
import { TEXT_SERIALIZE_PROPS } from "../text/FabricTextService";
import { downloadCanvasAsImage } from "../../../lib/utils";

type EditorActionContext = {
  editor?: FabricJSEditor;
};

export const initializeCanvas = (canvas: fabric.Canvas) => {
  canvas.backgroundColor = "transparent";
  canvas.preserveObjectStacking = true;
  canvas.selectionColor = "rgba(14, 165, 233, 0.12)";
  canvas.selectionBorderColor = "#0ea5e9";
  canvas.renderAll();
};

export const deleteSelection = ({ editor }: EditorActionContext) => {
  const canvas = editor?.canvas;

  if (!canvas) {
    return;
  }

  canvas.getActiveObjects().forEach((object) => canvas.remove(object));
  canvas.discardActiveObject();
  canvas.renderAll();
};

export const downloadCanvas = ({ editor }: EditorActionContext) => {
  downloadCanvasAsImage(editor);
};

export const addImage = ({ editor }: EditorActionContext, file?: File) => {
  if (!editor || !file) {
    return;
  }

  const objectUrl = URL.createObjectURL(file);

  fabric.Image.fromURL(objectUrl, (image) => {
    const canvas = editor.canvas;
    ensureObjectId(image, `object-${editor.canvas.getObjects().length + 1}`);
    image.set({
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: "center",
      originY: "center",
    });
    image.scaleToWidth(Math.min(canvas.getWidth() * 0.7, 180));
    editor.canvas.add(image);
    editor.canvas.setActiveObject(image);
    editor.canvas.renderAll();
    URL.revokeObjectURL(objectUrl);
  });
};

export const zoomCanvas = (editor: FabricJSEditor | undefined, delta: number) => {
  const canvas = editor?.canvas;

  if (!canvas) {
    return 1;
  }

  const nextZoom = Math.min(2, Math.max(0.6, canvas.getZoom() + delta));
  const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
  canvas.zoomToPoint(center, nextZoom);
  canvas.renderAll();

  return nextZoom;
};

export const exportCanvasJson = (editor: FabricJSEditor | undefined) => {
  const canvas = editor?.canvas;

  if (!canvas) {
    return "";
  }

  return JSON.stringify(canvas.toJSON([...TEXT_SERIALIZE_PROPS, ...IMAGE_SERIALIZE_PROPS, ...SHAPE_SERIALIZE_PROPS, "data"]));
};

export const selectLayerById = (editor: FabricJSEditor | undefined, objectId: string) => {
  const canvas = editor?.canvas;

  if (!canvas) {
    return;
  }

  const target = canvas.getObjects().find((object, index) => {
    const id = ensureObjectId(object, `object-${index + 1}`);
    return id === objectId;
  });

  if (!target) {
    return;
  }

  canvas.setActiveObject(target);
  canvas.renderAll();
};

export const duplicateSelectedObject = ({ editor }: EditorActionContext) => {
  const canvas = editor?.canvas;
  const active = canvas?.getActiveObject();

  if (!canvas || !active) {
    return;
  }

  active.clone((cloned: fabric.Object | undefined) => {
    if (!cloned) {
      return;
    }

    ensureObjectId(cloned, `object-${canvas.getObjects().length + 1}`);
    cloned.set({
      left: (active.left ?? 0) + 18,
      top: (active.top ?? 0) + 18,
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: cloned });
  });
};

export const reorderSelectedObject = (
  editor: FabricJSEditor | undefined,
  action: "forward" | "backward" | "front" | "back"
) => {
  const canvas = editor?.canvas;
  const active = canvas?.getActiveObject();

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

export const toggleSelectedObjectVisibility = (editor: FabricJSEditor | undefined, visible: boolean) => {
  const canvas = editor?.canvas;
  const active = canvas?.getActiveObject() as (fabric.Object & { data?: Record<string, unknown> }) | undefined;

  if (!canvas || !active) {
    return;
  }

  active.set({ visible });
  active.data = {
    ...(active.data ?? {}),
    isVisible: visible,
  };
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: active });
};

export const toggleSelectedObjectLock = (editor: FabricJSEditor | undefined, locked: boolean) => {
  const canvas = editor?.canvas;
  const active = canvas?.getActiveObject() as (fabric.Object & { data?: Record<string, unknown> }) | undefined;

  if (!canvas || !active) {
    return;
  }

  active.set({
    lockMovementX: locked,
    lockMovementY: locked,
    lockRotation: locked,
    lockScalingX: locked,
    lockScalingY: locked,
  });
  active.data = {
    ...(active.data ?? {}),
    isLocked: locked,
  };
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: active });
};
