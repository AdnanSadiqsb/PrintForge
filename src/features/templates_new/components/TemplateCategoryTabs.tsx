import { cn } from "../../../lib/utils";
import type { TemplateCategory } from "../types/template.types";
import { TEMPLATE_CATEGORY_LABELS } from "../utils/templatePreview";
import { TEMPLATE_FILTER_CATEGORIES } from "../hooks/useTemplateFilters";

export const TemplateCategoryTabs = ({
  activeCategory,
  onChange,
}: {
  activeCategory: TemplateCategory | "all";
  onChange: (value: TemplateCategory | "all") => void;
}) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {TEMPLATE_FILTER_CATEGORIES.map((category) => (
      <button
        key={category}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
          activeCategory === category
            ? "border-sky-200 bg-sky-50 text-slate-900 shadow-[0_8px_20px_rgba(14,165,233,0.12)]"
            : "border-slate-200/80 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
        )}
        onClick={() => onChange(category)}
        type="button"
      >
        {category === "all" ? "All" : TEMPLATE_CATEGORY_LABELS[category]}
      </button>
    ))}
  </div>
);
