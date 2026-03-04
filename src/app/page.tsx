"use client";

import { useState } from "react";
import { data } from "@/data/schedule";
import type { Slot } from "@/data/types";
import { useTemporalContext } from "@/hooks/useTemporalContext";
import { TopBar } from "@/components/layout/TopBar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { DayView } from "@/components/schedule/DayView";
import { DesktopGrid } from "@/components/schedule/DesktopGrid";
import { CourseModal } from "@/components/schedule/CourseModal";
import { NextClassStrip } from "@/components/schedule/NextClassStrip";
import { SemesterTimeline } from "@/components/timeline/SemesterTimeline";
import { CalendarView } from "@/components/calendar/CalendarView";

type View = "raspored" | "kalendar";

export default function Home() {
  const temporal = useTemporalContext();
  const [view, setView] = useState<View>("raspored");
  const [dayIdx, setDayIdx] = useState(temporal.smartDefaultDay);
  const [modalSlot, setModalSlot] = useState<Slot | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="max-w-5xl mx-auto min-h-screen pb-20 md:pb-0">
      <TopBar
        view={view}
        onViewChange={setView}
        currentWeek={temporal.currentWeek}
        year={data.meta.year}
        onWeekBadgeTap={() => setTimelineOpen(true)}
      />

      {/* "What's next" strip — mobile only, schedule view */}
      {view === "raspored" && (
        <div className="md:hidden">
          <NextClassStrip currentMinutes={currentMinutes} onTap={setModalSlot} />
        </div>
      )}

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

      {/* Course modal */}
      {modalSlot && (
        <CourseModal slot={modalSlot} onClose={() => setModalSlot(null)} />
      )}

      {/* Semester timeline — bottom sheet */}
      <SemesterTimeline
        currentWeek={temporal.currentWeek}
        isOpen={timelineOpen}
        onClose={() => setTimelineOpen(false)}
      />

      {/* Bottom tab bar — mobile only */}
      <BottomTabBar view={view} onViewChange={setView} />
    </div>
  );
}
