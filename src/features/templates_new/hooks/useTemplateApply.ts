import { useCallback, useMemo, useState } from "react";
import type { FabricJSEditor } from "fabricjs-react";
import type { TemplateApplyMode, TemplateDefinition } from "../types/template.types";
import { applyTemplateToCanvas } from "../utils/templateToFabric";

export type TemplateApplyOption = {
  description: string;
  label: string;
  mode: TemplateApplyMode;
};

const TEMPLATE_APPLY_OPTIONS: TemplateApplyOption[] = [
  {
    label: "Add to current design",
    mode: "add",
    description: "Keeps the current artwork and places the template objects on the canvas.",
  },
  {
    label: "Replace current design",
    mode: "replace",
    description: "Clears the canvas first. Useful for a future confirm flow.",
  },
];

export const useTemplateApply = ({
  activeSide,
  editor,
  onApplied,
}: {
  activeSide: string;
  editor?: FabricJSEditor;
  onApplied?: (template: TemplateDefinition) => void;
}) => {
  const [appliedTemplateId, setAppliedTemplateId] = useState<string>();
  const [isApplying, setIsApplying] = useState(false);
  const [status, setStatus] = useState("");

  const applyTemplate = useCallback(
    async (template: TemplateDefinition, mode: TemplateApplyMode = "add") => {
      setIsApplying(true);

      try {
        await applyTemplateToCanvas({ activeSide, editor, mode, template });
        setAppliedTemplateId(template.id);
        setStatus(`Applied ${template.name} to the ${activeSide}.`);
        onApplied?.(template);
      } finally {
        setIsApplying(false);
      }
    },
    [activeSide, editor, onApplied]
  );

  const applyOptions = useMemo(() => TEMPLATE_APPLY_OPTIONS, []);

  return {
    appliedTemplateId,
    applyOptions,
    applyTemplate,
    isApplying,
    status,
  };
};
