import { RightControlPanel } from "./RightControlPanel";
import { ShirtPreviewStage } from "./ShirtPreviewStage";

export const EditorShell = () => {
  return (
    <main className="bg-[#f4f6fa] px-4 py-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1920px] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
        <ShirtPreviewStage />
        <RightControlPanel />
      </div>
    </main>
  );
};
