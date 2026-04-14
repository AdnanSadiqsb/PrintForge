import type {
  EditorLayer,
  NormalizedTemplateDefinition,
  TemplateBadge,
  TemplateCategory,
  TemplateDefinition,
} from "../types/template.types";
import { getTemplateArtboardForSide, normalizeTemplate } from "./templateSchema";

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  summer: "Summer",
  sports: "Sports",
  college: "College",
  event: "Event",
  minimal: "Minimal",
  trending: "Trending",
};

export const TEMPLATE_BADGE_LABELS: Record<TemplateBadge, string> = {
  new: "New",
  popular: "Popular",
  premium: "Premium",
};

export const getTemplateSearchText = (template: TemplateDefinition | NormalizedTemplateDefinition) => {
  const normalized = normalizeTemplate(template);
  return [
    normalized.name,
    normalized.description,
    normalized.category,
    ...normalized.tags,
    ...Object.keys(normalized.tokens?.colors ?? {}),
    ...Object.keys(normalized.tokens?.fonts ?? {}),
    ...(normalized.placeholders ?? []).map((placeholder) => placeholder.key),
    ...normalized.metadata?.styleTags ?? [],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const getTemplateLayers = (template: TemplateDefinition | NormalizedTemplateDefinition, side?: string) =>
  getTemplateArtboardForSide(template, side).layers;

export const getTemplateObjectPreviewStyle = (object: EditorLayer, canvasSize: { width: number; height: number }) => {
  const scaleX = 100 / canvasSize.width;
  const scaleY = 100 / canvasSize.height;
  const width = object.width * scaleX;
  const height = object.height * scaleY;
  const left = object.left * scaleX;
  const top = object.top * scaleY;
  const translateX = object.originX === "left" ? 0 : object.originX === "right" ? -100 : -50;
  const translateY = object.originY === "top" ? 0 : object.originY === "bottom" ? -100 : -50;

  return {
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
    transform: `translate(${translateX}%, ${translateY}%) rotate(${object.rotation ?? object.angle ?? 0}deg)`,
    width: `${width}%`,
  };
};
