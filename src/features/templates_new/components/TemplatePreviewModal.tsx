import { FiCheck, FiX, FiZap } from "react-icons/fi";
import { TEMPLATE_CATEGORY_LABELS, getTemplateLayers, TEMPLATE_BADGE_LABELS } from "../utils/templatePreview";
import type { TemplateDefinition } from "../types/template.types";
import { TemplateThumbnail } from "./TemplateCard";

export const TemplatePreviewModal = ({
  isApplying,
  onApply,
  onClose,
  template,
}: {
  isApplying: boolean;
  onApply: (template: TemplateDefinition) => void;
  onClose: () => void;
  template?: TemplateDefinition;
}) => {
  if (!template) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.28)] sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-slate-950">{template.name}</p>
            <p className="mt-1 text-sm text-slate-500">
              {TEMPLATE_CATEGORY_LABELS[template.category]} template
            </p>
          </div>
          <button
            aria-label="Close preview"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <FiX />
          </button>
        </div>

        <div className="rounded-[24px] bg-slate-50 p-4">
          <TemplateThumbnail className="mx-auto max-w-[320px]" template={template} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            {TEMPLATE_CATEGORY_LABELS[template.category]}
          </span>
          {template.badges?.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-700"
            >
              {TEMPLATE_BADGE_LABELS[badge]}
            </span>
          ))}
          {template.premium && (
            <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-violet-700">
              Premium
            </span>
          )}
        </div>

        {template.description && <p className="mt-4 text-sm leading-6 text-slate-600">{template.description}</p>}

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{getTemplateLayers(template).length} editable layers</span>
          <span>{template.tags.join(" • ")}</span>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isApplying}
            onClick={() => onApply(template)}
            type="button"
          >
            {isApplying ? <FiCheck /> : <FiZap />}
            {isApplying ? "Applying..." : "Use Template"}
          </button>
        </div>
      </div>
    </div>
  );
};
