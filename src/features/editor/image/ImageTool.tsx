import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCheckCircle, FiImage, FiTrash2 } from "react-icons/fi";
import { Card, Button } from "../../../components/ui";
import { useEditorStore } from "../../../hooks";
import { cn } from "../../../lib/utils";
import type { ImageCanvasObject } from "../../../types";
import { selectLayerById } from "../lib/editorActions";
import { ImagePropertiesPanel } from "./ImagePropertiesPanel";
import { ImageUploadPanel } from "./ImageUploadPanel";
import {
  DEFAULT_IMAGE_ADJUSTMENTS,
  addImageObject,
  applyImageAdjustments,
  centerImage,
  fitImageToCanvas,
  getActiveImageObject,
  getImageQualityLabel,
  reorderImageLayer,
  resetImageTransform,
  updateImageObject,
  type ImageAdjustments,
} from "./imageService";

type ImageEditorState = {
  adjustments: ImageAdjustments;
  displayedHeight: number;
  displayedWidth: number;
  hasImage: boolean;
  isAspectLocked: boolean;
  opacity: number;
  position: { x: number; y: number };
  qualityLabel: string;
  qualityTone: "good" | "ok" | "low" | "neutral";
  rotation: number;
  sourceInfo: { height: number; name: string; width: number };
};

const DEFAULT_STATE: ImageEditorState = {
  adjustments: DEFAULT_IMAGE_ADJUSTMENTS,
  displayedHeight: 0,
  displayedWidth: 0,
  hasImage: false,
  isAspectLocked: true,
  opacity: 1,
  position: { x: 0, y: 0 },
  qualityLabel: "No image selected",
  qualityTone: "neutral",
  rotation: 0,
  sourceInfo: { height: 0, name: "", width: 0 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const UploadedImageList = ({
  imageLayers,
  onDelete,
  onSelect,
  selectedId,
}: {
  imageLayers: ImageCanvasObject[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId?: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Uploaded Images</p>
        <p className="mt-1 text-xs text-slate-500">Select artwork here without hunting on the canvas.</p>
      </div>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
        {imageLayers.length} item{imageLayers.length === 1 ? "" : "s"}
      </span>
    </div>

    <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
      {imageLayers.map((layer) => {
        const isActive = layer.id === selectedId;
        const displayName = layer.name || "Uploaded image";

        return (
          <div
            key={layer.id}
            className={cn(
              "group grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 transition",
              isActive ? "border-sky-200 bg-sky-50/50 shadow-sm" : "border-slate-200/80 hover:border-slate-300"
            )}
          >
            <button
              className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50"
              onClick={() => onSelect(layer.id)}
              type="button"
            >
              {layer.src ? (
                <img alt={displayName} className="h-full w-full object-cover" src={layer.src} />
              ) : (
                <FiImage className="text-slate-300" />
              )}
            </button>

            <button className="min-w-0 text-left" onClick={() => onSelect(layer.id)} type="button">
              <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{layer.src ? "Artwork placed on canvas" : "Image asset"}</p>
            </button>

            <Button
              aria-label={`Delete ${displayName}`}
              className={cn(
                "h-10 w-10 rounded-xl p-0 text-slate-400 transition hover:text-rose-600",
                "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                isActive && "opacity-100 pointer-events-auto"
              )}
              onClick={() => onDelete(layer.id)}
              variant="ghost"
            >
              <FiTrash2 className="text-base" />
            </Button>
          </div>
        );
      })}
    </div>
  </div>
);

const SelectedImageSummary = ({
  hasImage,
  sourceInfo,
}: Pick<ImageEditorState, "hasImage" | "sourceInfo">) => {
  if (!hasImage) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Selected Image</p>
          <p className="mt-2 truncate text-sm font-medium text-slate-800">{sourceInfo.name || "Selected artwork"}</p>
          <p className="mt-1 text-xs text-slate-400">
            {sourceInfo.width} x {sourceInfo.height}px source
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <FiCheckCircle />
          Active
        </span>
      </div>
    </div>
  );
};

export const ImageTool = () => {
  const { editor, layers, selectedObjectId, canvasControls } = useEditorStore();
  const [state, setState] = useState<ImageEditorState>(DEFAULT_STATE);
  const [isUploading, setIsUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const stateRef = useRef(DEFAULT_STATE);
  const isApplyingUiUpdateRef = useRef(false);

  const imageLayers = useMemo(
    () => layers.filter((layer): layer is ImageCanvasObject => layer.kind === "image"),
    [layers]
  );

  const hasUploadedImages = imageLayers.length > 0;

  const syncFromCanvas = useCallback(() => {
    if (isApplyingUiUpdateRef.current) {
      isApplyingUiUpdateRef.current = false;
      return;
    }

    const image = getActiveImageObject(editor);
    if (!image) {
      setState((prev) => ({ ...prev, hasImage: false }));
      return;
    }

    const quality = getImageQualityLabel(image);
    const nextState: ImageEditorState = {
      adjustments: {
        ...DEFAULT_IMAGE_ADJUSTMENTS,
        ...(image.data?.adjustments ?? {}),
      },
      displayedHeight: (image.height ?? 0) * (image.scaleY ?? 1),
      displayedWidth: (image.width ?? 0) * (image.scaleX ?? 1),
      hasImage: true,
      isAspectLocked: image.data?.aspectRatioLocked !== false,
      opacity: image.opacity ?? 1,
      position: {
        x: image.left ?? 0,
        y: image.top ?? 0,
      },
      qualityLabel: quality.label,
      qualityTone: quality.tone,
      rotation: Math.round(image.angle ?? 0),
      sourceInfo: {
        height: image.data?.originalHeight ?? 0,
        name: image.data?.originalName ?? "Selected artwork",
        width: image.data?.originalWidth ?? 0,
      },
    };

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

  const handleFileSelect = async (file?: File) => {
    setError("");
    setStatus("");

    if (!file) {
      return;
    }

    setPreviewSrc(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const image = await addImageObject(editor, file);
      if (!image) {
        return;
      }

      setStatus(`${file.name} placed on the shirt and ready to edit.`);
      syncFromCanvas();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload that file.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateStateAndCanvas = (updater: (current: ImageEditorState) => ImageEditorState, run: () => void) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    setState(next);
    isApplyingUiUpdateRef.current = true;
    run();
  };

  const handleSizeChange = (axis: "width" | "height", value: number) => {
    const image = getActiveImageObject(editor);
    if (!image || !editor?.canvas) {
      return;
    }

    const safeValue = Math.max(10, value);
    const width = image.width ?? 1;
    const height = image.height ?? 1;
    const ratio = width / height;
    const locked = image.data?.aspectRatioLocked !== false;

    updateStateAndCanvas(
      (current) => {
        const nextWidth =
          axis === "width" ? safeValue : locked ? safeValue * ratio : current.displayedWidth;
        const nextHeight =
          axis === "height" ? safeValue : locked ? safeValue / ratio : current.displayedHeight;
        return {
          ...current,
          displayedHeight: nextHeight,
          displayedWidth: nextWidth,
        };
      },
      () => {
        const nextScaleX =
          axis === "width"
            ? safeValue / width
            : locked
              ? (safeValue * ratio) / width
              : stateRef.current.displayedWidth / width;
        const nextScaleY =
          axis === "height"
            ? safeValue / height
            : locked
              ? (safeValue / ratio) / height
              : stateRef.current.displayedHeight / height;
        updateImageObject(editor, { scaleX: nextScaleX, scaleY: nextScaleY });
      }
    );
  };

  const handleSelectImage = (id: string) => {
    selectLayerById(editor, id);
    syncFromCanvas();
  };

  const handleDeleteImage = (id: string) => {
    selectLayerById(editor, id);
    canvasControls.deleteSelected();
  };

  useEffect(() => {
    return () => {
      if (previewSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  return (
    <Card className="border-slate-200/60 bg-slate-50/60 shadow-none" description="" title="Add Images">
      <div className="space-y-4">
        <div className="space-y-3">
          {hasUploadedImages && (
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Upload</p>
          )}
          <ImageUploadPanel
            compact={hasUploadedImages}
            error={error}
            imageCount={imageLayers.length}
            isUploading={isUploading}
            previewSrc={previewSrc}
            status={status}
            onFileSelect={handleFileSelect}
          />
        </div>

        {hasUploadedImages && (
          <>
            <UploadedImageList
              imageLayers={imageLayers}
              onDelete={handleDeleteImage}
              onSelect={handleSelectImage}
              selectedId={selectedObjectId}
            />
            <SelectedImageSummary hasImage={state.hasImage} sourceInfo={state.sourceInfo} />
          </>
        )}

        <ImagePropertiesPanel
          adjustments={state.adjustments}
          disabled={!state.hasImage}
          displayedHeight={state.displayedHeight}
          displayedWidth={state.displayedWidth}
          hasImage={state.hasImage}
          hasUploadedImages={hasUploadedImages}
          isAspectLocked={state.isAspectLocked}
          opacity={state.opacity}
          position={state.position}
          qualityLabel={state.qualityLabel}
          qualityTone={state.qualityTone}
          rotation={state.rotation}
          sourceInfo={state.sourceInfo}
          onAdjustmentChange={(updates) => {
            updateStateAndCanvas(
              (current) => ({
                ...current,
                adjustments: {
                  ...current.adjustments,
                  ...updates,
                },
              }),
              () => applyImageAdjustments(editor, updates)
            );
          }}
          onCenter={(axis) => {
            updateStateAndCanvas((current) => current, () => centerImage(editor, axis));
          }}
          onDeleteSelected={canvasControls.deleteSelected}
          onFitMode={(mode) => {
            const image = getActiveImageObject(editor);
            const canvas = editor?.canvas;
            if (!image || !canvas) {
              return;
            }

            updateStateAndCanvas((current) => current, () => {
              fitImageToCanvas(image, canvas, mode);
              canvas.requestRenderAll();
              canvas.fire("object:modified", { target: image });
            });
          }}
          onFlipX={() => {
            const image = getActiveImageObject(editor);
            if (!image) {
              return;
            }

            updateStateAndCanvas((current) => current, () =>
              updateImageObject(editor, { flipX: !image.flipX }, { clampToCanvas: false })
            );
          }}
          onFlipY={() => {
            const image = getActiveImageObject(editor);
            if (!image) {
              return;
            }

            updateStateAndCanvas((current) => current, () =>
              updateImageObject(editor, { flipY: !image.flipY }, { clampToCanvas: false })
            );
          }}
          onLayerChange={(direction) => {
            updateStateAndCanvas((current) => current, () => reorderImageLayer(editor, direction));
          }}
          onLockAspectToggle={() => {
            const image = getActiveImageObject(editor);
            if (!image) {
              return;
            }

            updateStateAndCanvas(
              (current) => ({ ...current, isAspectLocked: !current.isAspectLocked }),
              () => {
                image.data = {
                  ...(image.data ?? {}),
                  aspectRatioLocked: image.data?.aspectRatioLocked === false,
                };
                image.set({
                  lockUniScaling: image.data?.aspectRatioLocked !== false,
                });
                editor?.canvas?.fire("object:modified", { target: image });
              }
            );
          }}
          onOpacityChange={(value) => {
            updateStateAndCanvas(
              (current) => ({ ...current, opacity: clamp(value / 100, 0.05, 1) }),
              () => updateImageObject(editor, { opacity: clamp(value / 100, 0.05, 1) })
            );
          }}
          onPositionChange={(axis, value) => {
            updateStateAndCanvas(
              (current) => ({
                ...current,
                position: {
                  ...current.position,
                  [axis]: value,
                },
              }),
              () => updateImageObject(editor, axis === "x" ? { left: value } : { top: value })
            );
          }}
          onResetTransform={() => {
            updateStateAndCanvas((current) => current, () => resetImageTransform(editor));
          }}
          onRotationChange={(value) => {
            updateStateAndCanvas(
              (current) => ({ ...current, rotation: clamp(value, -180, 180) }),
              () => updateImageObject(editor, { angle: clamp(value, -180, 180) }, { clampToCanvas: false })
            );
          }}
          onScaleBy={(delta) => {
            const image = getActiveImageObject(editor);
            if (!image) {
              return;
            }

            const nextScaleX = clamp((image.scaleX ?? 1) + delta, 0.1, 4);
            const nextScaleY = clamp((image.scaleY ?? 1) + delta, 0.1, 4);
            updateStateAndCanvas((current) => current, () =>
              updateImageObject(editor, { scaleX: nextScaleX, scaleY: nextScaleY })
            );
          }}
          onSizeChange={handleSizeChange}
        />
      </div>
    </Card>
  );
};
