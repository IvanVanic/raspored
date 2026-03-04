"use client";

import { useState } from "react";
import { data } from "@/data/schedule";
import type { Slot } from "@/data/types";
import { useTemporalContext } from "@/hooks/useTemporalContext";
import { DayView } from "@/components/schedule/DayView";
import { DesktopGrid } from "@/components/schedule/DesktopGrid";
import { CourseModal } from "@/components/schedule/CourseModal";
import { SemesterTimeline } from "@/components/timeline/SemesterTimeline";
import { CalendarView } from "@/components/calendar/CalendarView";

type View = "raspored" | "kalendar";

export default function Home() {
  const temporal = useTemporalContext();
  const [view, setView] = useState<View>("raspored");
  const [dayIdx, setDayIdx] = useState(temporal.smartDefaultDay);
  const [modalSlot, setModalSlot] = useState<Slot | null>(null);

  return (
    <div className="max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-background/85 backdrop-blur-xl border-b border-border"
        style={{ boxShadow: "var(--shadow-header)" }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[13px] font-bold tracking-[-0.02em] text-foreground leading-none">
              {view === "raspored" ? "Raspored" : "Kalendar"}
            </h1>
            <p className="text-[11px] text-muted-fg mt-0.5 tracking-[0.01em]">
              FIDIT &middot; {data.meta.year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-md overflow-hidden" style={{ background: "var(--muted)" }}>
              <button
                onClick={() => setView("raspored")}
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
                onClick={() => setView("kalendar")}
                className={`px-2.5 py-1 text-[10px] font-semibold tracking-[0.03em] t-fast transition-colors ${
                  view === "kalendar"
                    ? "bg-card text-foreground"
                    : "text-muted-fg hover:text-foreground"
                }`}
                style={view === "kalendar" ? { boxShadow: "var(--shadow-card)" } : undefined}
              >
                Kalendar
              </button>
            </div>
            {temporal.currentWeek >= 1 && temporal.currentWeek <= 15 && (
              <span className="week-badge">T{temporal.currentWeek}/15</span>
            )}
          </div>
        </div>
      </header>

      <SemesterTimeline currentWeek={temporal.currentWeek} />

      {view === "raspored" ? (
        <>
          {/* Mobile */}
          <div className="md:hidden">
            <DayView dayIdx={dayIdx} setDayIdx={setDayIdx} onSlotClick={setModalSlot} />
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <DesktopGrid onSlotClick={setModalSlot} />
          </div>
        </>
      ) : (
        <CalendarView />
      )}

      {/* Modal */}
      {modalSlot && (
        <CourseModal slot={modalSlot} onClose={() => setModalSlot(null)} />
      )}

      <div className="pb-10" />
    </div>
  );
}
