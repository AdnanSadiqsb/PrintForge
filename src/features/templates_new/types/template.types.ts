import type { EditorSide } from "../../../types";

export type TemplateCategory = "summer" | "sports" | "college" | "event" | "minimal" | "trending";
export type TemplateApplyMode = "add" | "replace";
export type TemplateBadge = "new" | "popular" | "premium";
export type FillValue =
  | string
  | {
      type: "solid";
      color: string;
    }
  | {
      type: "linear-gradient";
      angle: number;
      stops: Array<{ offset: number; color: string; opacity?: number }>;
    }
  | {
      type: "radial-gradient";
      stops: Array<{ offset: number; color: string; opacity?: number }>;
    };

export type LayerShadow = {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity?: number;
};

export type StrokeStyle = {
  color: string;
  width: number;
  align?: "inside" | "center" | "outside";
  dashArray?: number[];
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "miter" | "round" | "bevel";
};

export type LayerFilter =
  | { type: "blur"; value: number }
  | { type: "brightness"; value: number }
  | { type: "contrast"; value: number }
  | { type: "grayscale"; value: number }
  | { type: "saturate"; value: number };

export type TemplateObjectType = "text" | "image" | "shape" | "group" | "vector";
export type TemplateShapeType = "rect" | "circle" | "ellipse" | "line" | "polygon" | "star" | "path";
export type TemplateTextShape = "straight" | "arc-up" | "arc-down" | "circle" | "wave";

export type TemplateEditableFlags = {
  allowDelete?: boolean;
  allowFill?: boolean;
  allowMove?: boolean;
  allowResize?: boolean;
  allowRotate?: boolean;
  allowTextEdit?: boolean;
};

export type TemplateCanvasMetadata = {
  height: number;
  printableHeight: number;
  printableWidth: number;
  width: number;
};

export type BaseLayer = {
  id: string;
  type: TemplateObjectType;
  name?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation?: number;
  angle?: number;
  opacity?: number;
  zIndex: number;
  visible?: boolean;
  locked?: boolean;
  editable?: boolean | TemplateEditableFlags;
  selectable?: boolean;
  groupId?: string;
  blendMode?: string;
  flipX?: boolean;
  flipY?: boolean;
  shadow?: LayerShadow | null;
  filters?: LayerFilter[];
  strokeStyle?: StrokeStyle | null;
  metadata?: Record<string, unknown>;
  originX?: "left" | "center" | "right";
  originY?: "top" | "center" | "bottom";
  placeholderKey?: string;
};

export type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  fill: FillValue;
  fontFamily: string;
  fontSize: number;
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  lineHeight?: number;
  charSpacing?: number;
  horizontalScale?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
  textShape?: TemplateTextShape;
  curvature?: number;
  warp?: {
    type: "none" | "arc" | "bulge" | "arch" | "flag" | "wave" | "rise" | "slant";
    amount: number;
    horizontal?: boolean;
  };
  stroke?: {
    color: string;
    width: number;
  } | null;
  innerStroke?: {
    color: string;
    width: number;
  } | null;
  outlineOnly?: boolean;
  underline?: boolean;
  letterCaseLocked?: boolean;
};

export type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  fit?: "contain" | "cover" | "fill";
  borderRadius?: number;
  crop?: {
    x: number;
    y: number;
    scale: number;
  };
  colorOverlay?: {
    color: string;
    opacity: number;
  } | null;
  monochrome?: boolean;
  tint?: string | null;
  clipPath?: string | null;
};

export type VectorLayer = BaseLayer & {
  type: "vector";
  src: string;
  colorOverrides?: Record<string, string>;
  monochrome?: boolean;
};

export type ShapeLayer = BaseLayer & {
  type: "shape";
  shapeType: TemplateShapeType;
  fill?: FillValue;
  stroke?: StrokeStyle | null;
  rx?: number;
  ry?: number;
  radius?: number;
  points?: number;
  innerRadius?: number;
  pathData?: string;
  cornerStyle?: "round" | "sharp";
};

export type GroupLayer = BaseLayer & {
  type: "group";
  childIds: string[];
};

export type EditorLayer = TextLayer | ImageLayer | VectorLayer | ShapeLayer | GroupLayer;
export type TemplateObject = EditorLayer;

export type ArtboardGuide = {
  id: string;
  type: "print-area" | "safe-area" | "center-line" | "bleed";
  left: number;
  top: number;
  width: number;
  height: number;
  stroke?: string;
  strokeDasharray?: number[];
  label?: string;
};

export type TemplateArtboard = {
  id: string;
  name: string;
  locationNumber?: number;
  width: number;
  height: number;
  printableWidth?: number;
  printableHeight?: number;
  offsetX?: number;
  offsetY?: number;
  scaleRatio?: number;
  background?: string;
  guidelines?: ArtboardGuide[];
  layers: EditorLayer[];
};

export type TemplatePlaceholder = {
  id: string;
  key: string;
  label: string;
  type: "text" | "image" | "color" | "font";
  targetLayerIds: string[];
  defaultValue?: string;
  editable?: boolean;
};

export type TemplateTokens = {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, number>;
  effects?: Record<string, unknown>;
};

export type TemplateMetadata = {
  source?: "manual" | "svg-import" | "figma-import";
  family?: string;
  variant?: string;
  styleTags?: string[];
  difficulty?: "simple" | "medium" | "advanced";
  supportsPersonalization?: boolean;
  supportsColorSwap?: boolean;
  supportsImageReplace?: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  version?: number;
  schemaVersion?: number;
};

export type TemplateDefinition = {
  id: string;
  version?: number;
  name: string;
  category: TemplateCategory;
  description?: string;
  tags: string[];
  badges?: TemplateBadge[];
  featured?: boolean;
  premium?: boolean;
  productContext?: {
    productId?: string;
    colorCode?: string;
    decorationMethod?: string;
  };
  sides?: TemplateArtboard[];
  side?: EditorSide | "both";
  thumbnail?: string;
  preview?: string;
  placeholders?: TemplatePlaceholder[];
  tokens?: TemplateTokens;
  metadata?: TemplateMetadata;
  canvasSize?: TemplateCanvasMetadata;
  layers?: EditorLayer[];
};

export type NormalizedTemplateDefinition = Omit<TemplateDefinition, "sides" | "layers" | "canvasSize" | "side"> & {
  canvasSize: TemplateCanvasMetadata;
  side: EditorSide | "both";
  sides: TemplateArtboard[];
  primaryArtboard: TemplateArtboard;
};

export type TemplateObjectData = {
  artboardId?: string;
  editorObjectId?: string;
  groupId?: string;
  isTemplateObject: true;
  placeholderKey?: string;
  quickEditKey?: string;
  templateId: string;
  templateName: string;
  templateObjectId: string;
  templateSide?: string;
};
