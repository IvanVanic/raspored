"use client";

import type { Slot } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { curriculum, getCurrentWeek } from "@/data/curriculum";
import { useKeyboard } from "@/hooks/useKeyboard";
import { MetaSep } from "@/components/shared/MetaSep";

export function CourseModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const subj = subjectMap.get(slot.subject_id);
  const curr = curriculum[slot.subject_id];
  const currentWeek = getCurrentWeek();

  useKeyboard("Escape", onClose);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-fg/30" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            {subj?.full_name ?? slot.subject_id}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-fg">
            <span>{slot.type === "P" ? "Predavanje" : "Vježbe"}</span>
            <MetaSep />
            <span>{slot.prof}</span>
            <MetaSep />
            <span>Prostorija {slot.room}</span>
          </div>
          {subj && (
            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-fg">
              <span>Semestar {subj.semester}</span>
              {slot.group && (
                <>
                  <MetaSep />
                  <span>Grupa {slot.group}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Curriculum weeks */}
        {curr && (
          <div className="px-5 py-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
              Nastavni plan
            </h3>
            <div className="space-y-1">
              {curr.weeks.map((w) => (
                <div
                  key={w.week}
                  className={`flex items-start gap-3 py-1.5 px-2 rounded-md text-[12px] ${
                    w.week === currentWeek
                      ? "bg-m-tint-strong text-foreground"
                      : "text-muted-fg"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right font-semibold tabular-nums">
                    {w.week}.
                  </span>
                  <div className="min-w-0">
                    <div className={w.week === currentWeek ? "text-m-text font-medium" : ""}>
                      {w.lecture}
                    </div>
                    {w.exercise && w.exercise !== w.lecture && (
                      <div className="text-[11px] opacity-70 mt-0.5">V: {w.exercise}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grading */}
        {curr && curr.grading.length > 0 && (
          <div className="px-5 py-3 border-t border-border-subtle">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
              Vrednovanje
            </h3>
            <div className="space-y-1">
              {curr.grading.map((g, i) => (
                <div key={i} className="flex justify-between text-[12px]">
                  <span className="text-foreground">{g.component}</span>
                  <span className="text-muted-fg tabular-nums">{g.maxPoints} bod.</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams */}
        {curr && curr.exams.length > 0 && (
          <div className="px-5 py-3 border-t border-border-subtle">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
              Ispitni rokovi
            </h3>
            <div className="flex flex-wrap gap-2">
              {curr.exams.map((e, i) => (
                <span
                  key={i}
                  className="text-[12px] text-foreground tabular-nums bg-muted px-2 py-0.5 rounded"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close button desktop */}
        <div className="hidden md:block absolute top-3 right-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-fg hover:text-foreground hover:bg-muted t-fast transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
