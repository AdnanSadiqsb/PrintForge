import type { TemplateDefinition } from "../types/template.types";
import { TemplateCard } from "./TemplateCard";

const TemplateGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-3">
        <div className="aspect-[4/5] animate-pulse rounded-[20px] bg-slate-100" />
        <div className="mt-3 h-4 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-slate-100" />
      </div>
    ))}
  </div>
);

export const TemplateGrid = ({
  appliedTemplateId,
  emptyMessage,
  isLoading,
  onApply,
  onPreview,
  templates,
}: {
  appliedTemplateId?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  onApply: (template: TemplateDefinition) => void;
  onPreview?: (template: TemplateDefinition) => void;
  templates: TemplateDefinition[];
}) => {
  if (isLoading) {
    return <TemplateGridSkeleton />;
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
        <p className="text-sm font-medium text-slate-800">{emptyMessage ?? "No templates match that search yet."}</p>
        <p className="mt-1 text-xs text-slate-400">Try a different category or search phrase.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          isApplied={appliedTemplateId === template.id}
          onApply={onApply}
          onPreview={onPreview}
          template={template}
        />
      ))}
    </div>
  );
};
