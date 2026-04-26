"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronDown, X } from "lucide-react";
import type { Slot, CurriculumEntry, CriticalDate } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { curriculum } from "@/data/curriculum";
import { daysUntil, formatHrDate, formatShortDate, getCurrentWeek, getWeekDates } from "@/lib/date-utils";
import { extractCriticalDates } from "@/lib/extraction";
import { EVENT_COLOR, TEST_TYPES, TYPE_LABEL, getCourseColor } from "@/lib/labels";
import { countCheckableItems, getTestTopics } from "@/lib/test-topics";
import { getCompletion, getProgress, toggleTopic as toggleTopicStorage } from "@/lib/study-progress";

type Tab = "pregled" | "rokovi";

interface CourseModalProps {
  slot: Slot | null;
  subjectId?: string;
  initialTab?: "sada" | "plan" | "rokovi" | "resursi" | Tab;
  initialTestExpand?: CriticalDate;
  onClose: () => void;
}

function daysLabel(days: number): string {
  if (days === 0) return "danas";
  if (days === 1) return "sutra";
  if (days < 0) return "proslo";
  return `za ${days}d`;
}

function eventKey(event: CriticalDate): string {
  return `${event.subjectId}:${event.type}:${event.week}:${event.label}:${event.date ? formatHrDate(event.date) : "week"}`;
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-fg">
        {children}
      </p>
      {action}
    </div>
  );
}

function Chevron({ open }: { open?: boolean }) {
  return (
    <ChevronDown
      size={14}
      strokeWidth={2.2}
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : "none",
        transition: "transform 160ms var(--ease-out-expo)",
      }}
    />
  );
}

function CheckSvg({ color }: { color: string }) {
  return (
    <Check
      className="prep-check-mark"
      size={9}
      strokeWidth={1.75}
      style={{ color }}
    />
  );
}

function eventPoints(event: CriticalDate, curr: CurriculumEntry): number | null {
  if (event.points !== undefined) return event.points;

  const numberedKolokvij = event.label.match(/\b(\d+)\.\s*kolokvij\b/i)?.[1];
  if (event.type === "kolokvij" && numberedKolokvij) {
    const exact = curr.grading.find((item) =>
      new RegExp(`\\b${numberedKolokvij}\\.\\s*kolokvij\\b`, "i").test(item.component)
    );
    if (exact) return exact.maxPoints;
  }

  const numberedProject = event.label.match(/\b(\d+)\.\s*projektn/i)?.[1];
  if (event.type === "obrana" && numberedProject) {
    const exact = curr.grading.find((item) =>
      new RegExp(`\\b${numberedProject}\\.\\s*projektn`, "i").test(item.component)
    );
    if (exact) return exact.maxPoints;
  }

  const label = TYPE_LABEL[event.type].toLowerCase();
  const match = curr.grading.find((item) => item.component.toLowerCase().includes(label));
  return match?.maxPoints ?? null;
}

function GradingSummary({ curr, accent }: { curr: CurriculumEntry; accent: string }) {
  const [expanded, setExpanded] = useState(false);
  const total = curr.grading.reduce((sum, item) => sum + item.maxPoints, 0);

  return (
    <section>
      <SectionTitle action={
        <button
          onClick={() => setExpanded((value) => !value)}
          className="text-[11px] font-semibold text-muted-fg"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {expanded ? "Sakrij" : "Detalji"}
        </button>
      }>
        Vrednovanje
      </SectionTitle>

      <button
        onClick={() => setExpanded((value) => !value)}
        className="w-full"
        style={{ all: "unset", display: "block", width: "100%", cursor: "pointer" }}
      >
        <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--border)" }}>
          {curr.grading.map((item, index) => {
            const width = total > 0 ? (item.maxPoints / total) * 100 : 0;
            return (
              <div
                key={item.component}
                style={{
                  width: `${width}%`,
                  background: accent,
                  opacity: 0.45 + (index % 4) * 0.13,
                  borderRight: index < curr.grading.length - 1 ? "1px solid var(--background)" : undefined,
                }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-fg">
          <span>{curr.grading.length} komponenti</span>
          <span className="tabular-nums">{total} bod.</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 overflow-hidden rounded-xl" style={{ background: "var(--muted)", animation: "row-in 160ms var(--ease-out-expo) both" }}>
          {curr.grading.map((item, index) => (
            <div
              key={item.component}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
              style={{ borderBottom: index < curr.grading.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
            >
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-foreground truncate">{item.component}</div>
                {item.note && <div className="mt-0.5 text-[10px] text-muted-fg truncate">{item.note}</div>}
              </div>
              <span className="text-[13px] font-semibold tabular-nums text-foreground shrink-0">{item.maxPoints}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WeekTimeline({
  curr,
  currentWeek,
  slotType,
}: {
  curr: CurriculumEntry;
  currentWeek: number;
  slotType: "P" | "V";
}) {
  const weeks = curr.weeks.slice(Math.max(0, currentWeek - 1), Math.min(curr.weeks.length, currentWeek + 3));

  return (
    <section>
      <SectionTitle>Plan</SectionTitle>
      <div className="course-list">
        {weeks.map((week) => {
          const { monday } = getWeekDates(week.week);
          const topic = slotType === "P" ? week.lecture : week.exercise;
          const current = week.week === currentWeek;

          return (
            <div key={week.week} className="course-list-row">
              <div className="course-week-index" data-current={current ? "true" : "false"}>
                <span>T{week.week}</span>
                <small>{formatShortDate(monday)}</small>
              </div>
              <div className="min-w-0 flex-1">
                <p className="course-row-title" data-current={current ? "true" : "false"}>
                  {topic || "Nema podataka"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PrepChecklist({
  event,
  curr,
  allDates,
  progressVersion,
  onToggleTopic,
}: {
  event: CriticalDate;
  curr: CurriculumEntry;
  allDates: CriticalDate[];
  progressVersion: number;
  onToggleTopic: (subjectId: string, type: string, week: number, topicKey: string) => void;
}) {
  const topics = getTestTopics(curr, event, allDates);
  const total = countCheckableItems(topics);
  const progress = getProgress(event.subjectId, event.type, event.week);
  const completion = getCompletion(event.subjectId, event.type, event.week, total);
  const color = EVENT_COLOR[event.type];
  void progressVersion;

  if (!TEST_TYPES.has(event.type)) {
    return (
      <p className="px-4 pb-4 text-[12px] text-muted-fg">
        Za ovaj tip roka nema pripremne liste.
      </p>
    );
  }

  if (topics.length === 0 || total === 0) {
    return (
      <p className="px-4 pb-4 text-[12px] text-muted-fg">
        Nema dovoljno podataka za pripremu.
      </p>
    );
  }

  return (
    <div className="px-4 pb-4">
      <div className="course-prep-summary">
        <span>{completion.done}/{total} obradeno</span>
        <strong>{Math.round((completion.done / total) * 100)}%</strong>
      </div>

      <div className="mt-3 space-y-3">
        {topics.map((topic) => {
          if (topic.isHoliday) {
            return (
              <div key={topic.week} className="course-holiday-row">
                T{topic.week} - praznik
              </div>
            );
          }

          const { monday, friday } = getWeekDates(topic.week);
          const dateRange = `${formatShortDate(monday)}-${formatShortDate(friday)}`;
          const lectureKey = `w${topic.week}:p`;
          const exerciseKey = `w${topic.week}:v`;
          const lectureChecked = !!progress.checked[lectureKey];
          const exerciseChecked = !!progress.checked[exerciseKey];

          return (
            <div key={topic.week} className="course-prep-week" style={{ "--course-accent": color } as CSSProperties}>
              <div className="course-prep-week-head">
                <span>T{topic.week}</span>
                <small>{dateRange}</small>
              </div>
              <PrepRow
                checked={lectureChecked}
                color={color}
                text={topic.lecture}
                onChange={() => onToggleTopic(event.subjectId, event.type, event.week, lectureKey)}
              />
              <PrepRow
                checked={exerciseChecked}
                color={color}
                text={topic.exercise}
                onChange={() => onToggleTopic(event.subjectId, event.type, event.week, exerciseKey)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrepRow({
  checked,
  color,
  text,
  onChange,
}: {
  checked: boolean;
  color: string;
  text: string;
  onChange: () => void;
}) {
  return (
    <label
      className="course-prep-row prep-check"
      data-checked={checked ? "true" : "false"}
      style={{ "--check-color": color } as CSSProperties}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="prep-check-box" aria-hidden="true">
        <CheckSvg color={color} />
      </span>
      <span className="course-prep-text">{text}</span>
    </label>
  );
}

function AssessmentCard({
  event,
  curr,
  allDates,
  open,
  onOpen,
  progressVersion,
  onToggleTopic,
}: {
  event: CriticalDate;
  curr: CurriculumEntry;
  allDates: CriticalDate[];
  open: boolean;
  onOpen: () => void;
  progressVersion: number;
  onToggleTopic: (subjectId: string, type: string, week: number, topicKey: string) => void;
}) {
  const color = EVENT_COLOR[event.type];
  const days = event.date ? daysUntil(event.date) : null;
  const points = eventPoints(event, curr);
  const total = TEST_TYPES.has(event.type) ? countCheckableItems(getTestTopics(curr, event, allDates)) : 0;
  const completion = total > 0 ? getCompletion(event.subjectId, event.type, event.week, total) : null;
  const pct = completion && total > 0 ? Math.round((completion.done / total) * 100) : null;
  const disabled = !TEST_TYPES.has(event.type);

  return (
    <div className="course-assessment" style={{ "--course-accent": color } as CSSProperties}>
      <button
        onClick={onOpen}
        disabled={disabled}
        className="course-assessment-button"
        style={{ cursor: disabled ? "default" : "pointer" }}
      >
        <span className="course-assessment-dot" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="course-assessment-type" style={{ color }}>
              {TYPE_LABEL[event.type]}
            </span>
            {event.date && <span className="course-assessment-date">{formatHrDate(event.date)}</span>}
          </div>
          <p className="course-assessment-label">
            {event.label || TYPE_LABEL[event.type]}
          </p>
          {completion && pct !== null && (
            <div className="course-progress-line">
              <span style={{ width: `${pct}%`, background: color }} />
            </div>
          )}
        </div>

        <div className="course-assessment-meta">
          {days !== null && days >= 0 && (
            <span className="course-assessment-days" style={{ color: days <= 7 ? color : undefined }}>
              {daysLabel(days)}
            </span>
          )}
          {points !== null && <span className="course-points">{points} bod.</span>}
          {!disabled && <Chevron open={open} />}
        </div>
      </button>

      {open && (
        <PrepChecklist
          event={event}
          curr={curr}
          allDates={allDates}
          progressVersion={progressVersion}
          onToggleTopic={onToggleTopic}
        />
      )}
    </div>
  );
}

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
  const slotType: "P" | "V" = slot?.type === "V" ? "V" : "P";
  const [progressVersion, setProgressVersion] = useState(0);
  const [tab, setTab] = useState<Tab>(initialTestExpand || initialTab === "rokovi" ? "rokovi" : "pregled");
  const [openEventKey, setOpenEventKey] = useState<string | null>(initialTestExpand ? eventKey(initialTestExpand) : null);

  const criticalDates = useMemo(
    () => curr ? extractCriticalDates({ [curriculumId]: curr }) : [],
    [curr, curriculumId]
  );
  const allDates = useMemo(
    () => extractCriticalDates(curriculum as Record<string, CurriculumEntry>),
    []
  );

  const assessments = useMemo(
    () => criticalDates
      .filter((event) => event.type !== "ispit")
      .sort((a, b) => {
        const aDate = a.date?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDate = b.date?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }),
    [criticalDates]
  );

  const nextEvent = assessments.find((event) => event.date && daysUntil(event.date) >= 0);
  const currentTopic = curr?.weeks[currentWeek - 1]
    ? (slotType === "P" ? curr.weeks[currentWeek - 1].lecture : curr.weeks[currentWeek - 1].exercise)
    : null;

  const handleToggleTopic = (subjectId: string, type: string, week: number, topicKey: string) => {
    toggleTopicStorage(subjectId, type, week, topicKey);
    setProgressVersion((value) => value + 1);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
      <Dialog.Overlay className="modal-backdrop" />
      <Dialog.Content className="modal-content course-sheet" style={{ "--course-accent": courseColor.accent } as CSSProperties}>
        <div className="course-sheet-handle" />

        <header className="course-header">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pr-2">
              <p className="course-kicker">{subj?.short_name ?? effectiveSubjectId}</p>
              <Dialog.Title className="course-title">
                {subj?.full_name ?? effectiveSubjectId}
              </Dialog.Title>
            </div>
            <Dialog.Close className="course-close" type="button" aria-label="Zatvori">
              <X size={15} strokeWidth={2.2} />
            </Dialog.Close>
          </div>

          {nextEvent?.date && (
            <div className="mt-3">
              <span
                className="course-countdown course-header-pill"
                style={{
                  color: EVENT_COLOR[nextEvent.type],
                  background: `color-mix(in srgb, ${EVENT_COLOR[nextEvent.type]} 14%, transparent)`,
                }}
              >
                {TYPE_LABEL[nextEvent.type]} {daysLabel(daysUntil(nextEvent.date))}
              </span>
            </div>
          )}

          {slot && (
            <p className="course-meta-line">
              <strong>{slot.start}-{slot.end}</strong>
              {" · "}{slotType === "P" ? "Predavanje" : "Vježbe"}
              {slot.room && !slot.online && <>{" · "}{slot.room}</>}
              {slot.prof && <>{" · "}{slot.prof}</>}
            </p>
          )}

          <div className="course-segmented" role="tablist" aria-label="Kolegij">
            {(["pregled", "rokovi"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                data-active={tab === item ? "true" : "false"}
                onClick={() => setTab(item)}
              >
                {item === "pregled" ? "Pregled" : "Rokovi"}
              </button>
            ))}
          </div>
        </header>

        <main className="course-body">
          {!curr ? (
            <div className="null-state">
              <p>Nema podataka za ovaj kolegij.</p>
            </div>
          ) : tab === "pregled" ? (
            <div className="course-stack">
              <section className="course-topic-panel">
                <div className="course-hero-meta">
                  <span>T{currentWeek}</span>
                  <span>{slotType === "P" ? "Predavanje" : "Vježbe"}</span>
                </div>
                <h3>{currentTopic || "Nema teme za ovaj tjedan."}</h3>
              </section>

              <GradingSummary curr={curr} accent={courseColor.accent} />
              <WeekTimeline curr={curr} currentWeek={currentWeek} slotType={slotType} />
            </div>
          ) : (
            <div className="course-stack">
              <section>
                <SectionTitle>Provjere i predaje</SectionTitle>
                <div className="course-assessment-list">
                  {assessments.length > 0 ? assessments.map((event) => {
                    const key = eventKey(event);
                    return (
                      <AssessmentCard
                        key={key}
                        event={event}
                        curr={curr}
                        allDates={allDates}
                        open={openEventKey === key}
                        onOpen={() => setOpenEventKey(openEventKey === key ? null : key)}
                        progressVersion={progressVersion}
                        onToggleTopic={handleToggleTopic}
                      />
                    );
                  }) : (
                    <div className="null-state">
                      <p>Nema rokova za ovaj kolegij.</p>
                    </div>
                  )}
                </div>
              </section>

              {curr.exams.length > 0 && (
                <section>
                  <SectionTitle>Ispitni rokovi</SectionTitle>
                  <div className="course-exam-list">
                    {curr.exams.map((date) => {
                      const parsed = date.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                      const dateObj = parsed ? new Date(Number(parsed[3]), Number(parsed[2]) - 1, Number(parsed[1])) : null;
                      const days = dateObj ? daysUntil(dateObj) : null;
                      return (
                        <div key={date} className="course-list-row">
                          <div className="course-week-index">
                            <span>Ispit</span>
                          </div>
                          <p className="course-row-title">{date}</p>
                          {days !== null && (
                            <span className="text-[11px] font-semibold tabular-nums text-muted-fg">
                              {daysLabel(days)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>

      </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
