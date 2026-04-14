import { useMemo, useState } from "react";
import type { EditorSide } from "../../../types";
import type { NormalizedTemplateDefinition, TemplateCategory } from "../types/template.types";
import { getTemplateSearchText } from "../utils/templatePreview";

export const TEMPLATE_FILTER_CATEGORIES: Array<TemplateCategory | "all"> = [
  "all",
  "summer",
  "sports",
  "college",
  "event",
  "minimal",
  "trending",
];

export const useTemplateFilters = ({
  activeSide,
  normalizedSearch,
  templates,
}: {
  activeSide: EditorSide;
  normalizedSearch: string;
  templates: NormalizedTemplateDefinition[];
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");

  const sideTemplates = useMemo(
    () =>
      templates.filter(
        (template) =>
          template.side === "both" ||
          template.side === activeSide ||
          template.sides.some((artboard) => artboard.name === activeSide)
      ),
    [activeSide, templates]
  );

  const filteredTemplates = useMemo(
    () =>
      sideTemplates.filter((template) => {
        const matchesCategory = activeCategory === "all" || template.category === activeCategory;
        const matchesSearch = !normalizedSearch || getTemplateSearchText(template).includes(normalizedSearch);
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, normalizedSearch, sideTemplates]
  );

  const featuredTemplates = useMemo(
    () => filteredTemplates.filter((template) => template.featured),
    [filteredTemplates]
  );

  const regularTemplates = useMemo(
    () => filteredTemplates.filter((template) => !template.featured),
    [filteredTemplates]
  );

  return {
    activeCategory,
    featuredTemplates,
    filteredTemplates,
    regularTemplates,
    setActiveCategory,
    sideTemplates,
  };
};
