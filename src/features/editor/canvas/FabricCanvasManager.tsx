import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import type { EditorSide } from "../../../types";
import { useEditorStore } from "../../../hooks";
import { ensureCanvasObjectIds } from "../../../lib/fabric";
import { useCanvasSync } from "../hooks";
import {
  deleteSelection,
  downloadCanvas,
  exportCanvasJson,
  initializeCanvas,
  zoomCanvas,
} from "../lib/editorActions";
import { addImageObject, IMAGE_SERIALIZE_PROPS } from "../image/imageService";
import { SHAPE_SERIALIZE_PROPS } from "../shapes/shapeService";
import { addTextObject, TEXT_SERIALIZE_PROPS } from "../text/FabricTextService";

type SideHistory = {
  future: string[];
  past: string[];
};

const createHistory = (): SideHistory => ({
  future: [],
  past: [],
});

export const FabricCanvasManager = () => {
  const { editor, onReady } = useFabricJSEditor();
  const {
    activeSide,
    setCanvasControls,
    setEditorInstance,
    setHistoryState,
    setZoom,
  } = useEditorStore();

  const historyRef = useRef<Record<EditorSide, SideHistory>>({
    front: createHistory(),
    back: createHistory(),
  });
  const sideSnapshotsRef = useRef<Record<EditorSide, string>>({
    front: "",
    back: "",
  });
  const lastCommittedRef = useRef<Record<EditorSide, string>>({
    front: "",
    back: "",
  });
  const isApplyingSnapshotRef = useRef(false);
  const readyRef = useRef(false);
  const activeSideRef = useRef<EditorSide>(activeSide);
  const latestEditorRef = useRef(editor);
  const registeredCanvasRef = useRef<fabric.Canvas>();
  const registeredControlsCanvasRef = useRef<fabric.Canvas>();
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [guideState, setGuideState] = useState({ showX: false, showY: false });

  useEffect(() => {
    latestEditorRef.current = editor;
  }, [editor]);

  const serializeCanvas = useCallback(() => {
    const canvas = editor?.canvas;

    if (!canvas) {
      return "";
    }

    ensureCanvasObjectIds(canvas);
    return JSON.stringify(canvas.toJSON([...TEXT_SERIALIZE_PROPS, ...IMAGE_SERIALIZE_PROPS, ...SHAPE_SERIALIZE_PROPS, "data"]));
  }, [editor]);

  const syncHistoryState = useCallback(
    (side: EditorSide) => {
      const sideHistory = historyRef.current[side];
      setHistoryState({
        canUndo: sideHistory.past.length > 0,
        canRedo: sideHistory.future.length > 0,
      });
    },
    [setHistoryState]
  );

  const applySnapshot = useCallback(
    (snapshot: string) => {
      const canvas = editor?.canvas;

      if (!canvas) {
        return;
      }

      isApplyingSnapshotRef.current = true;
      canvas.discardActiveObject();

      if (!snapshot) {
        canvas.clear();
        initializeCanvas(canvas);
        setZoom(canvas.getZoom());
        isApplyingSnapshotRef.current = false;
        return;
      }

      canvas.loadFromJSON(JSON.parse(snapshot), () => {
        ensureCanvasObjectIds(canvas);
        initializeCanvas(canvas);
        setZoom(canvas.getZoom());
        isApplyingSnapshotRef.current = false;
      });
    },
    [editor, setZoom]
  );

  useEffect(() => {
    if (registeredCanvasRef.current === editor?.canvas) {
      return;
    }

    registeredCanvasRef.current = editor?.canvas;
    setEditorInstance({ editor, canvas: editor?.canvas });
  }, [editor, setEditorInstance]);

  useCanvasSync();

  useEffect(() => {
    if (!editor?.canvas) {
      return;
    }

    const canvas = editor.canvas;
    const commitSnapshot = () => {
      if (isApplyingSnapshotRef.current) {
        return;
      }

      const side = activeSideRef.current;
      const snapshot = serializeCanvas();
      const previousSnapshot = lastCommittedRef.current[side];

      if (!snapshot || snapshot === previousSnapshot) {
        return;
      }

      if (previousSnapshot) {
        historyRef.current[side].past.push(previousSnapshot);
      }

      historyRef.current[side].future = [];
      sideSnapshotsRef.current[side] = snapshot;
      lastCommittedRef.current[side] = snapshot;
      syncHistoryState(side);
    };

    canvas.on("object:added", commitSnapshot);
    canvas.on("object:removed", commitSnapshot);
    canvas.on("object:modified", commitSnapshot);
    canvas.on("text:changed", commitSnapshot);

    return () => {
      canvas.off("object:added", commitSnapshot);
      canvas.off("object:removed", commitSnapshot);
      canvas.off("object:modified", commitSnapshot);
      canvas.off("text:changed", commitSnapshot);
    };
  }, [editor, serializeCanvas, syncHistoryState]);

  useEffect(() => {
    if (!editor?.canvas || !readyRef.current) {
      return;
    }

    const currentSide = activeSideRef.current;

    if (currentSide === activeSide) {
      return;
    }

    sideSnapshotsRef.current[currentSide] = serializeCanvas();
    lastCommittedRef.current[currentSide] = sideSnapshotsRef.current[currentSide];
    activeSideRef.current = activeSide;
    applySnapshot(sideSnapshotsRef.current[activeSide]);
    syncHistoryState(activeSide);
  }, [activeSide, applySnapshot, editor, serializeCanvas, syncHistoryState]);

  useEffect(() => {
    const canvas = editor?.canvas;

    if (!canvas) {
      return;
    }

    const handleMoving = (event: fabric.IEvent<Event>) => {
      const target = event.target;
      if (!target) {
        return;
      }

      const center = target.getCenterPoint();
      const canvasCenterX = canvas.getWidth() / 2;
      const canvasCenterY = canvas.getHeight() / 2;
      const snapThreshold = 6;

      let showX = false;
      let showY = false;

      if (Math.abs(center.x - canvasCenterX) <= snapThreshold) {
        target.setPositionByOrigin(new fabric.Point(canvasCenterX, center.y), "center", "center");
        showX = true;
      }

      if (Math.abs(center.y - canvasCenterY) <= snapThreshold) {
        target.setPositionByOrigin(new fabric.Point(center.x, canvasCenterY), "center", "center");
        showY = true;
      }

      const bounds = target.getBoundingRect(true, true);
      if (bounds.left < 0) {
        target.left = (target.left ?? 0) + Math.abs(bounds.left);
      }

      if (bounds.top < 0) {
        target.top = (target.top ?? 0) + Math.abs(bounds.top);
      }

      const overflowRight = bounds.left + bounds.width - canvas.getWidth();
      if (overflowRight > 0) {
        target.left = (target.left ?? 0) - overflowRight;
      }

      const overflowBottom = bounds.top + bounds.height - canvas.getHeight();
      if (overflowBottom > 0) {
        target.top = (target.top ?? 0) - overflowBottom;
      }

      target.setCoords();

      setGuideState({ showX, showY });
      canvas.requestRenderAll();
    };

    const clearGuides = () => setGuideState({ showX: false, showY: false });

    canvas.on("object:moving", handleMoving);
    canvas.on("object:modified", clearGuides);
    canvas.on("selection:cleared", clearGuides);
    canvas.on("mouse:up", clearGuides);

    return () => {
      canvas.off("object:moving", handleMoving);
      canvas.off("object:modified", clearGuides);
      canvas.off("selection:cleared", clearGuides);
      canvas.off("mouse:up", clearGuides);
    };
  }, [editor]);

  useEffect(() => {
    const canvas = editor?.canvas;
    const container = canvasContainerRef.current;

    if (!canvas || !container) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || container.contains(target) || !canvas.getActiveObject()) {
        return;
      }

      // canvas.discardActiveObject();
      // canvas.requestRenderAll();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [editor]);

  const controls = useMemo(
    () => ({
      addImage: (file?: File) => {
        void addImageObject(latestEditorRef.current, file);
      },
      addText: (payload?: Parameters<typeof addTextObject>[1]) => {
        addTextObject(latestEditorRef.current, payload);
      },
      deleteSelected: () => deleteSelection({ editor: latestEditorRef.current }),
      downloadPreview: () => downloadCanvas({ editor: latestEditorRef.current }),
      exportDesign: () => {
        const snapshot = exportCanvasJson(latestEditorRef.current);

        if (!snapshot) {
          return;
        }

        const blob = new Blob([snapshot], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `shirt-design-${activeSideRef.current}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },
      importDesign: (file?: File) => {
        if (!file) {
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const content = typeof reader.result === "string" ? reader.result : "";

          if (!content) {
            return;
          }

          const side = activeSideRef.current;
          historyRef.current[side] = createHistory();
          sideSnapshotsRef.current[side] = content;
          lastCommittedRef.current[side] = content;
          applySnapshot(content);
          syncHistoryState(side);
        };
        reader.readAsText(file);
      },
      redo: () => {
        const side = activeSideRef.current;
        const sideHistory = historyRef.current[side];
        const next = sideHistory.future.pop();

        if (!next) {
          return;
        }

        const current = serializeCanvas();
        if (current) {
          sideHistory.past.push(current);
        }

        sideSnapshotsRef.current[side] = next;
        lastCommittedRef.current[side] = next;
        applySnapshot(next);
        syncHistoryState(side);
      },
      resetView: () => {
        const canvas = latestEditorRef.current?.canvas;

        if (!canvas) {
          return;
        }

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.setZoom(1);
        canvas.requestRenderAll();
        setZoom(1);
      },
      shareDesign: async () => {
        const canvas = latestEditorRef.current?.canvas;

        if (!canvas) {
          return;
        }

        const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });

        if (navigator.share) {
          try {
            await navigator.share({
              title: "ThreadSmith design preview",
              text: "Check out this t-shirt design preview.",
              url: dataUrl,
            });
            return;
          } catch {
            // fall back to download
          }
        }

        downloadCanvas({ editor: latestEditorRef.current });
      },
      undo: () => {
        const side = activeSideRef.current;
        const sideHistory = historyRef.current[side];
        const previous = sideHistory.past.pop();

        if (!previous) {
          return;
        }

        const current = serializeCanvas();
        if (current) {
          sideHistory.future.push(current);
        }

        sideSnapshotsRef.current[side] = previous;
        lastCommittedRef.current[side] = previous;
        applySnapshot(previous);
        syncHistoryState(side);
      },
      zoomIn: () => {
        const nextZoom = zoomCanvas(latestEditorRef.current, 0.1);
        setZoom(nextZoom);
      },
      zoomOut: () => {
        const nextZoom = zoomCanvas(latestEditorRef.current, -0.1);
        setZoom(nextZoom);
      },
    }),
    [applySnapshot, serializeCanvas, setZoom, syncHistoryState]
  );

  useEffect(() => {
    if (!editor?.canvas || registeredControlsCanvasRef.current === editor.canvas) {
      return;
    }

    registeredControlsCanvasRef.current = editor.canvas;
    setCanvasControls(controls);
  }, [controls, editor, setCanvasControls]);

  return (
    <div
      ref={canvasContainerRef}
      className="relative h-[370px] w-[300px] rounded-[22px] border border-dashed border-slate-200/70 bg-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
    >
      <div className="pointer-events-none absolute inset-x-4 top-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400/80">
        <span>Print area</span>
        <span>{activeSide}</span>
      </div>
      {guideState.showX && (
        <div className="pointer-events-none absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-sky-200/70" />
      )}
      {guideState.showY && (
        <div className="pointer-events-none absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-sky-200/70" />
      )}
      <FabricJSCanvas
        className="h-full w-full rounded-[22px]"
        onReady={(canvas) => {
          initializeCanvas(canvas);
          onReady(canvas);
          const blankSnapshot = JSON.stringify(canvas.toJSON([...TEXT_SERIALIZE_PROPS, ...IMAGE_SERIALIZE_PROPS, ...SHAPE_SERIALIZE_PROPS, "data"]));
          sideSnapshotsRef.current.front = blankSnapshot;
          sideSnapshotsRef.current.back = blankSnapshot;
          lastCommittedRef.current.front = blankSnapshot;
          lastCommittedRef.current.back = blankSnapshot;
          activeSideRef.current = activeSide;
          readyRef.current = true;
          syncHistoryState(activeSide);
        }}
      />
    </div>
  );
};
