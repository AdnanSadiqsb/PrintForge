import { FiDownload, FiSave, FiShoppingBag, FiUploadCloud } from "react-icons/fi";
import { Button, Card } from "../../../components/ui";
import { useEditorStore } from "../../../hooks";
import { LayersCard } from "./LayersCard";
import { TopActionTabs } from "./TopActionTabs";
import { TextTool } from "../text/TextTool";
import { ImageTool } from "../image/ImageTool";
import { TemplatesPanel } from "../../templates_new/components/TemplatesPanel";
import { ShapeTool } from "../shapes/ShapeTool";

const shirtSwatches = ["#FFFFFF", "#0F172A", "#1D4ED8", "#E5E7EB"];

const ToolsSidebarHeader = ({
  activeTab,
  onChange,
}: {
  activeTab: ReturnType<typeof useEditorStore>["activeTab"];
  onChange: ReturnType<typeof useEditorStore>["setActiveTab"];
}) => (
  <div className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/88 px-1 py-3 backdrop-blur-sm xl:px-5">
    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
      {/* <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-sky-600/70">Tools Sidebar</p>
      <div className="h-4 w-px shrink-0 bg-slate-200/80" />
      <h2 className="shrink-0 text-[16px] font-medium tracking-[-0.02em] text-slate-900">Design Controls</h2> */}
      {/* <div className="h-4 w-px shrink-0 bg-slate-200/80" /> */}
      <TopActionTabs activeTab={activeTab} onChange={onChange} />
    </div>
  </div>
);

export const RightControlPanel = () => {
  const {
    activeSide,
    activeTab,
    canvasControls,
    layers,
    setActiveTab,
    setShirtColor,
    shirtColor,
  } = useEditorStore();

  return (
    <div className="space-y-4 xl:sticky xl:top-6 xl:flex xl:h-[calc(100vh-3rem)] xl:flex-col">
      <Card className="flex min-h-[80vh] flex-col overflow-hidden rounded-[24px] border-slate-200/60 bg-white/85 p-0 pt-1 pl-0 pr-0"  >
        <ToolsSidebarHeader activeTab={activeTab} onChange={setActiveTab} />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 xl:px-5 xl:py-5">
          {activeTab === "product" && (
            <Card
              className="border-slate-200/60 bg-slate-50/60 shadow-none"
              description="Keep product styling isolated from editor behavior so apparel options can scale later."
              title="Product Setup"
            >
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    Garment Color
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {shirtSwatches.map((swatch) => (
                      <button
                        key={swatch}
                        aria-label={`Shirt color ${swatch}`}
                        className="h-9 w-9 rounded-full border-2"
                        onClick={() => setShirtColor(swatch)}
                        style={{
                          backgroundColor: swatch,
                          borderColor: shirtColor === swatch ? "#0f172a" : "#cbd5e1",
                        }}
                        type="button"
                      />
                    ))}
                  </div>
                </div>

              </div>
            </Card>
          )}

          {activeTab === "templates" && <TemplatesPanel />}

          {activeTab === "images" && <ImageTool />}

          {activeTab === "text" && <TextTool />}

          {activeTab === "shapes" && <ShapeTool />}

          {activeTab === "save" && (
            <Card
              className="border-slate-200/60 bg-slate-50/60 shadow-none"
              description="Keep export and import actions in one place so persistence stays modular as the platform grows."
              title="Save / Load"
            >
              <div className="grid gap-3">
                <Button className="justify-start gap-2" onClick={canvasControls.downloadPreview}>
                  <FiDownload />
                  Download PNG Preview
                </Button>
                <Button className="justify-start gap-2" onClick={canvasControls.exportDesign}>
                  <FiSave />
                  Export Current Side JSON
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                  <FiUploadCloud />
                  Import JSON Design
                  <input
                    className="hidden"
                    onChange={(event) => canvasControls.importDesign(event.target.files?.[0])}
                    type="file"
                  />
                </label>
              </div>
            </Card>
          )}

          {activeTab === "quote" && (
            <Card
              className="border-slate-200/60 bg-slate-50/60 shadow-none"
              description="A lightweight commerce summary keeps the UI aligned with a future checkout flow."
              title="Quote / Buy"
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">Premium Cotton Tee</p>
                  <p className="mt-1">Design side: {activeSide}</p>
                  <p>Objects on canvas: {layers.length}</p>
                  <p>Estimated base price: $18.00</p>
                </div>
                <Button className="w-full gap-2" variant="primary">
                  <FiShoppingBag />
                  Request Quote
                </Button>
              </div>
            </Card>
          )}
        </div>
      </Card>

      <div className="shrink-0">
        <LayersCard />
      </div>
    </div>
  );
};
