import type { fabric } from "fabric";
import type { FabricJSEditor } from "fabricjs-react";

export type EditorSide = "front" | "back";
export type EditorPanelTab = "product" | "templates" | "images" | "text" | "shapes" | "save" | "quote";

export type EditorObjectKind = "text" | "image" | "shape" | "vector" | "group" | "unknown";

export interface BaseCanvasObject {
  id: string;
  kind: EditorObjectKind;
  fabricType: string;
  name: string;
  fill?: string | null;
  isActive: boolean;
  isLocked?: boolean;
  isVisible?: boolean;
  groupId?: string;
}

export interface TextCanvasObject extends BaseCanvasObject {
  kind: "text";
  text: string;
}

export interface ImageCanvasObject extends BaseCanvasObject {
  kind: "image";
  src?: string;
}

export interface ShapeCanvasObject extends BaseCanvasObject {
  kind: "shape";
  shapeType?: string;
}

export type CanvasObjectSummary =
  | BaseCanvasObject
  | TextCanvasObject
  | ImageCanvasObject
  | ShapeCanvasObject;

export interface EditorState {
  editor?: FabricJSEditor;
  canvas?: fabric.Canvas;
  activeSide: EditorSide;
  activeTab: EditorPanelTab;
  selectedColor: string;
  shirtColor: string;
  textDraft: string;
  pendingImage?: File;
  layers: CanvasObjectSummary[];
  selectedObjectId?: string;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  canvasControls: CanvasControlApi;
}

export interface CanvasControlApi {
  addImage: (file?: File) => void;
  addText: (payload?: {
    text?: string;
    fill?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontStyle?: fabric.ITextOptions["fontStyle"];
  }) => void;
  deleteSelected: () => void;
  downloadPreview: () => void;
  exportDesign: () => void;
  importDesign: (file?: File) => void;
  redo: () => void;
  resetView: () => void;
  shareDesign: () => void;
  undo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export type EditorAction =
  | { type: "editor/set-active-side"; payload: { side: EditorSide } }
  | { type: "editor/set-active-tab"; payload: { tab: EditorPanelTab } }
  | { type: "editor/add-text"; payload: { text: string } }
  | { type: "editor/add-image"; payload: { file: File } }
  | { type: "editor/delete-selection" }
  | { type: "editor/download" }
  | { type: "editor/undo" }
  | { type: "editor/redo" }
  | { type: "editor/zoom-in" }
  | { type: "editor/zoom-out" }
  | { type: "editor/select-layer"; payload: { objectId: string } };
