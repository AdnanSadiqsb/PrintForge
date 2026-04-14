import { FiBox, FiHexagon, FiImage, FiLayout, FiSave, FiShoppingBag, FiType } from "react-icons/fi";
import type { EditorPanelTab } from "../../../types";
import { cn } from "../../../lib/utils";

const tabs: Array<{ icon: JSX.Element; label: string; value: EditorPanelTab }> = [
  { icon: <FiBox className="text-sm" />, label: "Product", value: "product" },
  { icon: <FiLayout className="text-sm" />, label: "Templates", value: "templates" },
  { icon: <FiImage className="text-sm" />, label: "Add Images", value: "images" },
  { icon: <FiType className="text-sm" />, label: "Add Text", value: "text" },
  { icon: <FiHexagon className="text-sm" />, label: "Shapes", value: "shapes" },
  { icon: <FiSave className="text-sm" />, label: "Save / Load", value: "save" },
  { icon: <FiShoppingBag className="text-sm" />, label: "Quote / Buy", value: "quote" },
];

type TopActionTabsProps = {
  activeTab: EditorPanelTab;
  onChange: (tab: EditorPanelTab) => void;
};

export const TopActionTabs = ({ activeTab, onChange }: TopActionTabsProps) => (
  <div className="flex min-w-fit flex-wrap items-center gap-2 overflow-x-auto whitespace-nowrap">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        className={cn(
          "inline-flex h-8 items-center justify-center gap-2 rounded-xl border px-3 text-[12px] font-medium transition",
          activeTab === tab.value
            ? "border-sky-200 bg-sky-50/90 text-slate-900 shadow-[0_4px_12px_rgba(56,189,248,0.08)]"
            : "border-slate-200/80 bg-white/75 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        )}
        onClick={() => onChange(tab.value)}
        type="button"
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);
