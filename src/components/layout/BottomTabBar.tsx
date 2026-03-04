"use client";

type View = "raspored" | "kalendar";

export function BottomTabBar({
  view,
  onViewChange,
}: {
  view: View;
  onViewChange: (v: View) => void;
}) {
  return (
    <nav className="bottom-tab-bar md:hidden">
      <button
        className="bottom-tab"
        data-active={view === "raspored" ? "true" : "false"}
        onClick={() => onViewChange("raspored")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Raspored
      </button>
      <button
        className="bottom-tab"
        data-active={view === "kalendar" ? "true" : "false"}
        onClick={() => onViewChange("kalendar")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Rokovi
      </button>
    </nav>
  );
}
