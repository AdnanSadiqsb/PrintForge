import { cn } from "../../../lib/utils";
import type { TemplateDefinition } from "../types/template.types";
import { getTemplateLayers, getTemplateObjectPreviewStyle } from "../utils/templatePreview";
import { normalizeTemplate } from "../utils/templateSchema";
import { toCssFill, toCssShadow } from "../utils/templateRenderUtils";
import { TemplateHoverOverlay } from "./TemplateHoverOverlay";

export const TemplateThumbnail = ({
  className,
  template,
}: {
  className?: string;
  template: TemplateDefinition;
}) => (
  (() => {
    const normalized = normalizeTemplate(template);
    const artboard = normalized.primaryArtboard;
    return (
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-[20px] border border-slate-200/70 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.24),_transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fafc_46%,#e0f2fe_100%)] transition duration-300 group-hover:scale-[1.03] group-focus-within:scale-[1.03]",
          className
        )}
      >
    <div className="absolute inset-[7%] rounded-[18px] border border-white/70 bg-white/92 shadow-[0_16px_32px_rgba(15,23,42,0.08)]" />
    <div className="absolute inset-[7%]">
      {template.thumbnail ? (
        <img alt="" className="h-full w-full object-cover" src={template.thumbnail} />
      ) : (
        getTemplateLayers(normalized, artboard.name).map((layer) => {
          const style = getTemplateObjectPreviewStyle(layer, { width: artboard.width, height: artboard.height });

          if (layer.type === "text") {
            return (
              <div
                key={layer.id}
                className="absolute flex items-center justify-center overflow-hidden text-center font-semibold leading-none"
                style={{
                  ...style,
                  WebkitTextFillColor: layer.outlineOnly ? "transparent" : undefined,
                  WebkitTextStroke: layer.stroke ? `${Math.max(layer.stroke.width * 0.2, 1)}px ${layer.stroke.color}` : undefined,
                  color: typeof layer.fill === "string" ? layer.fill : undefined,
                  fontFamily: layer.fontFamily,
                  fontSize: `${Math.max(layer.fontSize * 0.18, 7)}px`,
                  letterSpacing: `${(layer.charSpacing ?? 0) / 90}px`,
                  textShadow: toCssShadow(layer.shadow),
                  textTransform: layer.textTransform === "none" ? undefined : layer.textTransform,
                  transform: `${style.transform} scaleX(${layer.horizontalScale ?? 1})`,
                  backgroundImage: typeof layer.fill === "string" ? undefined : toCssFill(layer.fill),
                  backgroundClip: typeof layer.fill === "string" ? undefined : "text",
                }}
              >
                <span className={cn("block max-w-full truncate", layer.textShape !== "straight" && "tracking-[0.22em]")}>
                  {layer.text}
                </span>
              </div>
            );
          }

          if (layer.type === "image") {
            return (
              <img
                key={layer.id}
                alt=""
                className="absolute object-contain"
                src={layer.src}
                style={{
                  ...style,
                  borderRadius: layer.borderRadius ? `${Math.max(layer.borderRadius * 0.16, 2)}px` : undefined,
                  filter: layer.monochrome ? "grayscale(1)" : undefined,
                }}
              />
            );
          }

          if (layer.type === "vector") {
            return (
              <img
                key={layer.id}
                alt=""
                className="absolute object-contain"
                src={layer.src}
                style={{
                  ...style,
                  filter: layer.monochrome ? "grayscale(1) contrast(1.1)" : undefined,
                }}
              />
            );
          }

          if (layer.type === "group") {
            return null;
          }

          return (
            <div
              key={layer.id}
              className={cn(
                "absolute",
                (layer.shapeType === "circle" || layer.shapeType === "ellipse") && "rounded-full",
                layer.shapeType === "rect" && "rounded-[10px]"
              )}
              style={{
                ...style,
                background: toCssFill(layer.fill),
                border:
                  layer.shapeType === "line"
                    ? `${Math.max((layer.stroke?.width ?? 2) * 0.4, 1)}px ${
                        layer.stroke?.dashArray?.length ? "dashed" : "solid"
                      } ${layer.stroke?.color ?? "#0f172a"}`
                    : layer.stroke
                      ? `${Math.max(layer.stroke.width * 0.25, 1)}px ${
                          layer.stroke.dashArray?.length ? "dashed" : "solid"
                        } ${layer.stroke.color}`
                      : undefined,
                borderRadius: layer.shapeType === "rect" ? `${Math.max(layer.rx ?? 0, layer.ry ?? 0) * 0.16}px` : undefined,
                clipPath:
                  layer.shapeType === "polygon"
                    ? "polygon(50% 0%, 93% 25%, 75% 88%, 25% 88%, 7% 25%)"
                    : layer.shapeType === "star"
                      ? "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"
                      : layer.shapeType === "path"
                        ? "polygon(0% 100%, 15% 12%, 50% 0%, 85% 12%, 100% 100%)"
                        : undefined,
                height: layer.shapeType === "line" ? "2%" : style.height,
                boxShadow: toCssShadow(layer.shadow),
              }}
            />
          );
        })
      )}
    </div>
  </div>
    );
  })()
);

export const TemplateCard = ({
  isApplied,
  onApply,
  onPreview,
  template,
}: {
  isApplied: boolean;
  onApply: (template: TemplateDefinition) => void;
  onPreview?: (template: TemplateDefinition) => void;
  template: TemplateDefinition;
}) => {
  return (
    <article
      aria-label={`${template.name} template`}
      className={cn(
        "group relative overflow-hidden rounded-[24px] border bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition duration-200",
        isApplied
          ? "border-emerald-300/90 shadow-[0_18px_40px_rgba(16,185,129,0.12)]"
          : "border-slate-200/80 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]"
      )}
    >
      <div
        className="cursor-pointer outline-none"
        onClick={() => onApply(template)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onApply(template);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="relative overflow-hidden rounded-[20px]">
          <TemplateThumbnail template={template} />
          <TemplateHoverOverlay isApplied={isApplied} onPreview={onPreview ? () => onPreview(template) : undefined} />

          {/* <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
            <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur">
              {TEMPLATE_CATEGORY_LABELS[template.category]}
            </span>
            {primaryBadge && (
              <span className="rounded-full bg-slate-950/88 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                {TEMPLATE_BADGE_LABELS[primaryBadge]}
              </span>
            )}
          </div> */}

          {/* {isApplied && (
            <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
              <FiCheck />
              Applied
            </div>
          )} */}
        </div>

        <div className="px-1 pb-1 pt-3">
          <p className="truncate text-sm font-semibold text-slate-900">{template.name}</p>
          {/* <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="truncate">{template.tags[0] ?? TEMPLATE_CATEGORY_LABELS[template.category]}</span>
            {template.premium && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">Premium</span>}
          </div> */}
        </div>
      </div>
    </article>
  );
};
