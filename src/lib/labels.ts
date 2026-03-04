import type { EventType } from "@/data/types";

export const TYPE_LABEL: Record<EventType, string> = {
  kolokvij: "Kolokvij",
  obrana: "Obrana",
  kviz: "Kviz",
  ispit: "Ispit",
  laboratorij: "Laboratorij",
  predaja: "Predaja",
  zadavanje: "Zadavanje",
  domaca_zadaca: "Domaća zadaća",
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
};
