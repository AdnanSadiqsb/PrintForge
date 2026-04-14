import type { TemplateDefinition } from "../types/template.types";

const createSvgDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const lightningSvg = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="180" height="220" viewBox="0 0 180 220">
    <path d="M96 10L34 120h42l-12 90 82-120h-44l18-80z" fill="#fde047"/>
  </svg>
`);

const surfPalmSvg = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
    <path d="M108 62c18-30 44-44 82-44-11 22-27 38-56 48 27-1 50 7 70 28-31 10-58 6-88-13 15 23 16 47 6 73-17-15-25-35-25-59-10 21-27 32-51 35 4-31 21-54 53-68-26 2-47-6-65-26 29-15 54-12 74 8z" fill="#14532d"/>
    <path d="M109 94c9 27 11 61 2 102" stroke="#7c2d12" stroke-width="10" stroke-linecap="round"/>
  </svg>
`);

const crestSvg = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <path d="M120 18l78 28v64c0 54-30 92-78 112-48-20-78-58-78-112V46l78-28z" fill="#0f172a"/>
    <path d="M120 36l60 22v52c0 42-22 72-60 90-38-18-60-48-60-90V58l60-22z" fill="#111827"/>
    <path d="M80 146l40-76 40 76-40 20-40-20z" fill="#22d3ee"/>
  </svg>
`);

const monogramSvg = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <circle cx="120" cy="120" r="102" fill="none" stroke="#0f172a" stroke-width="10"/>
    <path d="M80 166V72h14l26 50 26-50h14v94h-16v-57l-18 36h-12l-18-36v57z" fill="#0f172a"/>
  </svg>
`);

const guide = (id: string, width: number, height: number) => [
  {
    id: `${id}-print`,
    type: "print-area" as const,
    left: 33,
    top: 41,
    width,
    height,
    stroke: "#94a3b8",
    strokeDasharray: [8, 6],
    label: "Print Area",
  },
  {
    id: `${id}-safe`,
    type: "safe-area" as const,
    left: 48,
    top: 56,
    width: width - 30,
    height: height - 30,
    stroke: "#cbd5e1",
    strokeDasharray: [4, 6],
    label: "Safe Area",
  },
];

export const MOCK_TEMPLATES: TemplateDefinition[] = [
  {
    id: "modern-sports-badge",
    version: 2,
    name: "Modern Sports Badge",
    category: "sports",
    description: "Premium badge build with layered rings, a gradient shield, editable team text, and front/back artboards.",
    tags: ["badge", "team", "athletic", "shield"],
    badges: ["new"],
    featured: true,
    premium: true,
    thumbnail: "",
    productContext: {
      productId: "tee-classic",
      decorationMethod: "screen-print",
    },
    tokens: {
      colors: {
        primary: "#0f172a",
        secondary: "#f97316",
        accent: "#fde047",
        light: "#ffffff",
      },
      fonts: {
        headlineFont: "Bebas Neue",
        bodyFont: "Inter",
      },
    },
    placeholders: [
      { id: "ph-team", key: "team-name", label: "Team Name", type: "text", targetLayerIds: ["team-name"], defaultValue: "TIGERS", editable: true },
      { id: "ph-year", key: "season-year", label: "Season", type: "text", targetLayerIds: ["season-year"], defaultValue: "2026", editable: true },
      { id: "ph-color", key: "primary-color", label: "Primary Color", type: "color", targetLayerIds: ["badge-core"], defaultValue: "#0f172a", editable: true },
    ],
    metadata: {
      source: "manual",
      family: "league-badges",
      variant: "modern",
      styleTags: ["bold", "crest", "stacked"],
      difficulty: "advanced",
      supportsColorSwap: true,
      supportsPersonalization: true,
      createdAt: "2026-04-14",
      updatedAt: "2026-04-14",
      author: "Codex",
      schemaVersion: 2,
    },
    sides: [
      {
        id: "sports-front",
        name: "front",
        locationNumber: 1,
        width: 300,
        height: 370,
        printableWidth: 234,
        printableHeight: 288,
        guidelines: guide("sports-front", 234, 288),
        layers: [
          { id: "ring-outer", type: "shape", groupId: "sports-badge", name: "Outer Ring", shapeType: "ellipse", left: 150, top: 178, width: 202, height: 222, fill: { type: "linear-gradient", angle: 90, stops: [{ offset: 0, color: "#f97316" }, { offset: 1, color: "#fb7185" }] }, stroke: { color: "#fff7ed", width: 3 }, shadow: { color: "#7c2d12", blur: 18, offsetX: 0, offsetY: 10, opacity: 0.35 }, zIndex: 1 },
          { id: "ring-inner", type: "shape", groupId: "sports-badge", name: "Inner Ring", shapeType: "ellipse", left: 150, top: 178, width: 176, height: 196, fill: "#fff7ed", stroke: { color: "#fdba74", width: 2, dashArray: [10, 6] }, zIndex: 2 },
          { id: "badge-core", type: "shape", groupId: "sports-badge", name: "Badge Core", placeholderKey: "primary-color", shapeType: "path", left: 150, top: 182, width: 146, height: 166, pathData: "M0 0 L55 -60 L120 -26 L104 66 L0 110 L-104 66 L-120 -26 L-55 -60 Z", fill: { type: "linear-gradient", angle: 180, stops: [{ offset: 0, color: "#1e293b" }, { offset: 1, color: "#020617" }] }, stroke: { color: "#fde68a", width: 3 }, zIndex: 3 },
          { id: "bolt-icon", type: "vector", groupId: "sports-badge", name: "Lightning Icon", left: 150, top: 168, width: 62, height: 76, src: lightningSvg, monochrome: true, colorOverrides: { "#fde047": "#fde047" }, shadow: { color: "#0f172a", blur: 10, offsetX: 0, offsetY: 4, opacity: 0.35 }, zIndex: 4 },
          { id: "team-arc", type: "text", groupId: "sports-badge", name: "Top Arc", text: "CITY LEAGUE", left: 150, top: 100, width: 210, height: 30, fill: "#ffffff", fontFamily: "Inter", fontSize: 15, fontWeight: 700, charSpacing: 140, textShape: "arc-up", curvature: 70, shadow: { color: "#431407", blur: 12, offsetX: 0, offsetY: 4, opacity: 0.45 }, zIndex: 5 },
          { id: "team-name", type: "text", groupId: "sports-badge", name: "Team Name", placeholderKey: "team-name", text: "TIGERS", left: 150, top: 184, width: 170, height: 56, fill: "#ffffff", fontFamily: "Bebas Neue", fontSize: 44, fontWeight: 700, horizontalScale: 1.14, charSpacing: 25, stroke: { color: "#f97316", width: 3 }, innerStroke: { color: "#ffffff", width: 1 }, shadow: { color: "#0f172a", blur: 16, offsetX: 0, offsetY: 6, opacity: 0.45 }, zIndex: 6 },
          { id: "season-year", type: "text", groupId: "sports-badge", name: "Season", placeholderKey: "season-year", text: "2026", left: 150, top: 232, width: 100, height: 22, fill: "#fde047", fontFamily: "Inter", fontSize: 18, fontWeight: 800, charSpacing: 180, stroke: { color: "#7c2d12", width: 1 }, zIndex: 7 },
        ],
      },
      {
        id: "sports-back",
        name: "back",
        locationNumber: 2,
        width: 300,
        height: 370,
        printableWidth: 234,
        printableHeight: 288,
        guidelines: guide("sports-back", 234, 288),
        layers: [
          { id: "back-number-shadow", type: "text", name: "Back Number Shadow", text: "24", left: 150, top: 182, width: 160, height: 160, fill: "#0f172a", fontFamily: "Bebas Neue", fontSize: 124, fontWeight: 800, opacity: 0.18, horizontalScale: 1.06, zIndex: 1 },
          { id: "back-number", type: "text", name: "Back Number", text: "24", left: 150, top: 176, width: 160, height: 160, fill: "#fff7ed", fontFamily: "Bebas Neue", fontSize: 124, fontWeight: 800, stroke: { color: "#f97316", width: 5 }, shadow: { color: "#7c2d12", blur: 20, offsetX: 0, offsetY: 10, opacity: 0.25 }, zIndex: 2 },
        ],
      },
    ],
  },
  {
    id: "premium-varsity-logo",
    version: 2,
    name: "Premium Varsity Logo",
    category: "college",
    description: "Layered varsity build with outline text, ribbon geometry, and token-driven school colors.",
    tags: ["varsity", "college", "heritage", "letterman"],
    badges: ["premium"],
    featured: true,
    thumbnail: "",
    tokens: {
      colors: { primary: "#7f1d1d", secondary: "#fef3c7", accent: "#111827" },
      fonts: { headlineFont: "Oswald", bodyFont: "Inter" },
    },
    metadata: {
      source: "manual",
      family: "varsity",
      variant: "premium",
      styleTags: ["heritage", "stacked", "school"],
      difficulty: "advanced",
      supportsColorSwap: true,
      supportsPersonalization: true,
      schemaVersion: 2,
    },
    sides: [
      {
        id: "varsity-front",
        name: "front",
        width: 300,
        height: 370,
        printableWidth: 234,
        printableHeight: 288,
        guidelines: guide("varsity-front", 234, 288),
        layers: [
          { id: "ribbon-left", type: "shape", name: "Ribbon Left", shapeType: "path", left: 88, top: 178, width: 80, height: 132, pathData: "M-40 -26 L20 -46 L36 -6 L6 64 L-38 42 Z", fill: { type: "linear-gradient", angle: 90, stops: [{ offset: 0, color: "#991b1b" }, { offset: 1, color: "#7f1d1d" }] }, stroke: { color: "#fef3c7", width: 2 }, zIndex: 1 },
          { id: "ribbon-right", type: "shape", name: "Ribbon Right", shapeType: "path", left: 212, top: 178, width: 80, height: 132, pathData: "M40 -26 L-20 -46 L-36 -6 L-6 64 L38 42 Z", fill: { type: "linear-gradient", angle: 90, stops: [{ offset: 0, color: "#991b1b" }, { offset: 1, color: "#7f1d1d" }] }, stroke: { color: "#fef3c7", width: 2 }, zIndex: 1 },
          { id: "crest-star", type: "shape", name: "Accent Star", shapeType: "star", left: 150, top: 110, width: 52, height: 52, points: 5, innerRadius: 14, fill: "#fef3c7", stroke: { color: "#111827", width: 2 }, zIndex: 2 },
          { id: "varsity-letter", type: "text", name: "Varsity Letter", placeholderKey: "headline", text: "M", left: 150, top: 186, width: 160, height: 140, fill: "#7f1d1d", fontFamily: "Oswald", fontSize: 122, fontWeight: 800, horizontalScale: 1.08, stroke: { color: "#fef3c7", width: 6 }, innerStroke: { color: "#111827", width: 2 }, shadow: { color: "#111827", blur: 16, offsetX: 0, offsetY: 10, opacity: 0.24 }, zIndex: 3 },
          { id: "varsity-subtitle", type: "text", name: "School Name", placeholderKey: "subheadline", text: "MIDTOWN ATHLETICS", left: 150, top: 278, width: 210, height: 24, fill: "#111827", fontFamily: "Inter", fontSize: 16, fontWeight: 700, charSpacing: 140, zIndex: 4 },
          { id: "varsity-bar", type: "shape", name: "Divider", shapeType: "rect", left: 150, top: 248, width: 186, height: 10, rx: 8, ry: 8, fill: { type: "linear-gradient", angle: 0, stops: [{ offset: 0, color: "#111827" }, { offset: 0.5, color: "#fef3c7" }, { offset: 1, color: "#111827" }] }, zIndex: 4 },
        ],
      },
    ],
  },
  {
    id: "retro-surf-badge",
    version: 2,
    name: "Retro Surf Badge",
    category: "summer",
    description: "Vintage coastal badge with sunset gradients, palm vector art, curved text, and soft print shadows.",
    tags: ["retro", "surf", "sunset", "vacation"],
    badges: ["popular"],
    thumbnail: "",
    placeholders: [
      { id: "ph-coast", key: "coast-name", label: "Coast Name", type: "text", targetLayerIds: ["surf-title"], defaultValue: "SUNSET COAST", editable: true },
      { id: "ph-date", key: "event-date", label: "Date", type: "text", targetLayerIds: ["surf-date"], defaultValue: "SUMMER '26", editable: true },
    ],
    metadata: {
      source: "manual",
      family: "retro-badges",
      variant: "surf",
      styleTags: ["sunset", "beach", "badge"],
      difficulty: "medium",
      supportsPersonalization: true,
      schemaVersion: 2,
    },
    sides: [
      {
        id: "surf-front",
        name: "front",
        width: 300,
        height: 370,
        printableWidth: 234,
        printableHeight: 288,
        guidelines: guide("surf-front", 234, 288),
        background: "#fff7ed",
        layers: [
          { id: "surf-sun", type: "shape", name: "Sun", shapeType: "circle", left: 150, top: 168, width: 152, height: 152, radius: 76, fill: { type: "radial-gradient", stops: [{ offset: 0, color: "#fde68a" }, { offset: 0.55, color: "#fb923c" }, { offset: 1, color: "#f97316" }] }, shadow: { color: "#fb923c", blur: 22, offsetX: 0, offsetY: 8, opacity: 0.25 }, zIndex: 1 },
          { id: "surf-wave-1", type: "shape", name: "Wave One", shapeType: "path", left: 150, top: 222, width: 200, height: 54, pathData: "M-100 0 C-60 -32 -20 -32 20 0 C48 20 74 18 100 0 L100 30 L-100 30 Z", fill: "#0f766e", zIndex: 2 },
          { id: "surf-wave-2", type: "shape", name: "Wave Two", shapeType: "path", left: 150, top: 238, width: 184, height: 48, pathData: "M-92 0 C-52 -26 -10 -22 24 0 C56 20 78 18 92 0 L92 24 L-92 24 Z", fill: "#164e63", zIndex: 3 },
          { id: "surf-palm", type: "vector", name: "Palm", left: 216, top: 164, width: 70, height: 70, src: surfPalmSvg, colorOverrides: { "#14532d": "#14532d", "#7c2d12": "#7c2d12" }, zIndex: 4 },
          { id: "surf-arc", type: "text", name: "Surf Arc", text: "PACIFIC RIDERS", left: 150, top: 102, width: 220, height: 24, fill: "#0f172a", fontFamily: "Outfit", fontSize: 16, fontWeight: 700, charSpacing: 160, textShape: "arc-up", curvature: 62, zIndex: 5 },
          { id: "surf-title", type: "text", name: "Surf Title", placeholderKey: "coast-name", text: "SUNSET COAST", left: 150, top: 266, width: 220, height: 36, fill: { type: "linear-gradient", angle: 90, stops: [{ offset: 0, color: "#f97316" }, { offset: 1, color: "#e11d48" }] }, fontFamily: "Pacifico", fontSize: 34, fontWeight: 700, stroke: { color: "#fff7ed", width: 2 }, shadow: { color: "#7c2d12", blur: 14, offsetX: 0, offsetY: 8, opacity: 0.2 }, zIndex: 6 },
          { id: "surf-date", type: "text", name: "Surf Date", placeholderKey: "event-date", text: "SUMMER '26", left: 150, top: 302, width: 160, height: 20, fill: "#0f172a", fontFamily: "Inter", fontSize: 15, fontWeight: 700, charSpacing: 100, zIndex: 7 },
        ],
      },
    ],
  },
  {
    id: "event-flyer-print",
    version: 2,
    name: "Event Flyer Print",
    category: "event",
    description: "Poster-inspired front print with gradient bars, stacked type, accent stars, and a photo placeholder.",
    tags: ["event", "poster", "music", "festival"],
    featured: true,
    thumbnail: "",
    placeholders: [
      { id: "ph-headliner", key: "headliner", label: "Headliner", type: "text", targetLayerIds: ["event-headliner"], defaultValue: "NIGHT SIGNAL", editable: true },
      { id: "ph-logo", key: "photo-slot", label: "Image", type: "image", targetLayerIds: ["event-photo"], editable: true },
    ],
    metadata: {
      source: "manual",
      family: "flyer-series",
      variant: "front-print",
      styleTags: ["poster", "stacked", "festival"],
      difficulty: "advanced",
      supportsImageReplace: true,
      supportsPersonalization: true,
      schemaVersion: 2,
    },
    sides: [
      {
        id: "event-front",
        name: "front",
        width: 300,
        height: 370,
        printableWidth: 234,
        printableHeight: 288,
        guidelines: guide("event-front", 234, 288),
        layers: [
          { id: "event-bg", type: "shape", name: "Background Plate", shapeType: "rect", left: 150, top: 186, width: 220, height: 292, rx: 22, ry: 22, fill: { type: "linear-gradient", angle: 180, stops: [{ offset: 0, color: "#020617" }, { offset: 1, color: "#1d4ed8" }] }, shadow: { color: "#020617", blur: 24, offsetX: 0, offsetY: 14, opacity: 0.28 }, zIndex: 1 },
          { id: "event-photo", type: "image", name: "Photo Slot", placeholderKey: "photo-slot", left: 150, top: 136, width: 182, height: 110, src: crestSvg, fit: "cover", borderRadius: 16, monochrome: true, tint: "#38bdf8", zIndex: 2 },
          { id: "event-bar", type: "shape", name: "Accent Bar", shapeType: "rect", left: 150, top: 204, width: 182, height: 14, rx: 10, ry: 10, fill: { type: "linear-gradient", angle: 0, stops: [{ offset: 0, color: "#22d3ee" }, { offset: 1, color: "#a78bfa" }] }, zIndex: 3 },
          { id: "event-headliner", type: "text", name: "Headliner", placeholderKey: "headliner", text: "NIGHT SIGNAL", left: 150, top: 242, width: 186, height: 54, fill: "#ffffff", fontFamily: "Archivo Black", fontSize: 34, fontWeight: 800, horizontalScale: 0.94, lineHeight: 0.95, stroke: { color: "#0f172a", width: 2 }, shadow: { color: "#38bdf8", blur: 18, offsetX: 0, offsetY: 10, opacity: 0.25 }, zIndex: 4 },
          { id: "event-subline", type: "text", name: "Subline", text: "LIVE // 09.14 // DOWNTOWN", left: 150, top: 292, width: 188, height: 22, fill: "#e2e8f0", fontFamily: "Inter", fontSize: 15, fontWeight: 700, charSpacing: 90, zIndex: 5 },
          { id: "event-stars", type: "shape", name: "Decorative Star", shapeType: "polygon", left: 150, top: 322, width: 48, height: 48, points: 6, fill: { type: "linear-gradient", angle: 0, stops: [{ offset: 0, color: "#22d3ee" }, { offset: 1, color: "#ffffff" }] }, stroke: { color: "#bae6fd", width: 1.5 }, zIndex: 6 },
        ],
      },
    ],
  },
  {
    id: "minimal-monogram-logo",
    version: 2,
    name: "Minimal Monogram Logo",
    category: "minimal",
    description: "Clean monogram with vector framing, tone-on-tone gradients, and restrained premium styling.",
    tags: ["minimal", "monogram", "luxury", "clean"],
    thumbnail: "",
    placeholders: [
      { id: "ph-initials", key: "initials", label: "Initials", type: "text", targetLayerIds: ["mono-initials"], defaultValue: "A M", editable: true },
    ],
    metadata: {
      source: "manual",
      family: "minimal-logo",
      variant: "monogram",
      styleTags: ["luxury", "minimal", "clean"],
      difficulty: "simple",
      supportsPersonalization: true,
      supportsColorSwap: true,
      schemaVersion: 2,
    },
    sides: [
      {
        id: "mono-front",
        name: "front",
        width: 300,
        height: 370,
        printableWidth: 234,
        printableHeight: 288,
        guidelines: guide("mono-front", 234, 288),
        layers: [
          { id: "mono-frame", type: "vector", name: "Monogram Frame", left: 150, top: 186, width: 170, height: 170, src: monogramSvg, monochrome: true, colorOverrides: { "#0f172a": "#0f172a" }, zIndex: 1 },
          { id: "mono-initials", type: "text", name: "Initials", placeholderKey: "initials", text: "A M", left: 150, top: 188, width: 130, height: 48, fill: { type: "linear-gradient", angle: 90, stops: [{ offset: 0, color: "#111827" }, { offset: 1, color: "#475569" }] }, fontFamily: "Cormorant Garamond", fontSize: 52, fontWeight: 700, charSpacing: 70, zIndex: 2 },
          { id: "mono-tagline", type: "text", name: "Tagline", text: "atelier collection", left: 150, top: 250, width: 130, height: 18, fill: "#475569", fontFamily: "Inter", fontSize: 13, fontWeight: 500, charSpacing: 120, textTransform: "uppercase", zIndex: 3 },
        ],
      },
    ],
  },
  {
    id: "neon-tech-crest",
    version: 2,
    name: "Neon Tech Crest",
    category: "trending",
    description: "Futuristic crest with glowing rings, cyber text treatment, vector shield art, and warp-ready data.",
    tags: ["neon", "tech", "gaming", "cyber"],
    badges: ["new", "premium"],
    featured: true,
    thumbnail: "",
    tokens: {
      colors: { primary: "#22d3ee", secondary: "#a78bfa", dark: "#020617" },
      fonts: { headlineFont: "Orbitron", bodyFont: "Inter" },
    },
    placeholders: [
      { id: "ph-crest", key: "crest-title", label: "Title", type: "text", targetLayerIds: ["tech-title"], defaultValue: "NOVA GRID", editable: true },
    ],
    metadata: {
      source: "manual",
      family: "neon-crests",
      variant: "tech",
      styleTags: ["glow", "cyber", "esports"],
      difficulty: "advanced",
      supportsPersonalization: true,
      supportsColorSwap: true,
      schemaVersion: 2,
    },
    sides: [
      {
        id: "tech-front",
        name: "front",
        width: 300,
        height: 370,
        printableWidth: 234,
        printableHeight: 288,
        guidelines: guide("tech-front", 234, 288),
        layers: [
          { id: "tech-glow", type: "shape", name: "Glow", shapeType: "circle", left: 150, top: 174, width: 212, height: 212, radius: 106, fill: { type: "radial-gradient", stops: [{ offset: 0, color: "#22d3ee", opacity: 0.5 }, { offset: 0.6, color: "#0f172a", opacity: 0.18 }, { offset: 1, color: "#020617", opacity: 0 }] }, zIndex: 1 },
          { id: "tech-outer", type: "shape", name: "Outer Ring", shapeType: "circle", left: 150, top: 174, width: 186, height: 186, radius: 93, fill: "#020617", stroke: { color: "#22d3ee", width: 2, dashArray: [8, 6] }, shadow: { color: "#22d3ee", blur: 18, offsetX: 0, offsetY: 0, opacity: 0.4 }, zIndex: 2 },
          { id: "tech-inner", type: "shape", name: "Inner Ring", shapeType: "circle", left: 150, top: 174, width: 148, height: 148, radius: 74, fill: { type: "linear-gradient", angle: 180, stops: [{ offset: 0, color: "#111827" }, { offset: 1, color: "#020617" }] }, stroke: { color: "#a78bfa", width: 2 }, zIndex: 3 },
          { id: "tech-shield", type: "vector", name: "Shield", left: 150, top: 174, width: 92, height: 92, src: crestSvg, monochrome: true, colorOverrides: { "#0f172a": "#22d3ee", "#111827": "#020617", "#22d3ee": "#a78bfa" }, zIndex: 4 },
          { id: "tech-topline", type: "text", name: "Topline", text: "SYSTEMS READY", left: 150, top: 100, width: 210, height: 20, fill: "#67e8f9", fontFamily: "Inter", fontSize: 13, fontWeight: 700, charSpacing: 190, textShape: "arc-up", curvature: 74, zIndex: 5 },
          { id: "tech-title", type: "text", name: "Tech Title", placeholderKey: "crest-title", text: "NOVA GRID", left: 150, top: 176, width: 172, height: 42, fill: "#ffffff", fontFamily: "Orbitron", fontSize: 30, fontWeight: 800, horizontalScale: 1.06, stroke: { color: "#22d3ee", width: 2 }, shadow: { color: "#22d3ee", blur: 20, offsetX: 0, offsetY: 0, opacity: 0.48 }, warp: { type: "bulge", amount: 24, horizontal: true }, zIndex: 6 },
          { id: "tech-code", type: "text", name: "Code", text: "SECTOR 09 // EST 2049", left: 150, top: 228, width: 180, height: 18, fill: "#c4b5fd", fontFamily: "Inter", fontSize: 12, fontWeight: 600, charSpacing: 120, zIndex: 7 },
        ],
      },
    ],
  },
];
