import type { EventType } from "@/data/types";

export const TEST_TYPES: Set<EventType> = new Set(["kolokvij", "ispit", "kontrolna", "kviz"]);
export const TYPE_LABEL: Record<EventType, string> = {
  kolokvij: "Kolokvij",
  obrana: "Obrana",
  kviz: "Kviz",
  ispit: "Ispit",
  laboratorij: "Laboratorij",
  predaja: "Predaja",
  zadavanje: "Zadavanje",
  domaca_zadaca: "Domaća zadaća",
  kontrolna: "Kontrolna zadaća",
};

export const TYPE_CATEGORY: Record<EventType, "exam" | "assignment" | "lab"> = {
  kolokvij: "exam",
  obrana: "exam",
  kviz: "exam",
  ispit: "exam",
  laboratorij: "lab",
  predaja: "assignment",
  zadavanje: "assignment",
  domaca_zadaca: "assignment",
  kontrolna: "exam",
};

export const EVENT_COLOR: Record<EventType, string> = {
  kolokvij: "var(--u-critical)",
  obrana: "var(--u-approaching)",
  kviz: "var(--u-approaching)",
  ispit: "var(--u-critical)",
  laboratorij: "var(--m-accent)",
  predaja: "var(--e-accent)",
  zadavanje: "var(--muted-fg)",
  domaca_zadaca: "var(--e-accent)",
  kontrolna: "var(--u-critical)",
};

/** Per-course accent colors for schedule cards and UI consistency. */
export const COURSE_COLOR: Record<string, { accent: string; text: string; tint: string }> = {
  os:     { accent: "#c45c5c", text: "#e08a8a", tint: "#1e1214" },
  mat2:   { accent: "#c4a33c", text: "#dcc06e", tint: "#1e1c14" },
  modpod: { accent: "#3ca5a5", text: "#6ecece", tint: "#121e1e" },
  ovis:   { accent: "#9c6cc4", text: "#bea0dc", tint: "#1a141e" },
  uasp:   { accent: "#4da5c4", text: "#7ec8e0", tint: "#121a1e" },
  aor:    { accent: "#9e9a94", text: "#c0bdb8", tint: "#1a1918" },
  oi:     { accent: "#c45ca5", text: "#dc8ac8", tint: "#1e1218" },
  upw:    { accent: "#52945c", text: "#82c48c", tint: "#141c14" },
};

export function getCourseColor(subjectId: string) {
  return COURSE_COLOR[subjectId] ?? { accent: "#9e9a94", text: "#c0bdb8", tint: "#1c1a17" };
}
