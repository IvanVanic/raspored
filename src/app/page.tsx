"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas-pro";
import scheduleData from "@/data/schedule-data.json";
import type { ScheduleData, Slot } from "@/data/types";

const data = scheduleData as unknown as ScheduleData;

const DAY_ABBR: Record<string, string> = {
  Ponedjeljak: "PON",
  Utorak: "UTO",
  Srijeda: "SRI",
  "Četvrtak": "ČET",
  Petak: "PET",
};

const subjectMap = new Map(data.subjects.map((s) => [s.id, s]));

function getTodayIndex(): number {
  const jsDay = new Date().getDay();
  if (jsDay >= 1 && jsDay <= 5) return jsDay - 1;
  return 0;
}

type Filter = "all" | "M" | "E";

// ── Theme ─────────────────────────────────────────────────────────

function useTheme() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [dark]);

  return { dark, toggle };
}

function ThemeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-md text-muted-fg hover:text-foreground hover:bg-muted t-base transition-colors"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ── Clash detection ───────────────────────────────────────────────

function buildClashSet(): Set<string> {
  const set = new Set<string>();
  for (const day of data.days_order) {
    const slots = data.personal_schedule[day] ?? [];
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];
        if (a.start < b.end && b.start < a.end) {
          set.add(`${day}-${i}`);
          set.add(`${day}-${j}`);
        }
      }
    }
  }
  return set;
}

// ── Slot helpers ──────────────────────────────────────────────────

function slotCardClass(slot: Slot): string {
  const isExercise = slot.type === "V";
  if (slot.status === "M") return `slot-card-m${isExercise ? " exercise" : ""}`;
  return `slot-card-e${isExercise ? " exercise" : ""}`;
}

function slotSubjectClass(slot: Slot): string {
  return slot.status === "M" ? "slot-subject-m" : "slot-subject-e";
}

function getSubjectLabel(slot: Slot, compact?: boolean): string {
  const subj = subjectMap.get(slot.subject_id);
  const sem = subj?.semester ?? "II";
  if (compact) {
    const acronym = subj
      ? subj.short_name
          .split(/[\s.]+/)
          .filter(Boolean)
          .map((w) => w[0].toUpperCase())
          .join("")
      : slot.subject_id.toUpperCase();
    return `${acronym} (${sem})`;
  }
  const name = subj?.short_name ?? slot.subject_id;
  return `${name} (${sem})`;
}

// ── Slot card ─────────────────────────────────────────────────────

function SlotCard({
  slot,
  compact,
  clash,
  hideTime,
  showProf,
  onClick,
}: {
  slot: Slot;
  compact?: boolean;
  clash?: boolean;
  hideTime?: boolean;
  showProf?: boolean;
  onClick?: () => void;
}) {
  const label = getSubjectLabel(slot, compact);

  return (
    <div
      onClick={onClick}
      className={[
        slotCardClass(slot),
        clash ? "slot-clash" : "",
        compact ? "slot-cell-compact" : "slot-cell",
        onClick ? "cursor-pointer active:scale-[0.98]" : "",
        "t-base transition-[filter,transform]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          slotSubjectClass(slot),
          compact ? "text-[11px]" : "text-[12px]",
          "font-semibold leading-snug tracking-[-0.01em]",
        ].join(" ")}
      >
        {label}
      </span>

      <div
        className={[
          "text-muted-fg mt-0.5 leading-tight flex items-center",
          compact ? "text-[10px]" : "text-[11px]",
        ].join(" ")}
      >
        <span className="font-medium tabular-nums">{slot.room}</span>
        <span className="meta-sep" aria-hidden="true" />
        <span>{slot.type}{slot.group ? ` (${slot.group})` : ""}</span>
      </div>

      {showProf && (
        <div className="text-muted-fg mt-0.5 text-[11px] leading-tight">
          {slot.prof}
        </div>
      )}

      {!hideTime && !compact && (
        <div className="text-muted-fg tabular-nums font-medium mt-0.5 text-[11px]">
          {slot.start}
          <span className="opacity-40 mx-0.5">–</span>
          {slot.end}
        </div>
      )}
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────

function FilterBar({
  filter,
  setFilter,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
}) {
  const options: { value: Filter; label: string }[] = [
    { value: "all", label: "Sve" },
    { value: "M", label: "Obvezno" },
    { value: "E", label: "Fleksibilno" },
  ];

  return (
    <div className="flex gap-0.5 bg-muted rounded-md p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setFilter(o.value)}
          className={[
            "px-3 py-1.5 rounded-md text-xs font-medium t-fast transition-[background,box-shadow,color]",
            filter === o.value
              ? "segment-active text-foreground"
              : "text-muted-fg hover:text-foreground",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Toolbar buttons ───────────────────────────────────────────────

function ToolbarBtn({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={[
        "p-1.5 rounded-md t-fast transition-all",
        active
          ? "text-foreground bg-muted"
          : "text-muted-fg hover:text-foreground hover:bg-muted/60",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Day view ──────────────────────────────────────────────────────

function DayView({
  dayIdx,
  setDayIdx,
  filter,
  clashSet,
  showClashes,
  compact,
  onBack,
}: {
  dayIdx: number;
  setDayIdx: (i: number) => void;
  filter: Filter;
  clashSet: Set<string>;
  showClashes: boolean;
  compact: boolean;
  onBack?: () => void;
}) {
  const dayName = data.days_order[dayIdx];
  const slots = data.personal_schedule[dayName] ?? [];
  const filtered = filter === "all" ? slots : slots.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex border-b border-border">
        {data.days_order.map((day, i) => (
          <button
            key={day}
            onClick={() => setDayIdx(i)}
            className={[
              "flex-1 py-3 text-[11px] font-semibold tracking-[0.06em] uppercase t-fast transition-[color,box-shadow]",
              i === dayIdx
                ? "day-tab-active text-foreground"
                : "text-muted-fg hover:text-foreground",
            ].join(" ")}
          >
            {DAY_ABBR[day]}
          </button>
        ))}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] text-muted-fg hover:text-foreground mt-4 ml-4 t-base transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Tjedni pregled
        </button>
      )}

      <div className="px-4 pt-3 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-fg text-sm">Nema nastave</p>
          </div>
        ) : (
          <div className={compact ? "space-y-1" : "space-y-1.5"}>
            {filtered.map((slot, i) => {
              const origIdx = slots.indexOf(slot);
              const isClash = showClashes && clashSet.has(`${dayName}-${origIdx}`);
              return (
                <div key={`${dayIdx}-${i}`} className="flex gap-0">
                  {/* Time column */}
                  <div className="w-14 shrink-0 pt-2.5 pr-3 text-right border-r border-border-subtle">
                    <div className="text-[11px] font-semibold text-foreground tabular-nums leading-none">
                      {slot.start}
                    </div>
                    <div className="text-[10px] text-muted-fg/50 tabular-nums leading-none mt-1">
                      {slot.end}
                    </div>
                  </div>
                  {/* Card */}
                  <div className="flex-1 pl-2">
                    <SlotCard slot={slot} compact={compact} clash={isClash} hideTime showProf />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Desktop grid ──────────────────────────────────────────────────

function DesktopGrid({
  filter,
  clashSet,
  showClashes,
  compact,
  onDayClick,
  tableRef,
}: {
  filter: Filter;
  clashSet: Set<string>;
  showClashes: boolean;
  compact: boolean;
  onDayClick: (dayIdx: number) => void;
  tableRef: React.RefObject<HTMLDivElement | null>;
}) {
  const timeSlots = data.day_time_slots;

  const scheduleGrid = useMemo(() => {
    const grid: Record<string, Record<string, { slot: Slot; origIdx: number } | null>> = {};
    for (const ts of timeSlots) {
      grid[ts.start] = {};
      for (const day of data.days_order) {
        const slots = data.personal_schedule[day] ?? [];
        const origIdx = slots.findIndex(
          (s) => s.start === ts.start && (filter === "all" || s.status === filter)
        );
        if (origIdx !== -1) {
          grid[ts.start][day] = { slot: slots[origIdx], origIdx };
        } else {
          grid[ts.start][day] = null;
        }
      }
    }
    return grid;
  }, [filter, timeSlots]);

  return (
    <div className="overflow-x-auto px-4 pt-4 pb-6" ref={tableRef}>
      <div className="rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="schedule-table min-w-[680px] bg-card">
          <thead>
            <tr>
              <th className="time-col p-3 text-left">
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted-fg font-medium">
                  Sat
                </span>
              </th>
              {data.days_order.map((day, i) => (
                <th
                  key={day}
                  onClick={() => onDayClick(i)}
                  className="p-3 text-left text-[11px] font-semibold tracking-[0.05em] uppercase text-muted-fg cursor-pointer hover:text-foreground t-fast transition-colors"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((ts) => (
              <tr key={ts.start} className={compact ? "h-[48px]" : "h-[64px]"}>
                <td className="time-col p-2.5 align-top">
                  <div className="text-[11px] font-semibold text-foreground tabular-nums leading-none">
                    {ts.start}
                  </div>
                  <div className="text-[10px] text-muted-fg/60 tabular-nums leading-none mt-0.5">
                    {ts.end}
                  </div>
                </td>

                {data.days_order.map((day, dayI) => {
                  const entry = scheduleGrid[ts.start]?.[day];
                  const isClash =
                    showClashes &&
                    entry !== null &&
                    entry !== undefined &&
                    clashSet.has(`${day}-${entry.origIdx}`);

                  return (
                    <td
                      key={day}
                      className={[
                        "p-1 align-top",
                        !entry ? "cursor-pointer hover:bg-muted/40 t-fast transition-colors" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => !entry && onDayClick(dayI)}
                    >
                      {entry && (
                        <SlotCard
                          slot={entry.slot}
                          compact={compact}
                          clash={isClash}
                          onClick={() => onDayClick(dayI)}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Mobile full table ─────────────────────────────────────────────

function MobileFullTable({
  filter,
  clashSet,
  showClashes,
  tableRef,
}: {
  filter: Filter;
  clashSet: Set<string>;
  showClashes: boolean;
  tableRef: React.RefObject<HTMLDivElement | null>;
}) {
  const timeSlots = data.day_time_slots;

  const scheduleGrid = useMemo(() => {
    const grid: Record<string, Record<string, { slot: Slot; origIdx: number } | null>> = {};
    for (const ts of timeSlots) {
      grid[ts.start] = {};
      for (const day of data.days_order) {
        const slots = data.personal_schedule[day] ?? [];
        const origIdx = slots.findIndex(
          (s) => s.start === ts.start && (filter === "all" || s.status === filter)
        );
        if (origIdx !== -1) {
          grid[ts.start][day] = { slot: slots[origIdx], origIdx };
        } else {
          grid[ts.start][day] = null;
        }
      }
    }
    return grid;
  }, [filter, timeSlots]);

  return (
    <div className="overflow-x-auto px-2 pt-3 pb-6 -mx-0" ref={tableRef}>
      <div className="rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", minWidth: 680 }}>
        <table className="schedule-table bg-card" style={{ minWidth: 680 }}>
          <thead>
            <tr>
              <th className="time-col p-2 text-left">
                <span className="text-[9px] uppercase tracking-[0.08em] text-muted-fg font-medium">
                  Sat
                </span>
              </th>
              {data.days_order.map((day) => (
                <th
                  key={day}
                  className="p-2 text-left text-[9px] font-semibold tracking-[0.05em] uppercase text-muted-fg"
                >
                  {DAY_ABBR[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((ts) => (
              <tr key={ts.start} className="h-[64px]">
                <td className="time-col p-1.5 align-top">
                  <div className="text-[10px] font-semibold text-foreground tabular-nums leading-none">
                    {ts.start}
                  </div>
                  <div className="text-[9px] text-muted-fg/60 tabular-nums leading-none mt-0.5">
                    {ts.end}
                  </div>
                </td>
                {data.days_order.map((day) => {
                  const entry = scheduleGrid[ts.start]?.[day];
                  const isClash =
                    showClashes &&
                    entry !== null &&
                    entry !== undefined &&
                    clashSet.has(`${day}-${entry.origIdx}`);
                  return (
                    <td key={day} className="p-0.5 align-top">
                      {entry && (
                        <SlotCard slot={entry.slot} clash={isClash} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Legend + toolbar ───────────────────────────────────────────────

function Toolbar({
  showClashes,
  setShowClashes,
  compact,
  setCompact,
  mobileTable,
  setMobileTable,
  onExport,
  isMobile,
}: {
  showClashes: boolean;
  setShowClashes: (v: boolean) => void;
  compact: boolean;
  setCompact: (v: boolean) => void;
  mobileTable: boolean;
  setMobileTable: (v: boolean) => void;
  onExport: () => void;
  isMobile: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1 flex-wrap">
      {/* Legend */}
      <div className="flex items-center gap-3 mr-auto">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "var(--m-accent)" }} />
          <span className="text-[10px] text-muted-fg">Obvezno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "var(--e-accent)" }} />
          <span className="text-[10px] text-muted-fg">Fleksibilno</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        {/* Clash toggle */}
        <ToolbarBtn active={showClashes} onClick={() => setShowClashes(!showClashes)} label="Clashevi">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={showClashes ? "var(--clash-ring)" : "none"} stroke={showClashes ? "var(--clash-ring)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </ToolbarBtn>

        {/* Compact toggle */}
        <ToolbarBtn active={compact} onClick={() => setCompact(!compact)} label={compact ? "Normalan prikaz" : "Kompaktan prikaz"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {compact ? (
              <>
                <path d="M7 10l5 5 5-5" />
                <path d="M7 4l5 5 5-5" />
              </>
            ) : (
              <>
                <path d="M7 20l5-5 5 5" />
                <path d="M7 14l5-5 5 5" />
              </>
            )}
          </svg>
        </ToolbarBtn>

        {/* Mobile: toggle full table */}
        {isMobile && (
          <ToolbarBtn active={mobileTable} onClick={() => setMobileTable(!mobileTable)} label={mobileTable ? "Dnevni prikaz" : "Tjedna tablica"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileTable ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 3v18" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </>
              )}
            </svg>
          </ToolbarBtn>
        )}

        {/* Export */}
        <ToolbarBtn onClick={onExport} label="Spremi sliku">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </ToolbarBtn>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [dayIdx, setDayIdx] = useState(getTodayIndex);
  const [desktopDrilldown, setDD] = useState<number | null>(null);
  const [showClashes, setShowClashes] = useState(false);
  const [compact, setCompact] = useState(false);
  const [mobileTable, setMobileTable] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { dark, toggle } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const clashSet = useMemo(() => buildClashSet(), []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleDayClick = (i: number) => {
    setDD(i);
    setDayIdx(i);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => setDD(null);

  const handleExport = async () => {
    const el = tableRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--card").trim(),
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `raspored-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: try without options
      const canvas = await html2canvas(el);
      const link = document.createElement("a");
      link.download = `raspored.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto min-h-screen" ref={contentRef}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border"
        style={{ boxShadow: "var(--shadow-header)" }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[13px] font-bold tracking-[-0.02em] text-foreground leading-none">
              Raspored
            </h1>
            <p className="text-[11px] text-muted-fg mt-0.5 tracking-[0.01em]">
              FIDIT &middot; {data.meta.year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterBar filter={filter} setFilter={setFilter} />
            <ThemeToggle dark={dark} toggle={toggle} />
          </div>
        </div>
      </header>

      {/* Mobile */}
      <div className="md:hidden">
        <Toolbar
          showClashes={showClashes}
          setShowClashes={setShowClashes}
          compact={compact}
          setCompact={setCompact}
          mobileTable={mobileTable}
          setMobileTable={setMobileTable}
          onExport={handleExport}
          isMobile={true}
        />
        {mobileTable ? (
          <MobileFullTable
            filter={filter}
            clashSet={clashSet}
            showClashes={showClashes}
            tableRef={tableRef}
          />
        ) : (
          <DayView
            dayIdx={dayIdx}
            setDayIdx={setDayIdx}
            filter={filter}
            clashSet={clashSet}
            showClashes={showClashes}
            compact={compact}
          />
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div
          className={`t-slow transition-[opacity,max-height] ${
            desktopDrilldown !== null
              ? "opacity-0 max-h-0 overflow-hidden"
              : "opacity-100 max-h-[2000px]"
          }`}
        >
          <Toolbar
            showClashes={showClashes}
            setShowClashes={setShowClashes}
            compact={compact}
            setCompact={setCompact}
            mobileTable={mobileTable}
            setMobileTable={setMobileTable}
            onExport={handleExport}
            isMobile={false}
          />
          <DesktopGrid
            filter={filter}
            clashSet={clashSet}
            showClashes={showClashes}
            compact={compact}
            onDayClick={handleDayClick}
            tableRef={tableRef}
          />
        </div>
        <div
          className={`t-slow transition-[opacity,max-height] ${
            desktopDrilldown !== null
              ? "opacity-100 max-h-[2000px]"
              : "opacity-0 max-h-0 overflow-hidden"
          }`}
        >
          {desktopDrilldown !== null && (
            <div className="max-w-lg mx-auto">
              <DayView
                dayIdx={dayIdx}
                setDayIdx={setDayIdx}
                filter={filter}
                clashSet={clashSet}
                showClashes={showClashes}
                compact={compact}
                onBack={handleBack}
              />
            </div>
          )}
        </div>
      </div>

      <div className="pb-10" />
    </div>
  );
}
