import { useRef, useState } from "react";
import { FiCheckCircle, FiImage, FiLoader, FiPlus, FiUploadCloud, FiXCircle } from "react-icons/fi";
import { cn } from "../../../lib/utils";

type ImageUploadPanelProps = {
  compact?: boolean;
  error: string;
  imageCount?: number;
  isUploading: boolean;
  previewSrc?: string;
  status: string;
  onFileSelect: (file?: File) => void;
};

export const ImageUploadPanel = ({
  compact = false,
  error,
  imageCount = 0,
  isUploading,
  previewSrc,
  status,
  onFileSelect,
}: ImageUploadPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("space-y-3", compact && "space-y-2.5")}>
      <div
        className={cn(
          compact
            ? "rounded-2xl border border-dashed bg-white px-4 py-3 text-left transition"
            : "rounded-[24px] border border-dashed bg-white px-5 py-8 text-center transition",
          isDragging ? "border-sky-300 bg-sky-50/60" : "border-slate-200 hover:border-slate-300"
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onFileSelect(event.dataTransfer.files?.[0]);
        }}
      >
        <button
          className={cn(
            "flex w-full",
            compact ? "items-center justify-between gap-4" : "flex-col items-center"
          )}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <div className={cn("flex", compact ? "items-center gap-3" : "flex-col items-center")}>
            <span
              className={cn(
                "flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500",
                compact ? "h-10 w-10" : "h-12 w-12"
              )}
            >
              {isUploading ? (
                <FiLoader className="animate-spin text-xl" />
              ) : compact ? (
                <FiPlus className="text-lg" />
              ) : (
                <FiUploadCloud className="text-xl" />
              )}
            </span>
            <div className={cn(compact ? "text-left" : "mt-4 text-center")}>
              <p className="text-sm font-medium text-slate-800">
                {compact ? "Upload another image" : "Drop artwork here or browse files"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {compact
                  ? `${imageCount} image${imageCount === 1 ? "" : "s"} on this side. PNG, JPG, WEBP, SVG.`
                  : "PNG, JPG, JPEG, WEBP, and SVG up to 10 MB"}
              </p>
            </div>
          </div>
          {compact && (
            <span className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
              Browse
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(event) => onFileSelect(event.target.files?.[0])}
          type="file"
        />
      </div>

      {(status || error || previewSrc) && (
        <div className={cn("rounded-2xl border border-slate-200/80 bg-white", compact ? "p-3" : "p-4")}>
          {previewSrc && (
            <div className={cn("overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50", compact ? "mb-3" : "mb-4")}>
              <img alt="Uploaded artwork preview" className={cn("w-full object-contain", compact ? "h-28" : "h-40")} src={previewSrc} />
            </div>
          )}

          {status && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <FiCheckCircle />
              <span>{status}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600">
              <FiXCircle />
              <span>{error}</span>
            </div>
          )}

          {!status && !error && !previewSrc && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FiImage />
              <span>Upload or drop artwork to place it directly on the shirt.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
