import { fabric } from "fabric";
import type { FillValue, LayerFilter, LayerShadow, StrokeStyle } from "../types/template.types";

const applyOpacity = (hex: string, opacity = 1) => {
  const normalized = hex.trim();
  if (!normalized.startsWith("#") || (normalized.length !== 7 && normalized.length !== 4)) {
    return normalized;
  }

  const value =
    normalized.length === 4
      ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
      : normalized;

  const alpha = Math.max(0, Math.min(255, Math.round(opacity * 255)))
    .toString(16)
    .padStart(2, "0");

  return `${value}${alpha}`;
};

export const toCssFill = (fill?: FillValue, fallback = "transparent") => {
  if (!fill) {
    return fallback;
  }

  if (typeof fill === "string") {
    return fill;
  }

  if (fill.type === "solid") {
    return fill.color;
  }

  if (fill.type === "linear-gradient") {
    const stops = fill.stops
      .map((stop) => `${applyOpacity(stop.color, stop.opacity ?? 1)} ${Math.round(stop.offset * 100)}%`)
      .join(", ");
    return `linear-gradient(${fill.angle}deg, ${stops})`;
  }

  const stops = fill.stops
    .map((stop) => `${applyOpacity(stop.color, stop.opacity ?? 1)} ${Math.round(stop.offset * 100)}%`)
    .join(", ");
  return `radial-gradient(circle, ${stops})`;
};

export const toFabricFill = (
  fill: FillValue | undefined,
  width: number,
  height: number
): string | fabric.Gradient | undefined => {
  if (!fill) {
    return undefined;
  }

  if (typeof fill === "string") {
    return fill;
  }

  if (fill.type === "solid") {
    return fill.color;
  }

  const colorStops = fill.stops.map((stop) => ({
    color: applyOpacity(stop.color, stop.opacity ?? 1),
    offset: stop.offset,
  }));

  if (fill.type === "linear-gradient") {
    const radians = ((fill.angle ?? 0) * Math.PI) / 180;
    const x = Math.cos(radians);
    const y = Math.sin(radians);

    return new fabric.Gradient({
      type: "linear",
      coords: {
        x1: width * (0.5 - x / 2),
        y1: height * (0.5 - y / 2),
        x2: width * (0.5 + x / 2),
        y2: height * (0.5 + y / 2),
      },
      colorStops,
    });
  }

  return new fabric.Gradient({
    type: "radial",
    coords: {
      x1: width / 2,
      y1: height / 2,
      r1: 0,
      x2: width / 2,
      y2: height / 2,
      r2: Math.max(width, height) / 2,
    },
    colorStops,
  });
};

export const toFabricShadow = (shadow?: LayerShadow | null) => {
  if (!shadow) {
    return undefined;
  }

  return new fabric.Shadow({
    color: applyOpacity(shadow.color, shadow.opacity ?? 1),
    blur: shadow.blur,
    offsetX: shadow.offsetX,
    offsetY: shadow.offsetY,
  });
};

export const applyFabricStroke = (
  object: fabric.Object,
  stroke: StrokeStyle | undefined | null,
  scaleX = 1,
  scaleY = 1
) => {
  if (!stroke) {
    object.set({
      stroke: undefined,
      strokeDashArray: undefined,
      strokeLineCap: undefined,
      strokeLineJoin: undefined,
      strokeWidth: 0,
    });
    return;
  }

  object.set({
    stroke: stroke.color,
    strokeDashArray: stroke.dashArray?.map((value, index) =>
      value * (index % 2 === 0 ? Math.max(scaleX, 1) : Math.max(scaleY, 1))
    ),
    strokeLineCap: stroke.lineCap ?? "round",
    strokeLineJoin: stroke.lineJoin ?? "round",
    strokeUniform: true,
    strokeWidth: stroke.width * Math.max(Math.min(scaleX, scaleY), 1),
  });
};

export const buildImageFilters = (filters?: LayerFilter[], monochrome?: boolean, tint?: string | null) => {
  const nextFilters: fabric.IBaseFilter[] = [];

  filters?.forEach((filter) => {
    if (filter.type === "blur" && filter.value > 0) {
      nextFilters.push(new fabric.Image.filters.Blur({ blur: filter.value }));
    }
    if (filter.type === "brightness" && filter.value !== 0) {
      nextFilters.push(new fabric.Image.filters.Brightness({ brightness: filter.value }));
    }
    if (filter.type === "contrast" && filter.value !== 0) {
      nextFilters.push(new fabric.Image.filters.Contrast({ contrast: filter.value }));
    }
    if (filter.type === "grayscale" && filter.value > 0) {
      nextFilters.push(new fabric.Image.filters.Grayscale());
    }
    if (filter.type === "saturate" && filter.value !== 0) {
      nextFilters.push(new fabric.Image.filters.Saturation({ saturation: filter.value }));
    }
  });

  if (monochrome) {
    nextFilters.push(new fabric.Image.filters.Grayscale());
  }

  if (tint) {
    nextFilters.push(
      new fabric.Image.filters.BlendColor({
        alpha: 0.5,
        color: tint,
        mode: "tint",
      })
    );
  }

  return nextFilters;
};

export const toCssShadow = (shadow?: LayerShadow | null) => {
  if (!shadow) {
    return undefined;
  }

  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${applyOpacity(shadow.color, shadow.opacity ?? 1)}`;
};
