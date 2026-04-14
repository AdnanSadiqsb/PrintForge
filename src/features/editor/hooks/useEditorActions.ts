import { useEditorStore } from "../../../hooks";

export const useEditorActions = () => {
  const {
    canvasControls,
    pendingImage,
    selectedColor,
    setActiveSide,
    setActiveTab,
    setPendingImage,
    setTextDraft,
    textDraft,
  } = useEditorStore();

  return {
    addText: () => {
      canvasControls.addText({ text: textDraft, fill: selectedColor });
      setTextDraft("");
    },
    addImage: () => {
      canvasControls.addImage(pendingImage);
      setPendingImage(undefined);
    },
    deleteSelection: () => canvasControls.deleteSelected(),
    download: () => canvasControls.downloadPreview(),
    exportDesign: () => canvasControls.exportDesign(),
    importDesign: (file?: File) => canvasControls.importDesign(file),
    redo: () => canvasControls.redo(),
    setActiveSide,
    setActiveTab,
    shareDesign: () => canvasControls.shareDesign(),
    undo: () => canvasControls.undo(),
    zoomIn: () => canvasControls.zoomIn(),
    zoomOut: () => canvasControls.zoomOut(),
  };
};
