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
              className="week-badge cursor-pointer hover:opacity-80 t-fast transition-opacity gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
                <path d="M4.5 1v2.5M9.5 1v2.5M1.5 5.5h11" />
                <path d="M1.5 8h11" opacity="0.4" />
              </svg>
              T{currentWeek}/15
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
