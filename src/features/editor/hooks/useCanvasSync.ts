import { useEffect } from "react";
import { getCanvasObjects } from "../../../lib/fabric";
import { useEditorStore } from "../../../hooks";

export const useCanvasSync = () => {
  const { canvas, setActiveTab, setLayers, setSelectedObjectId } = useEditorStore();

  useEffect(() => {
    if (!canvas) {
      setLayers([]);
      setSelectedObjectId(undefined);
      return;
    }

    const syncState = () => {
      const objects = getCanvasObjects(canvas);
      const activeObject = objects.find((object) => object.isActive);
      setLayers(objects);
      setSelectedObjectId(activeObject?.id);

      if (activeObject?.kind === "text") {
        setActiveTab("text");
      } else if (activeObject?.kind === "image") {
        setActiveTab("images");
      } else if (activeObject?.kind === "shape") {
        setActiveTab("shapes");
      }
    };

    syncState();

    canvas.on("object:added", syncState);
    canvas.on("object:removed", syncState);
    canvas.on("object:modified", syncState);
    canvas.on("selection:created", syncState);
    canvas.on("selection:updated", syncState);
    canvas.on("selection:cleared", syncState);

    return () => {
      canvas.off("object:added", syncState);
      canvas.off("object:removed", syncState);
      canvas.off("object:modified", syncState);
      canvas.off("selection:created", syncState);
      canvas.off("selection:updated", syncState);
      canvas.off("selection:cleared", syncState);
    };
  }, [canvas, setActiveTab, setLayers, setSelectedObjectId]);
};
