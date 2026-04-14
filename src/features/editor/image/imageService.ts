import { fabric } from "fabric";
import type { FabricJSEditor } from "fabricjs-react";
import { ensureObjectId } from "../../../lib/fabric";

export const IMAGE_SERIALIZE_PROPS = [
  "filters",
  "flipX",
  "flipY",
  "opacity",
  "angle",
  "scaleX",
  "scaleY",
  "cropX",
  "cropY",
];

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export type ImageAdjustments = {
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: boolean;
  invert: boolean;
  monochrome: boolean;
  saturation: number;
  tint: string;
};

export type ImageObjectData = {
  adjustments?: ImageAdjustments;
  aspectRatioLocked?: boolean;
  mimeType?: string;
  originalHeight?: number;
  originalName?: string;
  originalSrc?: string;
  originalWidth?: number;
};

export const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  blur: 0,
  brightness: 0,
  contrast: 0,
  grayscale: false,
  invert: false,
  monochrome: false,
  saturation: 0,
  tint: "#ffffff",
};

type FabricImageWithData = fabric.Image & {
  data?: ImageObjectData & Record<string, unknown>;
};

export const getActiveImageObject = (editor?: FabricJSEditor) => {
  const active = editor?.canvas?.getActiveObject();
  if (!active || active.type !== "image") {
    return undefined;
  }

  return active as FabricImageWithData;
};

export const validateImageFile = (file?: File) => {
  if (!file) {
    return "Choose an image file to upload.";
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported format. Use PNG, JPG, JPEG, WEBP, or SVG.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "This file is too large. Please keep uploads under 10 MB.";
  }

  return "";
};

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read the image file."));
    };
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });

const getObjectBounds = (object: fabric.Object) => object.getBoundingRect(true, true);

const clampObjectInsideCanvas = (object: fabric.Object, canvas: fabric.Canvas) => {
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

export const fitImageToCanvas = (
  image: FabricImageWithData,
  canvas: fabric.Canvas,
  mode: "contain" | "cover" = "contain"
) => {
  const element = image.getElement() as HTMLImageElement | undefined;
  const sourceWidth = image.width ?? element?.naturalWidth ?? 1;
  const sourceHeight = image.height ?? element?.naturalHeight ?? 1;

  if (!sourceWidth || !sourceHeight) {
    return;
  }

  const maxWidth = canvas.getWidth() * 0.78;
  const maxHeight = canvas.getHeight() * 0.78;
  const widthRatio = maxWidth / sourceWidth;
  const heightRatio = maxHeight / sourceHeight;
  const scale = mode === "cover" ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
  const safeScale = Math.max(0.1, Math.min(scale, 3));

  image.set({
    scaleX: safeScale,
    scaleY: safeScale,
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
  });
  image.setCoords();
};

const buildFilters = (adjustments: ImageAdjustments) => {
  const filters: fabric.IBaseFilter[] = [];
  const imageFilters = fabric.Image.filters as typeof fabric.Image.filters & {
    BlackWhite?: new () => fabric.IBaseFilter;
  };

  if (adjustments.brightness !== 0) {
    filters.push(new fabric.Image.filters.Brightness({ brightness: adjustments.brightness }));
  }

  if (adjustments.contrast !== 0) {
    filters.push(new fabric.Image.filters.Contrast({ contrast: adjustments.contrast }));
  }

  if (adjustments.saturation !== 0) {
    filters.push(new fabric.Image.filters.Saturation({ saturation: adjustments.saturation }));
  }

  if (adjustments.blur > 0) {
    filters.push(new fabric.Image.filters.Blur({ blur: adjustments.blur }));
  }

  if (adjustments.grayscale) {
    filters.push(new fabric.Image.filters.Grayscale());
  }

  if (adjustments.invert) {
    filters.push(new fabric.Image.filters.Invert());
  }

  if (adjustments.monochrome) {
    if (imageFilters.BlackWhite) {
      filters.push(new imageFilters.BlackWhite());
    } else {
      filters.push(new fabric.Image.filters.Grayscale());
    }
  }

  if (adjustments.tint !== "#ffffff") {
    filters.push(
      new fabric.Image.filters.BlendColor({
        alpha: 0.45,
        color: adjustments.tint,
        mode: "tint",
      })
    );
  }

  return filters;
};

export const applyImageAdjustments = (
  editor: FabricJSEditor | undefined,
  adjustments: Partial<ImageAdjustments>
) => {
  const image = getActiveImageObject(editor);
  const canvas = editor?.canvas;

  if (!image || !canvas) {
    return;
  }

  const current = {
    ...DEFAULT_IMAGE_ADJUSTMENTS,
    ...(image.data?.adjustments ?? {}),
    ...adjustments,
  };

  image.filters = buildFilters(current);
  image.applyFilters();
  image.data = {
    ...(image.data ?? {}),
    adjustments: current,
  };
  image.setCoords();
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: image });
};

export const addImageObject = async (editor: FabricJSEditor | undefined, file?: File) => {
  if (!editor || !file) {
    return undefined;
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const src = await readFileAsDataUrl(file);

  return new Promise<FabricImageWithData | undefined>((resolve, reject) => {
    fabric.Image.fromURL(
      src,
      (image) => {
        if (!image) {
          reject(new Error("Could not load that image."));
          return;
        }

        const canvas = editor.canvas;
        ensureObjectId(image, `object-${canvas.getObjects().length + 1}`);
        const element = image.getElement() as HTMLImageElement | undefined;

        image.set({
          originX: "center",
          originY: "center",
          transparentCorners: false,
          cornerColor: "#0ea5e9",
          cornerStrokeColor: "#ffffff",
          borderColor: "#38bdf8",
          cornerStyle: "circle",
          lockUniScaling: true,
        });

        image.data = {
          ...(image.data ?? {}),
          adjustments: DEFAULT_IMAGE_ADJUSTMENTS,
          aspectRatioLocked: true,
          mimeType: file.type,
          originalHeight: element?.naturalHeight ?? image.height ?? 0,
          originalName: file.name,
          originalSrc: src,
          originalWidth: element?.naturalWidth ?? image.width ?? 0,
        };

        fitImageToCanvas(image, canvas, "contain");
        canvas.add(image);
        canvas.setActiveObject(image);
        clampObjectInsideCanvas(image, canvas);
        canvas.requestRenderAll();
        resolve(image);
      },
      {
        crossOrigin: "anonymous",
      }
    );
  });
};

export const updateImageObject = (
  editor: FabricJSEditor | undefined,
  updates: Partial<fabric.Image>,
  options?: { clampToCanvas?: boolean }
) => {
  const image = getActiveImageObject(editor);
  const canvas = editor?.canvas;

  if (!image || !canvas) {
    return;
  }

  image.set(updates);
  image.setCoords();

  if (options?.clampToCanvas !== false) {
    clampObjectInsideCanvas(image, canvas);
  }

  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: image });
};

export const resetImageTransform = (editor: FabricJSEditor | undefined) => {
  const image = getActiveImageObject(editor);
  const canvas = editor?.canvas;

  if (!image || !canvas) {
    return;
  }

  image.set({
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
  });
  fitImageToCanvas(image, canvas, "contain");
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: image });
};

export const centerImage = (editor: FabricJSEditor | undefined, axis: "x" | "y" | "both") => {
  const image = getActiveImageObject(editor);
  const canvas = editor?.canvas;

  if (!image || !canvas) {
    return;
  }

  image.set({
    left: axis === "y" ? image.left : canvas.getWidth() / 2,
    top: axis === "x" ? image.top : canvas.getHeight() / 2,
    originX: "center",
    originY: "center",
  });
  image.setCoords();
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: image });
};

export const reorderImageLayer = (
  editor: FabricJSEditor | undefined,
  action: "forward" | "backward" | "front" | "back"
) => {
  const image = getActiveImageObject(editor);
  const canvas = editor?.canvas;

  if (!image || !canvas) {
    return;
  }

  if (action === "forward") {
    canvas.bringForward(image);
  } else if (action === "backward") {
    canvas.sendBackwards(image);
  } else if (action === "front") {
    canvas.bringToFront(image);
  } else {
    canvas.sendToBack(image);
  }

  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: image });
};

export const getImageQualityLabel = (image?: FabricImageWithData) => {
  if (!image) {
    return { label: "No image selected", tone: "neutral" as const };
  }

  const originalWidth = image.data?.originalWidth ?? image.width ?? 0;
  const displayedWidth = (image.width ?? 0) * (image.scaleX ?? 1);
  const ratio = displayedWidth > 0 ? originalWidth / displayedWidth : 0;

  if (ratio >= 3) {
    return { label: "Good quality", tone: "good" as const };
  }

  if (ratio >= 2) {
    return { label: "Acceptable for print", tone: "ok" as const };
  }

  return { label: "Low resolution for print", tone: "low" as const };
};
