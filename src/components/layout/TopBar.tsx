"use client";

import { data } from "@/data/schedule";

type View = "raspored" | "kalendar";

export function TopBar({
  view,
  onViewChange,
  currentWeek,
  year,
  onWeekBadgeTap,
}: {
  view: View;
  onViewChange: (v: View) => void;
  currentWeek: number;
  year: string;
  onWeekBadgeTap: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border"
      style={{ boxShadow: "var(--shadow-header)" }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[13px] font-bold tracking-[-0.02em] text-foreground leading-none">
            {view === "raspored" ? "Raspored" : "Rokovi"}
          </h1>
          <p className="text-[11px] text-muted-fg mt-0.5 tracking-[0.01em]">
            FIDIT &middot; {year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Desktop view toggle — hidden on mobile (uses BottomTabBar) */}
          <div className="hidden md:flex rounded-md overflow-hidden" style={{ background: "var(--muted)" }}>
            <button
              onClick={() => onViewChange("raspored")}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] t-fast transition-colors ${
                view === "raspored"
                  ? "bg-card text-foreground"
                  : "text-muted-fg hover:text-foreground"
              }`}
              style={view === "raspored" ? { boxShadow: "var(--shadow-card)" } : undefined}
            >
              Raspored
            </button>
            <button
              onClick={() => onViewChange("kalendar")}
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] t-fast transition-colors ${
                view === "kalendar"
                  ? "bg-card text-foreground"
                  : "text-muted-fg hover:text-foreground"
              }`}
              style={view === "kalendar" ? { boxShadow: "var(--shadow-card)" } : undefined}
            >
              Rokovi
            </button>
          </div>
          {currentWeek >= 1 && currentWeek <= 15 && (
            <button
              onClick={onWeekBadgeTap}
              className="week-badge cursor-pointer hover:opacity-80 t-fast transition-opacity"
            >
              T{currentWeek}/15
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
