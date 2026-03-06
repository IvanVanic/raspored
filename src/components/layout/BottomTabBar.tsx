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
    <nav className="bottom-tab-bar md:hidden" role="tablist" aria-label="Navigacija">
      <button
        role="tab"
        aria-selected={view === "raspored"}
        className="bottom-tab"
        data-active={view === "raspored" ? "true" : "false"}
        onClick={() => onViewChange("raspored")}
      >
        {/* Active indicator dot */}
        <span className="bottom-tab-dot" aria-hidden="true" />
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Raspored
      </button>

      <button
        role="tab"
        aria-selected={view === "kalendar"}
        className="bottom-tab"
        data-active={view === "kalendar" ? "true" : "false"}
        onClick={() => onViewChange("kalendar")}
      >
        <span className="bottom-tab-dot" aria-hidden="true" />
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Rokovi
      </button>
    </nav>
  );
}
