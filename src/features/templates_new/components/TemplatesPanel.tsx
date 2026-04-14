import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit3, FiLayers } from "react-icons/fi";
import { Card } from "../../../components/ui";
import { useEditorStore } from "../../../hooks";
import { selectLayerById } from "../../editor/lib/editorActions";
import { updateSelectedTemplateObject } from "../utils/templateToFabric";
import { TemplateCategoryTabs } from "./TemplateCategoryTabs";
import { TemplateGrid } from "./TemplateGrid";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { TemplateSearchBar } from "./TemplateSearchBar";
import { useTemplateApply } from "../hooks/useTemplateApply";
import { useTemplates } from "../hooks/useTemplates";
import type { TemplateDefinition } from "../types/template.types";
import { normalizeTemplate } from "../utils/templateSchema";

type SelectedTemplateObjectState = {
  fill?: string;
  isTemplateObject: boolean;
  name: string;
  placeholderKey?: string;
  templateId?: string;
  text?: string;
  type: string;
};

const getSelectedTemplateObjectState = (
  canvas: ReturnType<typeof useEditorStore>["canvas"]
): SelectedTemplateObjectState | undefined => {
  const active = canvas?.getActiveObject() as
    | {
        data?: Record<string, unknown>;
        fill?: unknown;
        text?: unknown;
        type?: string;
      }
    | undefined;

  if (!active || active.data?.isTemplateObject !== true) {
    return undefined;
  }

  return {
    fill: typeof active.fill === "string" ? active.fill : undefined,
    isTemplateObject: true,
    name:
      (typeof active.data?.objectLabel === "string" && active.data.objectLabel) ||
      (typeof active.data?.templateObjectId === "string" && active.data.templateObjectId) ||
      "Template object",
    placeholderKey: typeof active.data?.placeholderKey === "string" ? active.data.placeholderKey : undefined,
    templateId: typeof active.data?.templateId === "string" ? active.data.templateId : undefined,
    text: typeof active.text === "string" ? active.text : undefined,
    type: active.type ?? "object",
  };
};

export const TemplatesPanel = () => {
  const { activeSide, canvas, editor, layers, setActiveTab } = useEditorStore();
  const { activeCategory, featuredTemplates, isLoading, regularTemplates, search, setActiveCategory, setSearch } = useTemplates({
    activeSide,
  });
  const [selectedTemplateObject, setSelectedTemplateObject] = useState<SelectedTemplateObjectState>();
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition>();
  const { appliedTemplateId, applyTemplate, isApplying, status } = useTemplateApply({
    activeSide,
    editor,
    onApplied: () => setSelectedTemplateObject(getSelectedTemplateObjectState(editor?.canvas)),
  });

  const syncSelectedTemplateObject = useCallback(() => {
    setSelectedTemplateObject(getSelectedTemplateObjectState(canvas));
  }, [canvas]);

  useEffect(() => {
    if (!canvas) {
      setSelectedTemplateObject(undefined);
      return;
    }

    syncSelectedTemplateObject();
    canvas.on("selection:created", syncSelectedTemplateObject);
    canvas.on("selection:updated", syncSelectedTemplateObject);
    canvas.on("selection:cleared", syncSelectedTemplateObject);
    canvas.on("object:modified", syncSelectedTemplateObject);

    return () => {
      canvas.off("selection:created", syncSelectedTemplateObject);
      canvas.off("selection:updated", syncSelectedTemplateObject);
      canvas.off("selection:cleared", syncSelectedTemplateObject);
      canvas.off("object:modified", syncSelectedTemplateObject);
    };
  }, [canvas, syncSelectedTemplateObject]);

  const currentTemplateId = useMemo(
    () => selectedTemplateObject?.templateId ?? appliedTemplateId,
    [appliedTemplateId, selectedTemplateObject?.templateId]
  );

  const handleApplyTemplate = useCallback(
    async (template: TemplateDefinition) => {
      await applyTemplate(template);
      setPreviewTemplate(undefined);
    },
    [applyTemplate]
  );

  const normalizedPreview = useMemo(
    () => (previewTemplate ? normalizeTemplate(previewTemplate) : undefined),
    [previewTemplate]
  );
  const quickPlaceholders = (normalizedPreview?.placeholders ?? []).filter((placeholder) => placeholder.editable !== false);

  return (
    <>
      <Card className="border-none bg-slate-50/60 shadow-none" description="" title="">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Template Library</p>

            </div>
            <TemplateSearchBar onChange={setSearch} value={search} />
            <TemplateCategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />
          </div>

          {status && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {status}
            </div>
          )}

 

          {featuredTemplates.length > 0 && (
            <section className="space-y-3">
              {/* <div className="flex items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <FiStar />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Featured</p>
                  <p className="text-xs text-slate-500">A quick shortlist of the most visual starting points.</p>
                </div>
              </div> */}
              <TemplateGrid
                appliedTemplateId={currentTemplateId}
                isLoading={isLoading}
                onApply={handleApplyTemplate}
                onPreview={setPreviewTemplate}
                templates={featuredTemplates}
              />
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">All templates</p>
                <p className="text-xs text-slate-500">Image-first cards with quick apply and preview.</p>
              </div>
            </div>
            <TemplateGrid
              appliedTemplateId={currentTemplateId}
              emptyMessage="No templates match this filter yet."
              isLoading={isLoading}
              onApply={handleApplyTemplate}
              onPreview={setPreviewTemplate}
              templates={regularTemplates}
            />
          </section>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-4">
            <div className="flex items-center gap-2">
              <FiLayers className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">Selected Template Item</p>
            </div>

            {!selectedTemplateObject?.isTemplateObject ? (
              <p className="mt-3 text-sm text-slate-500">Select a template layer on the canvas to inspect and edit its placeholder metadata.</p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  <p className="font-medium text-slate-700">{selectedTemplateObject.name}</p>
                  <p className="mt-1 uppercase tracking-[0.16em]">{selectedTemplateObject.type}</p>
                  {selectedTemplateObject.placeholderKey && <p className="mt-1">Placeholder: {selectedTemplateObject.placeholderKey}</p>}
                </div>

                {typeof selectedTemplateObject.text === "string" && (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-500">Text</span>
                    <textarea
                      className="min-h-[72px] w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                      onChange={(event) => {
                        const value = event.target.value;
                        updateSelectedTemplateObject(editor, { text: value });
                        setSelectedTemplateObject((current) => (current ? { ...current, text: value } : current));
                      }}
                      value={selectedTemplateObject.text}
                    />
                  </label>
                )}

                {selectedTemplateObject.fill && (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-500">Fill</span>
                    <div className="grid grid-cols-[72px_1fr] gap-3">
                      <input
                        className="h-11 w-full rounded-xl border border-slate-200/80 bg-white p-1"
                        onChange={(event) => {
                          const value = event.target.value;
                          updateSelectedTemplateObject(editor, { fill: value });
                          setSelectedTemplateObject((current) => (current ? { ...current, fill: value } : current));
                        }}
                        type="color"
                        value={selectedTemplateObject.fill}
                      />
                      <input
                        className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                        onChange={(event) => {
                          const value = event.target.value;
                          updateSelectedTemplateObject(editor, { fill: value });
                          setSelectedTemplateObject((current) => (current ? { ...current, fill: value } : current));
                        }}
                        value={selectedTemplateObject.fill}
                      />
                    </div>
                  </label>
                )}

                {selectedTemplateObject.type === "image" && (
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                    onClick={() => setActiveTab("images")}
                    type="button"
                  >
                    <FiEdit3 />
                    Open image controls
                  </button>
                )}
              </div>
            )}
          </div>

          {quickPlaceholders.length > 0 && (
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-4">
              <div className="flex items-center gap-2">
                <FiEdit3 className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-900">Quick Edit Fields</p>
              </div>
              <div className="mt-3 space-y-3">
                {quickPlaceholders.map((placeholder) => (
                  <label key={placeholder.id} className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-500">{placeholder.label}</span>
                    <input
                      className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                      defaultValue={placeholder.defaultValue ?? ""}
                      onChange={(event) => {
                        const targetLayer = layers.find((layer) => layer.name.toLowerCase().includes(placeholder.key.toLowerCase()));
                        if (!targetLayer) {
                          return;
                        }
                        selectLayerById(editor, targetLayer.id);
                        requestAnimationFrame(() => {
                          updateSelectedTemplateObject(editor, {
                            ...(placeholder.type === "text" ? { text: event.target.value } : {}),
                            ...(placeholder.type === "color" ? { fill: event.target.value } : {}),
                          });
                        });
                      }}
                      type={placeholder.type === "color" ? "color" : "text"}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <TemplatePreviewModal
        isApplying={isApplying}
        onApply={handleApplyTemplate}
        onClose={() => setPreviewTemplate(undefined)}
        template={normalizedPreview}
      />
    </>
  );
};
