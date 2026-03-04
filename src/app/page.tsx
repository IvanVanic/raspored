"use client";

import { useState } from "react";
import { data } from "@/data/schedule";
import type { Slot } from "@/data/types";
import { useTemporalContext } from "@/hooks/useTemporalContext";
import { DayView } from "@/components/schedule/DayView";
import { DesktopGrid } from "@/components/schedule/DesktopGrid";
import { CourseModal } from "@/components/schedule/CourseModal";
import { SemesterTimeline } from "@/components/timeline/SemesterTimeline";

export default function Home() {
  const temporal = useTemporalContext();
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
              Raspored
            </h1>
            <p className="text-[11px] text-muted-fg mt-0.5 tracking-[0.01em]">
              FIDIT &middot; {data.meta.year}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: "var(--m-accent)" }}
                />
                <span className="text-[10px] text-muted-fg">Obvezno</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: "var(--e-accent)" }}
                />
                <span className="text-[10px] text-muted-fg">Fleksibilno</span>
              </div>
            </div>
            {temporal.currentWeek >= 1 && temporal.currentWeek <= 15 && (
              <span className="week-badge">T{temporal.currentWeek}/15</span>
            )}
          </div>
        </div>
      </header>

      <SemesterTimeline currentWeek={temporal.currentWeek} />

      {/* Mobile */}
      <div className="md:hidden">
        <DayView dayIdx={dayIdx} setDayIdx={setDayIdx} onSlotClick={setModalSlot} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopGrid onSlotClick={setModalSlot} />
      </div>

      {/* Modal */}
      {modalSlot && (
        <CourseModal slot={modalSlot} onClose={() => setModalSlot(null)} />
      )}

      <div className="pb-10" />
    </div>
  );
}
