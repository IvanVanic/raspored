"use client";

import { useState, useEffect, useRef } from "react";
import type { Slot, CurriculumEntry, CriticalDate } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { getCurrentWeek, daysUntil, formatHrDate, getWeekDates, formatShortDate } from "@/lib/date-utils";
import { extractCriticalDates } from "@/lib/extraction";
import { TYPE_LABEL, EVENT_COLOR, TEST_TYPES } from "@/lib/labels";
import { getTestTopics, countCheckableItems } from "@/lib/test-topics";
import { getProgress, toggleTopic as toggleTopicStorage, getCompletion } from "@/lib/study-progress";
import { useKeyboard } from "@/hooks/useKeyboard";
import { resources } from "@/data/resources";
import type { ResourceLink } from "@/data/resources";

type Tab = "sada" | "plan" | "rokovi" | "resursi";

interface CourseModalProps {
  slot: Slot | null;
  subjectId?: string;
  initialTab?: Tab;
  initialTestExpand?: CriticalDate;
  onClose: () => void;
}

export function CourseModal({ slot, subjectId: propSubjectId, initialTab, initialTestExpand, onClose }: CourseModalProps) {
  const effectiveSubjectId = slot?.subject_id ?? propSubjectId ?? "";
  const curriculumId = effectiveSubjectId.toUpperCase();
  const subj = subjectMap.get(effectiveSubjectId);
  const curr = curriculum[curriculumId];
  const currentWeek = getCurrentWeek();
  const [tab, setTab] = useState<Tab>(initialTab ?? "sada");
  const planRef = useRef<HTMLDivElement>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(() => new Set([currentWeek]));
  const [expandedTest, setExpandedTest] = useState<CriticalDate | null>(initialTestExpand ?? null);
  const [progressVersion, setProgressVersion] = useState(0);

  useKeyboard("Escape", onClose);

  useEffect(() => {
    if (tab === "plan" && planRef.current) {
      const activeRow = planRef.current.querySelector("[data-current='true']");
      if (activeRow) {
        activeRow.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [tab]);

  useEffect(() => {
    if (initialTestExpand) {
      setTab("rokovi");
      setExpandedTest(initialTestExpand);
    }
  }, [initialTestExpand]);

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  const criticalDates = curr
    ? extractCriticalDates({ [curriculumId]: curr as CurriculumEntry })
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

  const TABS: { id: Tab; label: string }[] = [
    { id: "sada", label: "Sada" },
    { id: "plan", label: "Plan" },
    { id: "rokovi", label: "Rokovi" },
    { id: "resursi", label: "Resursi" },
  ];

  const subjectResources = resources[effectiveSubjectId] ?? {};

  const toggleTest = (cd: CriticalDate) => {
    if (expandedTest && expandedTest.week === cd.week && expandedTest.type === cd.type && expandedTest.subjectId === cd.subjectId) {
      setExpandedTest(null);
    } else {
      setExpandedTest(cd);
    }
  };

  const isTestExpanded = (cd: CriticalDate) =>
    expandedTest !== null &&
    expandedTest.week === cd.week &&
    expandedTest.type === cd.type &&
    expandedTest.subjectId === cd.subjectId;

  const handleToggleTopic = (subjectId: string, type: string, week: number, topicKey: string) => {
    toggleTopicStorage(subjectId, type, week, topicKey);
    setProgressVersion(v => v + 1);
  };

  const findPoints = (cd: CriticalDate): number | null => {
    if (!curr) return null;
    const label = TYPE_LABEL[cd.type].toLowerCase();
    for (const g of curr.grading) {
      if (g.component.toLowerCase().includes(label)) return g.maxPoints;
    }
    return null;
  };
  const resourceWeeks = Object.keys(subjectResources)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-fg/30" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-0 border-b border-border">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-[15px] font-bold text-foreground leading-snug">
              {subj?.full_name ?? effectiveSubjectId}
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
            {slot && (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums bg-muted text-foreground">
                  {slot.start}&ndash;{slot.end}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                  {slot.type === "P" ? "Predavanje" : "Vježbe"}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                  {slot.room}
                </span>
              </>
            )}
            {subj && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                Sem. {subj.semester}
              </span>
            )}
            {slot?.group && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg">
                G{slot.group}
              </span>
            )}
            {slot && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-fg truncate max-w-[160px]">
                {slot.prof}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-[11px] font-semibold tracking-[0.04em] t-fast transition-[color,box-shadow] ${
                  tab === t.id ? "text-foreground" : "text-muted-fg hover:text-foreground"
                }`}
                style={tab === t.id ? { boxShadow: "inset 0 -2px 0 0 var(--foreground)" } : undefined}
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
            const slotType = slot?.type ?? "P";
            const topicText = curr.weeks[currentWeek - 1]
              ? (slotType === "P" ? curr.weeks[currentWeek - 1].lecture : curr.weeks[currentWeek - 1].exercise)
              : null;
            return (
              <div className="px-5 py-4 space-y-4">
                {/* Current week topic card */}
                <div className="rounded-lg p-3.5" style={{ background: "var(--muted)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg mb-1.5">
                    Tjedan {currentWeek} &mdash; {slotType === "P" ? "Predavanje" : "Vježbe"}
                  </p>
                  {topicText ? (
                    <p className="text-[14px] text-foreground font-semibold leading-snug">{topicText}</p>
                  ) : (
                    <p className="text-[12px] text-muted-fg">Nema podataka za ovaj tjedan.</p>
                  )}
                </div>

                {/* Grading — compact stacked bar + inline table */}
                {curr.grading.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg mb-2">
                      Vrednovanje
                    </p>
                    {/* Stacked proportion bar */}
                    <div className="h-2 rounded-full overflow-hidden flex mb-2.5" style={{ background: "var(--border)" }}>
                      {curr.grading.map((g, i) => {
                        const pct = totalPoints > 0 ? (g.maxPoints / totalPoints) * 100 : 0;
                        const opacity = 0.45 + (i % 4) * 0.13;
                        return (
                          <div
                            key={i}
                            style={{
                              width: `${pct}%`,
                              background: "var(--m-accent)",
                              opacity,
                              borderRight: i < curr.grading.length - 1 ? "1px solid var(--background)" : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                    {/* Compact list */}
                    <div>
                      {curr.grading.map((g, i) => {
                        const pct = totalPoints > 0 ? Math.round((g.maxPoints / totalPoints) * 100) : 0;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between py-1.5"
                            style={{ borderBottom: i < curr.grading.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: "var(--m-accent)", opacity: 0.45 + (i % 4) * 0.13 }}
                              />
                              <span className="text-[12px] text-foreground truncate">{g.component}</span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0 ml-3">
                              <span className="text-[10px] tabular-nums text-muted-fg w-7 text-right">{pct}%</span>
                              <span className="text-[12px] tabular-nums font-semibold text-foreground w-8 text-right">{g.maxPoints}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-0.5" style={{ borderTop: "1px solid var(--border)" }}>
                      <span className="text-[10px] text-muted-fg uppercase tracking-[0.06em] font-semibold">Ukupno</span>
                      <span className="text-[13px] text-foreground tabular-nums font-bold">
                        {totalPoints} <span className="text-muted-fg text-[10px] font-normal">bod.</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* PLAN — interactive expand/collapse */}
          {tab === "plan" && curr && (
            <div className="py-2 px-5" ref={planRef}>
              {curr.weeks.map((w, idx) => {
                const isCurrent = w.week === currentWeek;
                const isPast = w.week < currentWeek;
                const isLast = idx === curr.weeks.length - 1;
                const isExpanded = expandedWeeks.has(w.week);
                const { monday, friday } = getWeekDates(w.week);
                const dateRange = `${formatShortDate(monday)}–${formatShortDate(friday)}`;
                const lecture = w.lecture ?? "";
                const exercise = w.exercise && w.exercise !== w.lecture ? w.exercise : "";

                return (
                  <div
                    key={w.week}
                    data-current={isCurrent ? "true" : "false"}
                    className="flex items-stretch gap-3"
                    style={{ opacity: isPast ? 0.4 : 1 }}
                  >
                    {/* Timeline rail */}
                    <div className="flex flex-col items-center" style={{ width: 20, flexShrink: 0 }}>
                      <div
                        style={{
                          width: isCurrent ? 10 : 6,
                          height: isCurrent ? 10 : 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          marginTop: 10,
                          background: isCurrent ? "var(--m-accent)" : isPast ? "var(--border)" : "var(--muted-fg)",
                          boxShadow: isCurrent ? "0 0 0 3px color-mix(in srgb, var(--m-accent) 25%, transparent)" : "none",
                        }}
                      />
                      {!isLast && (
                        <div
                          style={{
                            flex: 1,
                            width: 1,
                            marginTop: 3,
                            background: isCurrent ? "color-mix(in srgb, var(--m-accent) 40%, transparent)" : "var(--border)",
                          }}
                        />
                      )}
                    </div>

                    {/* Content area */}
                    <div className="flex-1 min-w-0">
                      {/* Tappable header row */}
                      <button
                        onClick={() => toggleWeek(w.week)}
                        className="w-full text-left py-1.5 hover:opacity-80 t-fast transition-opacity"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold tabular-nums tracking-[0.05em] uppercase"
                            style={{ color: isCurrent ? "var(--m-text)" : "var(--muted-fg)" }}
                          >
                            T{w.week}
                          </span>
                          <span className="text-[9px] text-muted-fg tabular-nums">{dateRange}</span>
                          {isCurrent && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                              style={{ background: "color-mix(in srgb, var(--m-accent) 20%, transparent)", color: "var(--m-text)" }}
                            >
                              Sada
                            </span>
                          )}
                          {/* Chevron */}
                          <span
                            className="ml-auto text-muted-fg inline-block t-fast"
                            style={{
                              fontSize: 10,
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 150ms var(--ease-out-expo)",
                            }}
                          >
                            ▾
                          </span>
                        </div>
                        {/* Collapsed one-liner preview */}
                        {!isExpanded && (
                          <p
                            className="text-[12px] leading-snug truncate mt-0.5"
                            style={{ color: isCurrent ? "var(--foreground)" : "var(--muted-fg)", fontWeight: isCurrent ? 500 : 400 }}
                          >
                            {lecture || "(nema podataka)"}
                          </p>
                        )}
                      </button>

                      {/* Expanded panel */}
                      {isExpanded && (
                        <div
                          className="rounded-md mb-2"
                          style={isCurrent ? {
                            background: "color-mix(in srgb, var(--m-tint-strong) 85%, var(--muted) 15%)",
                            border: "2px solid color-mix(in srgb, var(--m-accent) 50%, transparent)",
                            padding: "8px 10px",
                          } : {
                            background: "var(--muted)",
                            border: "1px solid var(--border-subtle)",
                            padding: "7px 10px",
                          }}
                        >
                          {lecture ? (
                            <>
                              <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-[9px] font-bold uppercase tracking-[0.08em] shrink-0" style={{ color: "var(--m-text)" }}>P</span>
                                <p className="text-[12px] leading-snug" style={{ color: "var(--foreground)", fontWeight: isCurrent ? 600 : 400 }}>{lecture}</p>
                              </div>
                              {exercise && (
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] shrink-0" style={{ color: "var(--e-text)" }}>V</span>
                                  <p className="text-[11px] leading-snug" style={{ color: "var(--muted-fg)" }}>{exercise}</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-[11px] text-muted-fg">Nema podataka za ovaj tjedan.</p>
                          )}
                        </div>
                      )}

                      {/* Subtle rule between collapsed rows */}
                      {!isExpanded && !isLast && (
                        <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 2 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ROKOVI */}
          {tab === "rokovi" && (
            <div className="px-5 py-4 space-y-4">
              {nonIspit.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">Provjere</p>
                  <div className="space-y-1.5">
                    {nonIspit.map((cd, i) => {
                      const days = cd.date ? daysUntil(cd.date) : null;
                      const isPast = days !== null && days < 0;
                      const isSoon = days !== null && days >= 0 && days <= 7;
                      const isTest = TEST_TYPES.has(cd.type);
                      const expanded = isTestExpanded(cd);

                      let progressBadge: { done: number; total: number } | null = null;
                      if (isTest && curr) {
                        const topics = getTestTopics(curr, cd, allDates);
                        const total = countCheckableItems(topics);
                        if (total > 0) {
                          progressBadge = getCompletion(cd.subjectId, cd.type, cd.week, total);
                          void progressVersion;
                        }
                      }

                      return (
                        <div key={i}>
                          <button
                            onClick={() => isTest ? toggleTest(cd) : undefined}
                            className={`w-full text-left flex items-center gap-3 py-2 px-3 rounded-md ${isPast ? "opacity-40" : ""} ${isTest ? "hover:opacity-80 t-fast transition-opacity" : ""}`}
                            style={{
                              background: isSoon ? "color-mix(in srgb, var(--u-critical-tint) 80%, transparent)" : "var(--muted)",
                              borderLeft: `3px solid ${EVENT_COLOR[cd.type]}`,
                              cursor: isTest ? "pointer" : "default",
                            }}
                            disabled={!isTest}
                          >
                            {isTest && (
                              <span
                                className="text-muted-fg shrink-0"
                                style={{
                                  fontSize: 10,
                                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 150ms var(--ease-out-expo)",
                                }}
                              >
                                ▾
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-semibold text-foreground">{TYPE_LABEL[cd.type]}</span>
                                {cd.date && <span className="text-[11px] text-muted-fg tabular-nums">{formatHrDate(cd.date)}</span>}
                                {!cd.date && <span className="text-[11px] text-muted-fg">T{cd.week}</span>}
                              </div>
                            </div>
                            {progressBadge && progressBadge.total > 0 && (
                              <span
                                className="text-[10px] font-bold tabular-nums shrink-0 px-1.5 py-0.5 rounded"
                                style={{
                                  color: progressBadge.done === progressBadge.total ? "var(--m-text)" : "var(--muted-fg)",
                                  background: progressBadge.done === progressBadge.total
                                    ? "color-mix(in srgb, var(--m-accent) 20%, transparent)"
                                    : "color-mix(in srgb, var(--border) 80%, transparent)",
                                }}
                              >
                                {progressBadge.done}/{progressBadge.total}
                              </span>
                            )}
                            {days !== null && days >= 0 && (
                              <span
                                className="text-[11px] font-bold tabular-nums shrink-0 px-2 py-0.5 rounded"
                                style={{
                                  color: isSoon ? "var(--u-critical)" : EVENT_COLOR[cd.type],
                                  background: isSoon
                                    ? "color-mix(in srgb, var(--u-critical) 12%, transparent)"
                                    : "color-mix(in srgb, var(--border) 80%, transparent)",
                                }}
                              >
                                {days === 0 ? "danas" : days === 1 ? "sutra" : `za ${days}d`}
                              </span>
                            )}
                          </button>

                          {expanded && isTest && curr && (
                            <TestDetailPanel
                              cd={cd}
                              curr={curr}
                              allDates={allDates}
                              points={findPoints(cd)}
                              onToggleTopic={handleToggleTopic}
                              progressVersion={progressVersion}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {curr && curr.exams.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-fg mb-2">Ispitni rokovi</p>
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
                          {days !== null && days >= 0 && <span className="text-[11px] text-muted-fg tabular-nums">{days === 0 ? "danas" : `za ${days}d`}</span>}
                          {isPast && <span className="text-[10px] text-muted-fg">prošlo</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {nonIspit.length === 0 && (!curr || curr.exams.length === 0) && (
                <div className="null-state"><p>Nema rokova za ovaj kolegij.</p></div>
              )}
            </div>
          )}

          {/* RESURSI */}
          {tab === "resursi" && (
            <div className="px-5 py-4 space-y-4">
              {resourceWeeks.length === 0 ? (
                <div className="null-state"><p>Nema resursa za ovaj kolegij.</p></div>
              ) : (
                resourceWeeks.map(weekNum => {
                  const links: ResourceLink[] = subjectResources[weekNum] ?? [];
                  const isCurrentWeek = weekNum === currentWeek;
                  return (
                    <div key={weekNum}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: isCurrentWeek ? "var(--m-text)" : "var(--muted-fg)" }}>
                          T{weekNum}
                        </span>
                        {isCurrentWeek && (
                          <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded"
                            style={{ background: "color-mix(in srgb, var(--m-accent) 20%, transparent)", color: "var(--m-text)" }}>
                            Sada
                          </span>
                        )}
                      </div>
                      <div className="rounded-md overflow-hidden"
                        style={{
                          background: isCurrentWeek ? "color-mix(in srgb, var(--m-tint-strong) 85%, var(--muted) 15%)" : "var(--muted)",
                          border: isCurrentWeek ? "2px solid color-mix(in srgb, var(--m-accent) 50%, transparent)" : "1px solid transparent",
                        }}>
                        {links.map((link, li) => (
                          <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="resource-link flex items-center justify-between gap-2 px-3 py-2 t-fast transition-colors"
                            style={{ borderTop: li > 0 ? "1px solid var(--border)" : undefined, color: "var(--foreground)", textDecoration: "none" }}>
                            <span className="text-[12px] leading-snug min-w-0 truncate">{link.label}</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40" aria-hidden="true">
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

        {/* Mobile close */}
        <div className="md:hidden px-5 py-3 border-t border-border-subtle">
          <button onClick={onClose} className="w-full py-2.5 text-[12px] font-semibold text-muted-fg bg-muted rounded-lg hover:text-foreground t-fast transition-colors">
            Zatvori
          </button>
        </div>

        {/* Desktop close */}
        <div className="hidden md:block absolute top-3 right-3">
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-fg hover:text-foreground hover:bg-muted t-fast transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}


function TestDetailPanel({
  cd,
  curr,
  allDates,
  points,
  onToggleTopic,
  progressVersion,
}: {
  cd: CriticalDate;
  curr: CurriculumEntry;
  allDates: CriticalDate[];
  points: number | null;
  onToggleTopic: (subjectId: string, type: string, week: number, topicKey: string) => void;
  progressVersion: number;
}) {
  const topics = getTestTopics(curr, cd, allDates);
  const total = countCheckableItems(topics);
  const { done } = getCompletion(cd.subjectId, cd.type, cd.week, total);
  void progressVersion;

  const progress = getProgress(cd.subjectId, cd.type, cd.week);
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div
      className="mx-1 mb-2 rounded-lg overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        animation: "row-in 150ms var(--ease-out-expo) both",
      }}
    >
      <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          {points !== null && (
            <span className="text-[11px] font-semibold text-foreground tabular-nums">
              {points} bod.
            </span>
          )}
          <span className="text-[11px] text-muted-fg tabular-nums">
            {done}/{total} obrađeno
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full t-fast"
            style={{
              width: `${pct}%`,
              background: EVENT_COLOR[cd.type],
              transition: "width 200ms var(--ease-out-expo)",
            }}
          />
        </div>
      </div>

      <div className="px-3 py-2 space-y-2">
        {topics.map(topic => {
          if (topic.isHoliday) {
            return (
              <div key={topic.week} className="opacity-30 py-1">
                <span className="text-[10px] font-bold tabular-nums tracking-[0.05em] uppercase text-muted-fg">
                  T{topic.week}
                </span>
                <span className="text-[10px] text-muted-fg ml-2">
                  {topic.lecture}
                </span>
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
            <div key={topic.week}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tabular-nums tracking-[0.05em] uppercase text-muted-fg">
                  T{topic.week}
                </span>
                <span className="text-[9px] text-muted-fg tabular-nums">{dateRange}</span>
              </div>
              <label
                className="flex items-start gap-2 py-0.5 cursor-pointer"
                style={{ opacity: lectureChecked ? 0.4 : 1 }}
              >
                <input
                  type="checkbox"
                  checked={lectureChecked}
                  onChange={() => onToggleTopic(cd.subjectId, cd.type, cd.week, lectureKey)}
                  className="mt-0.5 shrink-0"
                  style={{ accentColor: EVENT_COLOR[cd.type] }}
                />
                <span className={`text-[11px] leading-snug ${lectureChecked ? "line-through" : ""}`}>
                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] mr-1" style={{ color: "var(--m-text)" }}>P</span>
                  {topic.lecture}
                </span>
              </label>
              <label
                className="flex items-start gap-2 py-0.5 cursor-pointer"
                style={{ opacity: exerciseChecked ? 0.4 : 1 }}
              >
                <input
                  type="checkbox"
                  checked={exerciseChecked}
                  onChange={() => onToggleTopic(cd.subjectId, cd.type, cd.week, exerciseKey)}
                  className="mt-0.5 shrink-0"
                  style={{ accentColor: EVENT_COLOR[cd.type] }}
                />
                <span className={`text-[11px] leading-snug ${exerciseChecked ? "line-through" : ""}`}>
                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] mr-1" style={{ color: "var(--e-text)" }}>V</span>
                  {topic.exercise}
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
  );
}
