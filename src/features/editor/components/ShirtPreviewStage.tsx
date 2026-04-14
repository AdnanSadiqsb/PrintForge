import { Card } from "../../../components/ui";
import { useEditorStore } from "../../../hooks";
import { FabricCanvasManager } from "../canvas/FabricCanvasManager";
import { TshirtMockup } from "../../product";
import { TopToolbar } from "./TopToolbar";

export const ShirtPreviewStage = () => {
  const { activeSide, shirtColor } = useEditorStore();

  return (
    <Card className="min-h-[720px] overflow-hidden rounded-[24px] bg-white/82 p-0 shadow-[0_18px_48px_rgba(15,23,42,0.05)] xl:sticky xl:top-6">
      <TopToolbar />

      <div className="grid gap-4 p-4 xl:p-5">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef3f8_82%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] xl:px-5 xl:py-5">
          <div className="mx-auto max-w-[850px]">
            <TshirtMockup color={shirtColor} side={activeSide}>
              <FabricCanvasManager />
            </TshirtMockup>
          </div>
        </div>
      </div>
    </Card>
  );
};
