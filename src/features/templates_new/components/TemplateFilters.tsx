import { TEMPLATE_CATEGORY_LABELS } from "../utils/templatePreview";
import type { TemplateCategory } from "../types/template.types";
import { cn } from "../../../lib/utils";

const categories: Array<TemplateCategory | "all"> = ["all", "summer", "sports", "college", "event"];

export const TemplateFilters = ({
  activeCategory,
  onCategoryChange,
  onSearchChange,
  search,
}: {
  activeCategory: TemplateCategory | "all";
  onCategoryChange: (value: TemplateCategory | "all") => void;
  onSearchChange: (value: string) => void;
  search: string;
}) => (
  <div className="space-y-3">
    <label className="block">
      <span className="sr-only">Search templates</span>
      <input
        className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search templates, tags, or styles"
        type="search"
        value={search}
      />
    </label>

    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            activeCategory === category
              ? "border-sky-200 bg-sky-50 text-slate-900"
              : "border-slate-200/80 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
          )}
          onClick={() => onCategoryChange(category)}
          type="button"
        >
          {category === "all" ? "All" : TEMPLATE_CATEGORY_LABELS[category]}
        </button>
      ))}
    </div>
  </div>
);
