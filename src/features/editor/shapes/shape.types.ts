export type EditorShapeType =
  | "rect"
  | "circle"
  | "ellipse"
  | "line"
  | "star"
  | "polygon"
  | "path"
  | "rounded-rect"
  | "triangle";

export type ShapeDashStyle = "solid" | "dashed";

export type ShapeObjectData = {
  aspectRatioLocked?: boolean;
  dashStyle?: ShapeDashStyle;
  innerRadius?: number;
  isTemplateObject?: boolean;
  objectLabel?: string;
  outerRadius?: number;
  pathData?: string;
  placeholderKey?: string;
  pointsCount?: number;
  shapeType?: EditorShapeType;
  starPoints?: number;
  templateId?: string;
  templateName?: string;
  templateObjectId?: string;
};

export type ShapeEditorState = {
  dashStyle: ShapeDashStyle;
  displayedHeight: number;
  displayedWidth: number;
  fill: string;
  flipX: boolean;
  flipY: boolean;
  hasShape: boolean;
  isAspectLocked: boolean;
  left: number;
  opacity: number;
  radius: number;
  rotation: number;
  rx: number;
  ry: number;
  shapeType: EditorShapeType;
  starPoints: number;
  stroke: string;
  strokeWidth: number;
  top: number;
};

export type ShapeInsertOption = {
  description: string;
  label: string;
  shapeType: EditorShapeType;
};
