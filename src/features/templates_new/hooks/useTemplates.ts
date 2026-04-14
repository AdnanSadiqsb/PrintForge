import { useMemo } from "react";
import type { EditorSide } from "../../../types";
import { MOCK_TEMPLATES } from "../data/mockTemplates";
import { useTemplateFilters } from "./useTemplateFilters";
import { useTemplateSearch } from "./useTemplateSearch";
import { normalizeTemplate } from "../utils/templateSchema";

export const useTemplates = ({ activeSide }: { activeSide: EditorSide }) => {
  const { normalizedSearch, search, setSearch } = useTemplateSearch();
  const allTemplates = useMemo(() => MOCK_TEMPLATES.map((template) => normalizeTemplate(template)), []);
  const {
    activeCategory,
    featuredTemplates,
    filteredTemplates,
    regularTemplates,
    setActiveCategory,
    sideTemplates,
  } = useTemplateFilters({
    activeSide,
    normalizedSearch,
    templates: allTemplates,
  });

  return {
    activeCategory,
    allTemplates,
    featuredTemplates,
    filteredTemplates,
    isLoading: false,
    regularTemplates,
    search,
    setActiveCategory,
    setSearch,
    sideTemplates,
  };
};
