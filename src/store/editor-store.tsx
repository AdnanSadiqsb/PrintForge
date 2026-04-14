import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { fabric } from "fabric";
import type { FabricJSEditor } from "fabricjs-react";
import type {
  CanvasControlApi,
  CanvasObjectSummary,
  EditorPanelTab,
  EditorSide,
  EditorState,
} from "../types";

type EditorStoreValue = EditorState & {
  setEditorInstance: (payload: {
    editor?: FabricJSEditor;
    canvas?: fabric.Canvas;
  }) => void;
  setActiveSide: (side: EditorSide) => void;
  setActiveTab: (tab: EditorPanelTab) => void;
  setSelectedColor: (color: string) => void;
  setShirtColor: (color: string) => void;
  setTextDraft: (value: string) => void;
  setPendingImage: (file?: File) => void;
  setLayers: (layers: CanvasObjectSummary[]) => void;
  setSelectedObjectId: (id?: string) => void;
  setCanvasControls: (controls: CanvasControlApi) => void;
  setHistoryState: (payload: { canRedo: boolean; canUndo: boolean }) => void;
  setZoom: (zoom: number) => void;
};

const defaultCanvasControls: CanvasControlApi = {
  addImage: () => undefined,
  addText: () => undefined,
  deleteSelected: () => undefined,
  downloadPreview: () => undefined,
  exportDesign: () => undefined,
  importDesign: () => undefined,
  redo: () => undefined,
  resetView: () => undefined,
  shareDesign: () => undefined,
  undo: () => undefined,
  zoomIn: () => undefined,
  zoomOut: () => undefined,
};

const EditorStoreContext = createContext<EditorStoreValue | null>(null);

export const EditorStoreProvider = ({ children }: PropsWithChildren) => {
  const [editor, setEditor] = useState<FabricJSEditor>();
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const [activeSide, setActiveSide] = useState<EditorSide>("front");
  const [activeTab, setActiveTab] = useState<EditorPanelTab>("images");
  const [selectedColor, setSelectedColor] = useState("#1f2937");
  const [shirtColor, setShirtColor] = useState("#FFFFFF");
  const [textDraft, setTextDraft] = useState("");
  const [pendingImage, setPendingImage] = useState<File>();
  const [layers, setLayers] = useState<CanvasObjectSummary[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canvasControls, setCanvasControls] = useState<CanvasControlApi>(defaultCanvasControls);

  const setEditorInstance = useCallback(
    (payload: { editor?: FabricJSEditor; canvas?: fabric.Canvas }) => {
      setEditor(payload.editor);
      setCanvas(payload.canvas);
    },
    []
  );

  const setHistoryState = useCallback((payload: { canRedo: boolean; canUndo: boolean }) => {
    setCanUndo(payload.canUndo);
    setCanRedo(payload.canRedo);
  }, []);

  const value = useMemo<EditorStoreValue>(
    () => ({
      editor,
      canvas,
      activeSide,
      activeTab,
      selectedColor,
      shirtColor,
      textDraft,
      pendingImage,
      layers,
      selectedObjectId,
      canUndo,
      canRedo,
      zoom,
      canvasControls,
      setEditorInstance,
      setActiveSide,
      setActiveTab,
      setSelectedColor,
      setShirtColor,
      setTextDraft,
      setPendingImage,
      setLayers,
      setSelectedObjectId,
      setCanvasControls,
      setHistoryState,
      setZoom,
    }),
    [
      editor,
      canvas,
      activeSide,
      activeTab,
      selectedColor,
      shirtColor,
      textDraft,
      pendingImage,
      layers,
      selectedObjectId,
      canUndo,
      canRedo,
      zoom,
      canvasControls,
      setEditorInstance,
      setHistoryState,
    ]
  );

  return <EditorStoreContext.Provider value={value}>{children}</EditorStoreContext.Provider>;
};

export const useEditorStoreContext = () => {
  const context = useContext(EditorStoreContext);

  if (!context) {
    throw new Error("useEditorStoreContext must be used within EditorStoreProvider");
  }

  return context;
};
