import type { FabricJSEditor } from "fabricjs-react";

export const downloadCanvasAsImage = (editor?: FabricJSEditor) => {
  const canvas = editor?.canvas;

  if (!canvas) {
    return;
  }

  const dataUrl = canvas.toDataURL({
    format: "png",
    multiplier: 2,
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "canvas.png";
  link.click();
};
