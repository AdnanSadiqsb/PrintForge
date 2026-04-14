import type {
  BaseLayer,
  EditorLayer,
  FillValue,
  GroupLayer,
  ImageLayer,
  NormalizedTemplateDefinition,
  ShapeLayer,
  TemplateArtboard,
  TemplateCanvasMetadata,
  TemplateDefinition,
  TemplatePlaceholder,
  TemplateTextShape,
  TextLayer,
  VectorLayer,
} from "../types/template.types";

const DEFAULT_CANVAS: TemplateCanvasMetadata = {
  width: 300,
  height: 370,
  printableWidth: 234,
  printableHeight: 288,
};

const DEFAULT_GUIDE_STROKE = "#94a3b8";

export const getSolidColor = (fill?: FillValue, fallback = "#111827") => {
  if (!fill) {
    return fallback;
  }

  if (typeof fill === "string") {
    return fill;
  }

  if (fill.type === "solid") {
    return fill.color;
  }

  const firstStop = fill.stops.find((stop) => stop.color);
  return firstStop?.color ?? fallback;
};

export const normalizeTextShape = (
  textShape?: TemplateTextShape,
  warpType?: string
): "straight" | "arc-up" | "arc-down" => {
  if (textShape === "arc-down") {
    return "arc-down";
  }

  if (textShape === "arc-up") {
    return "arc-up";
  }

  if (warpType === "arc" || textShape === "circle" || textShape === "wave") {
    return "arc-up";
  }

  return "straight";
};

const normalizeBaseLayer = (layer: EditorLayer, index: number): BaseLayer => ({
  ...layer,
  angle: layer.angle ?? layer.rotation ?? 0,
  editable: layer.editable ?? true,
  flipX: layer.flipX ?? false,
  flipY: layer.flipY ?? false,
  height: layer.height ?? 0,
  left: layer.left ?? 0,
  opacity: layer.opacity ?? 1,
  originX: layer.originX ?? "center",
  originY: layer.originY ?? "center",
  rotation: layer.rotation ?? layer.angle ?? 0,
  selectable: layer.selectable ?? true,
  top: layer.top ?? 0,
  visible: layer.visible ?? true,
  width: layer.width ?? 0,
  zIndex: layer.zIndex ?? index + 1,
});

export const normalizeLayer = (layer: EditorLayer, index: number): EditorLayer => {
  const base = normalizeBaseLayer(layer, index);

  if (layer.type === "text") {
    const nextLayer: TextLayer = {
      ...layer,
      ...base,
      type: "text",
      fill: layer.fill ?? "#111827",
      fontFamily: layer.fontFamily ?? "Inter",
      fontSize: layer.fontSize ?? 36,
      horizontalScale: layer.horizontalScale ?? 1,
      lineHeight: layer.lineHeight ?? 1.1,
      textAlign: layer.textAlign ?? "center",
      textShape: normalizeTextShape(layer.textShape, layer.warp?.type),
      verticalAlign: layer.verticalAlign ?? "middle",
      warp: layer.warp ?? { type: "none", amount: 0, horizontal: true },
    };
    return nextLayer;
  }

  if (layer.type === "image") {
    const nextLayer: ImageLayer = {
      ...layer,
      ...base,
      type: "image",
      borderRadius: layer.borderRadius ?? 0,
      fit: layer.fit ?? "contain",
    };
    return nextLayer;
  }

  if (layer.type === "vector") {
    const nextLayer: VectorLayer = {
      ...layer,
      ...base,
      type: "vector",
      colorOverrides: layer.colorOverrides ?? {},
    };
    return nextLayer;
  }

  if (layer.type === "group") {
    const nextLayer: GroupLayer = {
      ...layer,
      ...base,
      type: "group",
      childIds: layer.childIds ?? [],
    };
    return nextLayer;
  }

  const shapeLayer: ShapeLayer = {
    ...layer,
    ...base,
    type: "shape",
    fill: layer.fill ?? "#38bdf8",
    points: layer.points ?? (layer.shapeType === "star" ? 5 : layer.shapeType === "polygon" ? 6 : undefined),
    stroke: layer.stroke ?? layer.strokeStyle ?? null,
  };

  return shapeLayer;
};

export const normalizeArtboard = (
  artboard: TemplateArtboard,
  fallbackName: string,
  index: number
): TemplateArtboard => ({
  ...artboard,
  background: artboard.background ?? "transparent",
  guidelines:
    artboard.guidelines?.map((guide) => ({
      ...guide,
      stroke: guide.stroke ?? DEFAULT_GUIDE_STROKE,
    })) ?? [],
  id: artboard.id || `${fallbackName}-${index + 1}`,
  layers: (artboard.layers ?? []).map((layer, layerIndex) => normalizeLayer(layer, layerIndex)),
  name: artboard.name || fallbackName,
  offsetX: artboard.offsetX ?? 0,
  offsetY: artboard.offsetY ?? 0,
  printableHeight: artboard.printableHeight ?? artboard.height,
  printableWidth: artboard.printableWidth ?? artboard.width,
  scaleRatio: artboard.scaleRatio ?? 1,
});

const createLegacyArtboard = (template: TemplateDefinition): TemplateArtboard => {
  const canvasSize = template.canvasSize ?? DEFAULT_CANVAS;
  const templateSide = template.side === "back" ? "back" : "front";

  return normalizeArtboard(
    {
      id: `${template.id}-${templateSide}`,
      name: templateSide,
      width: canvasSize.width,
      height: canvasSize.height,
      printableWidth: canvasSize.printableWidth,
      printableHeight: canvasSize.printableHeight,
      guidelines: [
        {
          id: `${template.id}-${templateSide}-print-area`,
          type: "print-area",
          left: (canvasSize.width - canvasSize.printableWidth) / 2,
          top: (canvasSize.height - canvasSize.printableHeight) / 2,
          width: canvasSize.printableWidth,
          height: canvasSize.printableHeight,
          label: "Print Area",
        },
      ],
      layers: template.layers ?? [],
    },
    templateSide,
    0
  );
};

const buildDefaultPlaceholders = (artboards: TemplateArtboard[]): TemplatePlaceholder[] => {
  const byKey = new Map<string, TemplatePlaceholder>();

  artboards.forEach((artboard) => {
    artboard.layers.forEach((layer) => {
      if (!layer.placeholderKey) {
        return;
      }

      const existing = byKey.get(layer.placeholderKey);
      const type = layer.type === "image" || layer.type === "vector" ? "image" : layer.type === "text" ? "text" : "color";
      const defaultValue =
        layer.type === "text"
          ? layer.text
          : layer.type === "image" || layer.type === "vector"
            ? layer.src
            : getSolidColor("fill" in layer ? layer.fill : undefined, "");

      if (existing) {
        existing.targetLayerIds.push(layer.id);
        return;
      }

      byKey.set(layer.placeholderKey, {
        id: `placeholder-${layer.placeholderKey}`,
        key: layer.placeholderKey,
        label: layer.name ?? layer.placeholderKey.replace(/[-_]/g, " "),
        type,
        targetLayerIds: [layer.id],
        defaultValue,
        editable: true,
      });
    });
  });

  return Array.from(byKey.values());
};

export const normalizeTemplate = (template: TemplateDefinition): NormalizedTemplateDefinition => {
  const sides = (template.sides?.length ? template.sides : [createLegacyArtboard(template)]).map((artboard, index) =>
    normalizeArtboard(
      artboard,
      index === 0 ? template.side === "back" ? "back" : "front" : `side-${index + 1}`,
      index
    )
  );

  const primaryArtboard = sides[0];
  const canvasSize: TemplateCanvasMetadata = {
    width: primaryArtboard.width,
    height: primaryArtboard.height,
    printableWidth: primaryArtboard.printableWidth ?? primaryArtboard.width,
    printableHeight: primaryArtboard.printableHeight ?? primaryArtboard.height,
  };

  return {
    ...template,
    canvasSize,
    placeholders: template.placeholders?.length ? template.placeholders : buildDefaultPlaceholders(sides),
    primaryArtboard,
    side: template.side ?? (primaryArtboard.name === "back" ? "back" : "front"),
    sides,
    thumbnail: template.thumbnail ?? "",
    tokens: template.tokens ?? {},
    version: template.version ?? 1,
  };
};

export const getTemplateArtboardForSide = (
  template: TemplateDefinition | NormalizedTemplateDefinition,
  side?: string
) => {
  const normalized = "primaryArtboard" in template ? template : normalizeTemplate(template);
  if (!side) {
    return normalized.primaryArtboard;
  }

  return (
    normalized.sides.find((artboard) => artboard.name === side) ??
    normalized.sides.find((artboard) => artboard.id === side) ??
    normalized.primaryArtboard
  );
};

export const getAllTemplateLayers = (template: TemplateDefinition | NormalizedTemplateDefinition) => {
  const normalized = "primaryArtboard" in template ? template : normalizeTemplate(template);
  return normalized.sides.flatMap((artboard) => artboard.layers);
};
