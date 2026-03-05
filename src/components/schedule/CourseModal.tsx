"use client";

import { useState, useEffect, useRef } from "react";
import type { Slot, CurriculumEntry } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { getCurrentWeek, daysUntil, formatHrDate, getWeekDates, formatShortDate } from "@/lib/date-utils";
import { extractCriticalDates } from "@/lib/extraction";
import { TYPE_LABEL, EVENT_COLOR } from "@/lib/labels";
import { useKeyboard } from "@/hooks/useKeyboard";
import { resources } from "@/data/resources";
import type { ResourceLink } from "@/data/resources";

type Tab = "sada" | "plan" | "rokovi" | "resursi";

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
    { id: "resursi", label: "Resursi" },
  ];

  // Resources for current subject
  const subjectResources = resources[slot.subject_id] ?? {};
  const resourceWeeks = Object.keys(subjectResources)
    .map(Number)
    .sort((a, b) => a - b);

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
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums bg-muted text-foreground">
              {slot.start}–{slot.end}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
              {slot.type === "P" ? "Predavanje" : "Vježbe"}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
              {slot.room}
            </span>
            {subj && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                Sem. {subj.semester}
              </span>
            )}
            {slot.group && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                G{slot.group}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg truncate max-w-[160px]">
              {slot.prof}
            </span>
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
          {tab === "sada" && curr && (() => {
            const totalPoints = curr.grading.reduce((s, g) => s + g.maxPoints, 0);
            const topicText = curr.weeks[currentWeek - 1]
              ? (slot.type === "P" ? curr.weeks[currentWeek - 1].lecture : curr.weeks[currentWeek - 1].exercise)
              : null;
            return (
              <div className="px-5 py-4 space-y-5">
                {/* Current week topic — inset card */}
                <div className="rounded-lg p-3.5" style={{ background: "var(--muted)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg mb-1.5">
                    Tjedan {currentWeek} &mdash; {slot.type === "P" ? "Predavanje" : "Vježbe"}
                  </p>
                  {topicText ? (
                    <p className="text-[14px] text-foreground font-semibold leading-snug">
                      {topicText}
                    </p>
                  ) : (
                    <p className="text-[12px] text-muted-fg">Nema podataka za ovaj tjedan.</p>
                  )}
                </div>

                {/* Grading — bar chart rows */}
                {curr.grading.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg mb-3">
                      Vrednovanje
                    </p>
                    <div className="space-y-2.5">
                      {curr.grading.map((g, i) => {
                        const pct = totalPoints > 0 ? (g.maxPoints / totalPoints) * 100 : 0;
                        return (
                          <div key={i}>
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="text-[12px] text-foreground font-medium">{g.component}</span>
                              <span className="text-[12px] tabular-nums font-semibold text-foreground ml-4">{g.maxPoints}</span>
                            </div>
                            {g.note && (
                              <p className="text-[10px] text-muted-fg mb-1">{g.note}</p>
                            )}
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: "var(--m-accent)",
                                  opacity: 0.7,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      className="flex justify-between items-center text-[11px] mt-3 pt-2.5"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <span className="text-muted-fg uppercase tracking-[0.06em] font-semibold">Ukupno</span>
                      <span className="text-foreground tabular-nums font-bold text-[14px]">
                        {totalPoints} <span className="text-muted-fg text-[11px] font-normal">bod.</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* PLAN */}
          {tab === "plan" && curr && (
            <div className="py-3 px-5" ref={planRef}>
              {curr.weeks.map((w, idx) => {
                const isCurrent = w.week === currentWeek;
                const isPast = w.week < currentWeek;
                const isLast = idx === curr.weeks.length - 1;
                const { monday, friday } = getWeekDates(w.week);
                const dateRange = `${formatShortDate(monday)}–${formatShortDate(friday)}`;
                const lecture = w.lecture ?? "";
                const exercise = w.exercise && w.exercise !== w.lecture ? w.exercise : "";
                const combined = lecture.length + exercise.length < 60 && exercise.length > 0;
                return (
                  <div
                    key={w.week}
                    data-current={isCurrent ? "true" : "false"}
                    className="flex items-stretch gap-3"
                    style={{ opacity: isPast ? 0.38 : 1 }}
                  >
                    {/* Timeline rail */}
                    <div className="flex flex-col items-center" style={{ width: 20, flexShrink: 0 }}>
                      <div
                        style={{
                          width: isCurrent ? 10 : 6,
                          height: isCurrent ? 10 : 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          marginTop: isCurrent ? 3 : 5,
                          background: isCurrent
                            ? "var(--m-accent)"
                            : isPast
                            ? "var(--border)"
                            : "var(--muted-fg)",
                          boxShadow: isCurrent ? "0 0 0 3px color-mix(in srgb, var(--m-accent) 25%, transparent)" : "none",
                        }}
                      />
                      {!isLast && (
                        <div
                          style={{
                            flex: 1,
                            width: 1,
                            marginTop: 3,
                            background: isCurrent
                              ? "color-mix(in srgb, var(--m-accent) 40%, transparent)"
                              : "var(--border)",
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-3" style={{ paddingTop: isCurrent ? 0 : 2 }}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] font-bold tabular-nums tracking-[0.05em] uppercase"
                          style={{ color: isCurrent ? "var(--m-text)" : "var(--muted-fg)" }}
                        >
                          T{w.week}
                        </span>
                        <span className="text-[9px] text-muted-fg tabular-nums" style={{ color: "var(--muted-fg)" }}>
                          {dateRange}
                        </span>
                        {isCurrent && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                            style={{
                              background: "color-mix(in srgb, var(--m-accent) 20%, transparent)",
                              color: "var(--m-text)",
                            }}
                          >
                            Sada
                          </span>
                        )}
                      </div>

                      <div
                        className="rounded-md"
                        style={isCurrent ? {
                          background: "color-mix(in srgb, var(--m-tint-strong) 85%, var(--muted) 15%)",
                          border: "2px solid color-mix(in srgb, var(--m-accent) 50%, transparent)",
                          padding: "8px 10px",
                          marginBottom: 4,
                        } : { paddingBottom: 2 }}
                      >
                        {combined ? (
                          <p
                            className="text-[12px] leading-snug"
                            style={{
                              color: "var(--foreground)",
                              fontWeight: isCurrent ? 600 : 400,
                            }}
                          >
                            P: {lecture} · <span style={{ color: "var(--muted-fg)" }}>V: {exercise}</span>
                          </p>
                        ) : (
                          <>
                            <p
                              className="text-[12px] leading-snug"
                              style={{
                                color: "var(--foreground)",
                                fontWeight: isCurrent ? 600 : 400,
                              }}
                            >
                              {lecture}
                            </p>
                            {exercise && (
                              <p className="text-[11px] mt-1" style={{ color: "var(--muted-fg)" }}>
                                V: {exercise}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

          {/* RESURSI */}
          {tab === "resursi" && (
            <div className="px-5 py-4 space-y-4">
              {resourceWeeks.length === 0 ? (
                <div className="null-state">
                  <p>Nema resursa za ovaj kolegij.</p>
                </div>
              ) : (
                resourceWeeks.map(weekNum => {
                  const links: ResourceLink[] = subjectResources[weekNum] ?? [];
                  const isCurrentWeek = weekNum === currentWeek;
                  return (
                    <div key={weekNum}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.06em]"
                          style={{ color: isCurrentWeek ? "var(--m-text)" : "var(--muted-fg)" }}
                        >
                          T{weekNum}
                        </span>
                        {isCurrentWeek && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                            style={{
                              background: "color-mix(in srgb, var(--m-accent) 20%, transparent)",
                              color: "var(--m-text)",
                            }}
                          >
                            Sada
                          </span>
                        )}
                      </div>
                      <div
                        className="rounded-md overflow-hidden"
                        style={{
                          background: isCurrentWeek
                            ? "color-mix(in srgb, var(--m-tint-strong) 85%, var(--muted) 15%)"
                            : "var(--muted)",
                          border: isCurrentWeek
                            ? "2px solid color-mix(in srgb, var(--m-accent) 50%, transparent)"
                            : "1px solid transparent",
                        }}
                      >
                        {links.map((link, li) => (
                          <a
                            key={li}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-link flex items-center justify-between gap-2 px-3 py-2 t-fast transition-colors"
                            style={{
                              borderTop: li > 0 ? "1px solid var(--border)" : undefined,
                              color: "var(--foreground)",
                              textDecoration: "none",
                            }}
                          >
                            <span className="text-[12px] leading-snug min-w-0 truncate">
                              {link.label}
                            </span>
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="shrink-0 opacity-40"
                              aria-hidden="true"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })
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
