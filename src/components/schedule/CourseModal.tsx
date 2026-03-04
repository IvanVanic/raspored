"use client";

import { useState } from "react";
import type { Slot } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { getCurrentWeek, daysUntil, formatHrDate } from "@/lib/date-utils";
import { extractCriticalDates } from "@/lib/extraction";
import { TYPE_LABEL, EVENT_COLOR } from "@/lib/labels";
import { useKeyboard } from "@/hooks/useKeyboard";
import { MetaSep } from "@/components/shared/MetaSep";
import type { CurriculumEntry } from "@/data/types";
import { useEffect, useRef } from "react";

type Tab = "sada" | "plan" | "rokovi";

export function CourseModal({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  const subj = subjectMap.get(slot.subject_id);
  const curr = curriculum[slot.subject_id];
  const currentWeek = getCurrentWeek();
  const [tab, setTab] = useState<Tab>("sada");
  const planRef = useRef<HTMLDivElement>(null);

  useKeyboard("Escape", onClose);

  // Auto-scroll to current week when Plan tab opens
  useEffect(() => {
    if (tab === "plan" && planRef.current) {
      const activeRow = planRef.current.querySelector("[data-current='true']");
      if (activeRow) {
        activeRow.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [tab]);

  // Extract critical dates for Rokovi tab
  const criticalDates = curr
    ? extractCriticalDates({ [slot.subject_id]: curr as CurriculumEntry })
    : [];
  const nonIspit = criticalDates.filter(d => d.type !== "ispit");
  const ispiti = criticalDates.filter(d => d.type === "ispit");

  // Urgency badge
  const upcoming = nonIspit.filter(d => d.date && daysUntil(d.date) >= 0);
  const mostUrgent = upcoming.sort((a, b) => {
    const da = a.date ? daysUntil(a.date) : 999;
    const db = b.date ? daysUntil(b.date) : 999;
    return da - db;
  })[0];

  const TABS: { id: Tab; label: string }[] = [
    { id: "sada", label: "Sada" },
    { id: "plan", label: "Plan" },
    { id: "rokovi", label: "Rokovi" },
  ];

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-fg/30" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-0 border-b border-border">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-[15px] font-bold text-foreground leading-snug">
              {subj?.full_name ?? slot.subject_id}
            </h2>
            {mostUrgent && (
              <span
                className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: EVENT_COLOR[mostUrgent.type] + "22",
                  color: EVENT_COLOR[mostUrgent.type],
                  border: `1px solid ${EVENT_COLOR[mostUrgent.type]}44`,
                }}
              >
                {mostUrgent.date
                  ? `${TYPE_LABEL[mostUrgent.type]} za ${daysUntil(mostUrgent.date)}d`
                  : TYPE_LABEL[mostUrgent.type]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-fg flex-wrap">
            <span className="font-medium">{slot.start}–{slot.end}</span>
            <MetaSep />
            <span>{slot.type === "P" ? "Predavanje" : "Vježbe"}</span>
            <MetaSep />
            <span>{slot.prof}</span>
            <MetaSep />
            <span>{slot.room}</span>
            {subj && (
              <>
                <MetaSep />
                <span>Sem. {subj.semester}</span>
              </>
            )}
            {slot.group && (
              <>
                <MetaSep />
                <span>G{slot.group}</span>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-[11px] font-semibold tracking-[0.04em] t-fast transition-[color,box-shadow] ${
                  tab === t.id
                    ? "text-foreground"
                    : "text-muted-fg hover:text-foreground"
                }`}
                style={
                  tab === t.id
                    ? { boxShadow: "inset 0 -2px 0 0 var(--foreground)" }
                    : undefined
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {/* SADA */}
          {tab === "sada" && curr && (
            <div className="px-5 py-4 space-y-4">
              {/* Current week topic */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
                  Tjedan {currentWeek} — {slot.type === "P" ? "Predavanje" : "Vježbe"}
                </p>
                {curr.weeks[currentWeek - 1] ? (
                  <p className="text-[13px] text-foreground font-medium">
                    {slot.type === "P"
                      ? curr.weeks[currentWeek - 1].lecture
                      : curr.weeks[currentWeek - 1].exercise}
                  </p>
                ) : (
                  <p className="text-[12px] text-muted-fg">Nema podataka za ovaj tjedan.</p>
                )}
              </div>

              {/* Grading */}
              {curr.grading.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
                    Vrednovanje
                  </p>
                  <div className="space-y-1">
                    {curr.grading.map((g, i) => (
                      <div key={i} className="flex items-baseline justify-between text-[12px]">
                        <div>
                          <span className="text-foreground">{g.component}</span>
                          {g.note && (
                            <span className="text-muted-fg ml-2 text-[10px]">{g.note}</span>
                          )}
                        </div>
                        <span className="text-muted-fg tabular-nums ml-4">{g.maxPoints} bod.</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-[11px] pt-1 border-t border-border-subtle">
                      <span className="text-muted-fg">Ukupno</span>
                      <span className="text-foreground tabular-nums font-semibold">
                        {curr.grading.reduce((s, g) => s + g.maxPoints, 0)} bod.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PLAN */}
          {tab === "plan" && curr && (
            <div className="py-2" ref={planRef}>
              {curr.weeks.map((w) => (
                <div
                  key={w.week}
                  data-current={w.week === currentWeek ? "true" : "false"}
                  className={`flex items-start gap-3 py-2 px-5 text-[12px] ${
                    w.week === currentWeek
                      ? "bg-m-tint-strong"
                      : w.week < currentWeek
                      ? "opacity-40"
                      : ""
                  }`}
                >
                  <span
                    className="w-5 shrink-0 text-right tabular-nums text-[11px] mt-0.5"
                    style={{
                      color: w.week === currentWeek ? "var(--m-text)" : "var(--muted-fg)",
                      fontWeight: w.week === currentWeek ? 700 : 400,
                    }}
                  >
                    {w.week}.
                  </span>
                  <div className="min-w-0">
                    <div
                      className={w.week === currentWeek ? "text-m-text font-semibold" : "text-foreground"}
                    >
                      {w.lecture}
                    </div>
                    {w.exercise && w.exercise !== w.lecture && (
                      <div className="text-[11px] text-muted-fg mt-0.5">V: {w.exercise}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ROKOVI */}
          {tab === "rokovi" && (
            <div className="px-5 py-4 space-y-4">
              {/* Upcoming non-ispit events */}
              {nonIspit.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
                    Provjere
                  </p>
                  <div className="space-y-1.5">
                    {nonIspit.map((cd, i) => {
                      const days = cd.date ? daysUntil(cd.date) : null;
                      const isPast = days !== null && days < 0;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 py-2 px-3 rounded-md ${isPast ? "opacity-40" : ""}`}
                          style={{
                            background: days !== null && days >= 0 && days <= 7
                              ? "color-mix(in srgb, var(--u-critical-tint) 80%, transparent)"
                              : "var(--muted)",
                          }}
                        >
                          <span
                            className="urgency-dot shrink-0"
                            style={{ background: EVENT_COLOR[cd.type] }}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[12px] font-semibold text-foreground">
                              {TYPE_LABEL[cd.type]}
                            </span>
                            {cd.date && (
                              <span className="text-[11px] text-muted-fg ml-2 tabular-nums">
                                {formatHrDate(cd.date)}
                              </span>
                            )}
                            {!cd.date && (
                              <span className="text-[11px] text-muted-fg ml-2">T{cd.week}</span>
                            )}
                          </div>
                          {days !== null && days >= 0 && (
                            <span
                              className="text-[11px] font-semibold tabular-nums shrink-0"
                              style={{ color: EVENT_COLOR[cd.type] }}
                            >
                              {days === 0 ? "danas" : days === 1 ? "sutra" : `za ${days}d`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exam dates */}
              {curr && curr.exams.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
                    Ispitni rokovi
                  </p>
                  <div className="space-y-1">
                    {curr.exams.map((e, i) => {
                      const dateObj = ispiti.find(d => d.label.includes(e.replace(".", "")))?.date ?? null;
                      const days = dateObj ? daysUntil(dateObj) : null;
                      const isPast = days !== null && days < 0;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between py-1.5 px-3 rounded-md ${isPast ? "opacity-35" : ""}`}
                          style={{ background: "var(--muted)" }}
                        >
                          <span className="text-[12px] text-foreground tabular-nums">{e}</span>
                          {days !== null && days >= 0 && (
                            <span className="text-[11px] text-muted-fg tabular-nums">
                              {days === 0 ? "danas" : `za ${days}d`}
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] text-muted-fg">prošlo</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {nonIspit.length === 0 && (!curr || curr.exams.length === 0) && (
                <div className="null-state">
                  <p>Nema rokova za ovaj kolegij.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <div className="md:hidden px-5 py-3 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-[12px] font-semibold text-muted-fg bg-muted rounded-lg hover:text-foreground t-fast transition-colors"
          >
            Zatvori
          </button>
        </div>

        {/* Close button desktop */}
        <div className="hidden md:block absolute top-3 right-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-fg hover:text-foreground hover:bg-muted t-fast transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
