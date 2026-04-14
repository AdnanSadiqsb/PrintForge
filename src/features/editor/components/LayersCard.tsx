import { FiCopy, FiEye, FiEyeOff, FiLock, FiMove, FiTrash2, FiUnlock } from "react-icons/fi";
import { Card } from "../../../components/ui";
import { useEditorStore } from "../../../hooks";
import { cn } from "../../../lib/utils";
import {
  duplicateSelectedObject,
  reorderSelectedObject,
  selectLayerById,
  toggleSelectedObjectLock,
  toggleSelectedObjectVisibility,
} from "../lib/editorActions";

export const LayersCard = () => {
  const { editor, layers, selectedObjectId, canvasControls } = useEditorStore();

  return (
    <Card description="Select a layer to focus it on the shirt." title="Current Design">
      <div className="space-y-2">
        {layers.length === 0 ? (
          <p className="text-sm text-slate-500">Your canvas is empty. Add text or upload artwork to begin.</p>
        ) : (
          layers
            .slice()
            .reverse()
            .map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border px-3 py-2 transition",
                  selectedObjectId === layer.id
                    ? "border-sky-200 bg-sky-50/70 text-sky-700"
                    : "border-slate-200/80 bg-slate-50/60 text-slate-700 hover:border-slate-300"
                )}
              >
                <button className="flex min-w-0 flex-1 items-center justify-between text-left" onClick={() => selectLayerById(editor, layer.id)} type="button">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 truncate text-sm font-medium">
                      {layer.groupId && <FiMove className="shrink-0 text-xs text-slate-400" />}
                      <span className="truncate">{layer.name}</span>
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {layer.kind}
                      {layer.groupId ? ` • ${layer.groupId}` : ""}
                    </span>
                  </span>
                </button>
                <button
                  aria-label={layer.isVisible === false ? `Show ${layer.name}` : `Hide ${layer.name}`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                  onClick={() => {
                    selectLayerById(editor, layer.id);
                    requestAnimationFrame(() => {
                      toggleSelectedObjectVisibility(editor, layer.isVisible === false);
                    });
                  }}
                  type="button"
                >
                  {layer.isVisible === false ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
                <button
                  aria-label={layer.isLocked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                  onClick={() => {
                    selectLayerById(editor, layer.id);
                    requestAnimationFrame(() => {
                      toggleSelectedObjectLock(editor, !layer.isLocked);
                    });
                  }}
                  type="button"
                >
                  {layer.isLocked ? <FiLock className="text-sm" /> : <FiUnlock className="text-sm" />}
                </button>
                <button
                  aria-label={`Duplicate ${layer.name}`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                  onClick={() => {
                    selectLayerById(editor, layer.id);
                    requestAnimationFrame(() => {
                      duplicateSelectedObject({ editor });
                    });
                  }}
                  type="button"
                >
                  <FiCopy className="text-sm" />
                </button>
                <button
                  aria-label={`Bring ${layer.name} forward`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                  onClick={() => {
                    selectLayerById(editor, layer.id);
                    requestAnimationFrame(() => {
                      reorderSelectedObject(editor, "forward");
                    });
                  }}
                  type="button"
                >
                  <FiMove className="text-sm" />
                </button>
                <button
                  aria-label={`Delete ${layer.name}`}
                  className={cn(
                    "rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600",
                    selectedObjectId === layer.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={() => {
                    selectLayerById(editor, layer.id);
                    requestAnimationFrame(() => {
                      canvasControls.deleteSelected();
                    });
                  }}
                  type="button"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            ))
        )}
      </div>
    </Card>
  );
};
