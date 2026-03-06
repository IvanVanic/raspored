"use client";

import { useState, useEffect } from "react";
import type { Slot, CurriculumEntry, CriticalDate } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { getCurrentWeek, daysUntil, formatHrDate, getWeekDates, formatShortDate } from "@/lib/date-utils";
import { extractCriticalDates } from "@/lib/extraction";
import { TYPE_LABEL, EVENT_COLOR, TEST_TYPES, getCourseColor } from "@/lib/labels";
import { getTestTopics, countCheckableItems } from "@/lib/test-topics";
import { getProgress, toggleTopic as toggleTopicStorage, getCompletion } from "@/lib/study-progress";
import { useKeyboard } from "@/hooks/useKeyboard";
import { resources } from "@/data/resources";
import type { ResourceLink } from "@/data/resources";

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "pregled" | "rokovi";

interface CourseModalProps {
  slot: Slot | null;
  subjectId?: string;
  initialTab?: "sada" | "plan" | "rokovi" | "resursi" | Tab;
  initialTestExpand?: CriticalDate;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function daysLabel(days: number): string {
  if (days === 0) return "danas";
  if (days === 1) return "sutra";
  return `za ${days}d`;
}

function CheckSvg({ color }: { color: string }) {
  return (
    <svg
      className="prep-check-mark"
      width="9" height="9" viewBox="0 0 9 9"
      fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ color }}
    >
      <polyline points="1.5,4.5 3.5,6.5 7.5,2" />
    </svg>
  );
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function GradingBar({ grading }: { grading: CurriculumEntry["grading"] }) {
  const [expanded, setExpanded] = useState(false);
  const total = grading.reduce((s, g) => s + g.maxPoints, 0);

  return (
    <div>
      {/* Stacked proportion bar — tap to expand detail */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left"
        style={{ WebkitTapHighlightColor: "transparent" }}
        aria-label="Vrednovanje"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg">
            Vrednovanje
          </span>
          <span
            className="text-[10px] font-semibold tabular-nums text-muted-fg"
            style={{ transition: "transform 150ms var(--ease-out-expo)", display: "inline-block", transform: expanded ? "rotate(180deg)" : "none" }}
          >
            {expanded ? "▴" : "▾"}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: "var(--border)" }}>
          {grading.map((g, i) => {
            const pct = total > 0 ? (g.maxPoints / total) * 100 : 0;
            const opacity = 0.45 + (i % 4) * 0.13;
            return (
              <div
                key={i}
                style={{
                  width: `${pct}%`,
                  background: "var(--m-accent)",
                  opacity,
                  borderRight: i < grading.length - 1 ? "1px solid var(--card)" : undefined,
                }}
              />
            );
          })}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-2 space-y-0" style={{ animation: "row-in 150ms var(--ease-out-expo) both" }}>
          {grading.map((g, i) => {
            const pct = total > 0 ? Math.round((g.maxPoints / total) * 100) : 0;
            return (
              <div
                key={i}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: i < grading.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "var(--m-accent)", opacity: 0.45 + (i % 4) * 0.13 }}
                  />
                  <span className="text-[12px] text-foreground truncate">{g.component}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-[10px] tabular-nums text-muted-fg">{pct}%</span>
                  <span className="text-[12px] tabular-nums font-bold text-foreground w-8 text-right">{g.maxPoints}</span>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-[10px] text-muted-fg uppercase tracking-[0.06em] font-semibold">Ukupno</span>
            <span className="text-[13px] text-foreground tabular-nums font-bold">
              {total} <span className="text-muted-fg text-[10px] font-normal">bod.</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function WeekStrip({
  curr,
  currentWeek,
  slotType,
}: {
  curr: CurriculumEntry;
  currentWeek: number;
  slotType: "P" | "V";
}) {
  // Show current + next 2 weeks that have content
  const upcoming = curr.weeks
    .filter(w => w.week >= currentWeek)
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg mb-2">
        Nadolazeće teme
      </p>
      <div className="space-y-0 rounded-lg overflow-hidden" style={{ background: "var(--muted)" }}>
        {upcoming.map((w, idx) => {
          const isCurrent = w.week === currentWeek;
          const topic = slotType === "P" ? w.lecture : w.exercise;
          const { monday } = getWeekDates(w.week);
          const dateLabel = formatShortDate(monday);

          return (
            <div
              key={w.week}
              className="flex items-center gap-3 px-3"
              style={{
                minHeight: 48,
                borderBottom: idx < upcoming.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                background: isCurrent ? "color-mix(in srgb, var(--m-tint-strong) 85%, var(--muted) 15%)" : undefined,
              }}
            >
              <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
                <span
                  className="text-[10px] font-bold tabular-nums uppercase tracking-[0.05em]"
                  style={{ color: isCurrent ? "var(--m-text)" : "var(--muted-fg)" }}
                >
                  T{w.week}
                </span>
                <span className="text-[9px] tabular-nums" style={{ color: "var(--muted-fg)", opacity: 0.6 }}>
                  {dateLabel}
                </span>
              </div>
              <div className="flex-1 min-w-0 py-2">
                <p
                  className="text-[12px] leading-snug truncate"
                  style={{ color: isCurrent ? "var(--foreground)" : "var(--muted-fg)", fontWeight: isCurrent ? 600 : 400 }}
                >
                  {topic ?? "(nema podataka)"}
                </p>
              </div>
              {isCurrent && (
                <span
                  className="shrink-0 text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                  style={{ background: "color-mix(in srgb, var(--m-accent) 20%, transparent)", color: "var(--m-text)" }}
                >
                  Sada
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourceRow({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 t-fast transition-colors"
      style={{
        minHeight: 48,
        color: "var(--foreground)",
        textDecoration: "none",
      }}
    >
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0" style={{ color: "var(--e-text)", opacity: 0.7 }}
        aria-hidden="true"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      <span className="text-[13px] leading-snug flex-1 min-w-0">{link.label}</span>
      <svg
        width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0 opacity-30" aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </a>
  );
}

function TestCard({
  cd,
  curr,
  allDates,
  onToggleTopic,
  progressVersion,
}: {
  cd: CriticalDate;
  curr: CurriculumEntry;
  allDates: CriticalDate[];
  onToggleTopic: (subjectId: string, type: string, week: number, topicKey: string) => void;
  progressVersion: number;
}) {
  const [open, setOpen] = useState(false);
  const days = cd.date ? daysUntil(cd.date) : null;
  const isPast = days !== null && days < 0;
  const isSoon = days !== null && days >= 0 && days <= 7;
  const eventColor = EVENT_COLOR[cd.type];
  const isTest = TEST_TYPES.has(cd.type);

  const topics = isTest ? getTestTopics(curr, cd, allDates) : [];
  const total = countCheckableItems(topics);
  const completion = isTest && total > 0
    ? getCompletion(cd.subjectId, cd.type, cd.week, total)
    : null;
  void progressVersion;

  const pct = completion && total > 0 ? (completion.done / total) * 100 : 0;
  const progress = isTest ? getProgress(cd.subjectId, cd.type, cd.week) : null;

  // Find points for this component from grading
  const label = TYPE_LABEL[cd.type].toLowerCase();
  let points: number | null = null;
  for (const g of curr.grading) {
    if (g.component.toLowerCase().includes(label)) { points = g.maxPoints; break; }
  }

  return (
    <div style={{ opacity: isPast ? 0.4 : 1 }}>
      {/* Row */}
      <button
        onClick={() => isTest && setOpen(v => !v)}
        className="w-full text-left flex items-center gap-3 px-3"
        style={{
          minHeight: 52,
          borderLeft: `3px solid ${eventColor}`,
          background: isSoon
            ? "color-mix(in srgb, var(--u-critical-tint) 80%, transparent)"
            : "var(--muted)",
          cursor: isTest ? "pointer" : "default",
          WebkitTapHighlightColor: "transparent",
        }}
        disabled={!isTest}
      >
        {/* Type + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-foreground">{TYPE_LABEL[cd.type]}</span>
            {cd.date && (
              <span className="text-[11px] text-muted-fg tabular-nums">{formatHrDate(cd.date)}</span>
            )}
            {!cd.date && (
              <span className="text-[11px] text-muted-fg">T{cd.week}</span>
            )}
          </div>
          {/* Progress bar underneath if test */}
          {isTest && completion && total > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: pct === 100 ? "var(--m-accent)" : eventColor,
                    borderRadius: 9999,
                    transition: "width 200ms var(--ease-out-expo)",
                  }}
                />
              </div>
              <span className="text-[10px] tabular-nums shrink-0" style={{ color: "var(--muted-fg)" }}>
                {completion.done}/{total}
              </span>
            </div>
          )}
        </div>

        {/* Right: countdown + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {days !== null && days >= 0 && (
            <span
              className="text-[11px] font-bold tabular-nums px-2 py-1 rounded-md"
              style={{
                color: isSoon ? "var(--u-critical)" : eventColor,
                background: isSoon
                  ? "color-mix(in srgb, var(--u-critical) 12%, transparent)"
                  : "color-mix(in srgb, var(--border) 80%, transparent)",
              }}
            >
              {daysLabel(days)}
            </span>
          )}
          {isTest && (
            <span
              className="text-muted-fg"
              style={{
                fontSize: 11,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 150ms var(--ease-out-expo)",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          )}
        </div>
      </button>

      {/* Expanded checklist */}
      {open && isTest && progress !== null && (
        <div
          className="px-3 pt-3 pb-2"
          style={{
            background: "color-mix(in srgb, var(--card) 90%, transparent)",
            borderLeft: `3px solid color-mix(in srgb, ${eventColor} 40%, transparent)`,
            animation: "row-in 150ms var(--ease-out-expo) both",
          }}
        >
          {/* Stats row */}
          {completion && total > 0 && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                {points !== null && (
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: eventColor }}>
                    {points}
                    <span className="text-[10px] font-semibold ml-0.5 text-muted-fg">bod.</span>
                  </span>
                )}
                <span className="text-[11px] tabular-nums text-muted-fg">
                  {completion.done}/{total} obrađeno
                </span>
              </div>
              <span
                className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                style={{
                  background: pct === 100
                    ? "color-mix(in srgb, var(--m-accent) 20%, transparent)"
                    : `color-mix(in srgb, ${eventColor} 12%, transparent)`,
                  color: pct === 100 ? "var(--m-text)" : eventColor,
                }}
              >
                {Math.round(pct)}%
              </span>
            </div>
          )}

          {/* Segmented track */}
          {completion && total > 0 && total <= 20 && (
            <div className="flex gap-0.5 mb-3" style={{ height: 3 }}>
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    background: i < completion.done ? eventColor : "var(--border)",
                    transition: `background 200ms ${i * 30}ms`,
                    opacity: i < completion.done ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          )}

          {/* Topic checklist */}
          <div className="space-y-2">
            {topics.map(topic => {
              if (topic.isHoliday) {
                return (
                  <div key={topic.week} className="flex items-center gap-2 py-1 opacity-25">
                    <div className="flex-1" style={{ height: 1, background: "var(--border-subtle)" }} />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-fg">
                      T{topic.week} · praznik
                    </span>
                    <div className="flex-1" style={{ height: 1, background: "var(--border-subtle)" }} />
                  </div>
                );
              }

              const { monday, friday } = getWeekDates(topic.week);
              const dateRange = `${formatShortDate(monday)}–${formatShortDate(friday)}`;
              const lectureKey = `w${topic.week}:p`;
              const exerciseKey = `w${topic.week}:v`;
              const lectureChecked = !!progress.checked[lectureKey];
              const exerciseChecked = !!progress.checked[exerciseKey];

              return (
                <div
                  key={topic.week}
                  style={{
                    paddingLeft: 10,
                    borderLeft: `2px solid color-mix(in srgb, ${eventColor} 25%, transparent)`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold tabular-nums tracking-[0.06em] uppercase"
                      style={{ color: eventColor, opacity: 0.7 }}
                    >
                      T{topic.week}
                    </span>
                    <span className="text-[9px] tabular-nums text-muted-fg">{dateRange}</span>
                  </div>

                  <label
                    className="prep-check"
                    data-checked={lectureChecked ? "true" : "false"}
                    style={{
                      opacity: lectureChecked ? 0.45 : 1,
                      transition: "opacity 200ms var(--ease-out-expo)",
                      "--check-color": eventColor,
                    } as React.CSSProperties}
                  >
                    <input
                      type="checkbox"
                      checked={lectureChecked}
                      onChange={() => onToggleTopic(cd.subjectId, cd.type, cd.week, lectureKey)}
                    />
                    <span className="prep-check-box" aria-hidden="true">
                      <CheckSvg color={eventColor} />
                    </span>
                    <span className="flex-1 text-[12px] leading-snug">
                      <span
                        className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] mr-1.5 px-1 py-px rounded"
                        style={{ background: "color-mix(in srgb, var(--m-accent) 15%, transparent)", color: "var(--m-text)", verticalAlign: "1px" }}
                      >P</span>
                      <span style={{
                        textDecoration: lectureChecked ? "line-through" : "none",
                        textDecorationColor: "var(--muted-fg)",
                        color: lectureChecked ? "var(--muted-fg)" : "var(--foreground)",
                      }}>{topic.lecture}</span>
                    </span>
                  </label>

                  <label
                    className="prep-check"
                    data-checked={exerciseChecked ? "true" : "false"}
                    style={{
                      opacity: exerciseChecked ? 0.45 : 1,
                      transition: "opacity 200ms var(--ease-out-expo)",
                      "--check-color": eventColor,
                    } as React.CSSProperties}
                  >
                    <input
                      type="checkbox"
                      checked={exerciseChecked}
                      onChange={() => onToggleTopic(cd.subjectId, cd.type, cd.week, exerciseKey)}
                    />
                    <span className="prep-check-box" aria-hidden="true">
                      <CheckSvg color={eventColor} />
                    </span>
                    <span className="flex-1 text-[12px] leading-snug">
                      <span
                        className="inline-block text-[9px] font-bold uppercase tracking-[0.1em] mr-1.5 px-1 py-px rounded"
                        style={{ background: "color-mix(in srgb, var(--e-accent) 15%, transparent)", color: "var(--e-text)", verticalAlign: "1px" }}
                      >V</span>
                      <span style={{
                        textDecoration: exerciseChecked ? "line-through" : "none",
                        textDecorationColor: "var(--muted-fg)",
                        color: exerciseChecked ? "var(--muted-fg)" : "var(--foreground)",
                      }}>{topic.exercise}</span>
                    </span>
                  </label>
                </div>
              );
            })}

            {topics.length === 0 && (
              <p className="text-[11px] text-muted-fg py-1">Nema tema za prikaz.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function CourseModal({
  slot,
  subjectId: propSubjectId,
  initialTab,
  initialTestExpand,
  onClose,
}: CourseModalProps) {
  const effectiveSubjectId = slot?.subject_id ?? propSubjectId ?? "";
  const curriculumId = effectiveSubjectId.toUpperCase();
  const subj = subjectMap.get(effectiveSubjectId);
  const curr = curriculum[curriculumId] as CurriculumEntry | undefined;
  const currentWeek = getCurrentWeek();
  const courseColor = getCourseColor(effectiveSubjectId);

  // Map legacy tab names to new 2-tab system
  const resolveTab = (t: string | undefined): Tab => {
    if (t === "rokovi") return "rokovi";
    return "pregled";
  };
  const [tab, setTab] = useState<Tab>(resolveTab(initialTab));
  const [progressVersion, setProgressVersion] = useState(0);

  useKeyboard("Escape", onClose);

  useEffect(() => {
    if (initialTestExpand) setTab("rokovi");
  }, [initialTestExpand]);

  const criticalDates = curr
    ? extractCriticalDates({ [curriculumId]: curr })
    : [];
  const allDates = extractCriticalDates(curriculum as Record<string, CurriculumEntry>);
  const nonIspit = criticalDates.filter(d => d.type !== "ispit");
  const ispiti = criticalDates.filter(d => d.type === "ispit");

  const upcoming = nonIspit.filter(d => d.date && daysUntil(d.date) >= 0);
  const mostUrgent = [...upcoming].sort((a, b) => {
    const da = a.date ? daysUntil(a.date) : 999;
    const db = b.date ? daysUntil(b.date) : 999;
    return da - db;
  })[0];

  const slotType: "P" | "V" = slot?.type === "V" ? "V" : "P";
  const currentTopic = curr?.weeks[currentWeek - 1]
    ? (slotType === "P" ? curr.weeks[currentWeek - 1].lecture : curr.weeks[currentWeek - 1].exercise)
    : null;

  const subjectResources = resources[effectiveSubjectId] ?? {};
  const currentWeekLinks: ResourceLink[] = subjectResources[currentWeek] ?? [];

  const handleToggleTopic = (subjectId: string, type: string, week: number, topicKey: string) => {
    toggleTopicStorage(subjectId, type, week, topicKey);
    setProgressVersion(v => v + 1);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "pregled", label: "Pregled" },
    { id: "rokovi", label: "Rokovi" },
  ];

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content" style={{ display: "flex", flexDirection: "column" }}>

        {/* Drag handle — mobile only, colored per course */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: courseColor.accent, opacity: 0.5 }}
          />
        </div>

        {/* ── Header ── */}
        <div
          className="px-5 pt-3 pb-0"
          style={{ borderBottom: "1px solid var(--border)", flexShrink: 0 }}
        >
          {/* Course name + urgency pill */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2
              className="text-[16px] font-bold text-foreground leading-snug"
              style={{ letterSpacing: "-0.01em" }}
            >
              {subj?.full_name ?? effectiveSubjectId}
            </h2>
            {mostUrgent && (
              <span
                className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${EVENT_COLOR[mostUrgent.type]} 15%, transparent)`,
                  color: EVENT_COLOR[mostUrgent.type],
                  border: `1px solid color-mix(in srgb, ${EVENT_COLOR[mostUrgent.type]} 35%, transparent)`,
                  whiteSpace: "nowrap",
                }}
              >
                {mostUrgent.date
                  ? `${TYPE_LABEL[mostUrgent.type]} ${daysLabel(daysUntil(mostUrgent.date))}`
                  : TYPE_LABEL[mostUrgent.type]}
              </span>
            )}
          </div>

          {/* Meta chips — slot context */}
          {slot && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold tabular-nums bg-muted text-foreground">
                {slot.start}&ndash;{slot.end}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                {slotType === "P" ? "Predavanje" : "Vježbe"}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                {slot.room}
              </span>
              {slot.prof && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-fg truncate max-w-[160px]">
                  {slot.prof}
                </span>
              )}
            </div>
          )}

          {/* 2-tab switcher */}
          <div className="flex gap-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-4 t-fast transition-colors"
                style={{
                  height: 40,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  color: tab === t.id ? "var(--foreground)" : "var(--muted-fg)",
                  boxShadow: tab === t.id
                    ? `inset 0 -2px 0 0 ${courseColor.accent}`
                    : undefined,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: "contain" }}>

          {/* ── PREGLED tab ── */}
          {tab === "pregled" && (
            <div className="px-5 py-4 space-y-5">

              {/* Hero: current topic */}
              {curr && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: `color-mix(in srgb, ${courseColor.tint} 90%, var(--muted) 10%)`,
                    border: `1px solid color-mix(in srgb, ${courseColor.accent} 30%, transparent)`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                      style={{ background: `color-mix(in srgb, ${courseColor.accent} 20%, transparent)`, color: courseColor.text }}
                    >
                      T{currentWeek}
                    </span>
                    <span className="text-[10px] text-muted-fg font-medium">
                      {slotType === "P" ? "Predavanje" : "Vježbe"}
                    </span>
                  </div>
                  {currentTopic ? (
                    <p className="text-[15px] font-semibold text-foreground leading-snug">
                      {currentTopic}
                    </p>
                  ) : (
                    <p className="text-[13px] text-muted-fg">Nema podataka za ovaj tjedan.</p>
                  )}
                </div>
              )}

              {/* Grading breakdown — collapsible bar */}
              {curr && curr.grading.length > 0 && (
                <GradingBar grading={curr.grading} />
              )}

              {/* Next 2 weeks strip */}
              {curr && (
                <WeekStrip curr={curr} currentWeek={currentWeek} slotType={slotType} />
              )}

              {/* Current week resources */}
              {currentWeekLinks.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg mb-2">
                    Resursi ovog tjedna
                  </p>
                  <div
                    className="rounded-lg overflow-hidden divide-y"
                    style={{
                      background: "var(--muted)",
                      borderColor: "var(--border-subtle)",
                      border: `1px solid color-mix(in srgb, ${courseColor.accent} 25%, transparent)`,
                    }}
                  >
                    {currentWeekLinks.map((link, i) => (
                      <ResourceRow key={i} link={link} />
                    ))}
                  </div>
                </div>
              )}

              {!curr && (
                <div className="null-state">
                  <p>Nema podataka za ovaj kolegij.</p>
                </div>
              )}
            </div>
          )}

          {/* ── ROKOVI tab ── */}
          {tab === "rokovi" && (
            <div className="py-3">

              {/* Provjere */}
              {nonIspit.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg px-5 mb-2">
                    Provjere
                  </p>
                  <div
                    className="overflow-hidden"
                    style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <div className="space-y-0 divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                      {nonIspit.map((cd, i) => curr ? (
                        <TestCard
                          key={i}
                          cd={cd}
                          curr={curr}
                          allDates={allDates}
                          onToggleTopic={handleToggleTopic}
                          progressVersion={progressVersion}
                        />
                      ) : null)}
                    </div>
                  </div>
                </div>
              )}

              {/* Ispitni rokovi */}
              {curr && curr.exams.length > 0 && (
                <div className="px-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">
                    Ispitni rokovi
                  </p>
                  <div className="rounded-lg overflow-hidden space-y-0" style={{ background: "var(--muted)" }}>
                    {curr.exams.map((e, i) => {
                      const dateObj = ispiti.find(d => d.label.includes(e.replace(".", "")))?.date ?? null;
                      const days = dateObj ? daysUntil(dateObj) : null;
                      const isPast = days !== null && days < 0;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3"
                          style={{
                            minHeight: 48,
                            borderBottom: i < curr.exams.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                            opacity: isPast ? 0.35 : 1,
                          }}
                        >
                          <span className="text-[13px] text-foreground tabular-nums">{e}</span>
                          {days !== null && days >= 0 && (
                            <span className="text-[11px] text-muted-fg tabular-nums">{daysLabel(days)}</span>
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

          {/* Bottom padding so content clears the close button */}
          <div style={{ height: 8 }} />
        </div>

        {/* ── Footer ── */}
        {/* Mobile close row */}
        <div
          className="md:hidden px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <button
            onClick={onClose}
            className="w-full t-fast transition-colors"
            style={{
              height: 48,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--muted-fg)",
              background: "var(--muted)",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Zatvori
          </button>
        </div>

        {/* Desktop close X */}
        <div className="hidden md:block absolute top-3 right-3">
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: "none",
              background: "none",
              color: "var(--muted-fg)",
              cursor: "pointer",
            }}
            className="hover:bg-muted hover:text-foreground t-fast transition-colors"
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
