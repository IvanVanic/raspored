import Sparkle from "react-sparkle";
import type { Slot } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { getCourseColor, EVENT_COLOR } from "@/lib/labels";
import { MetaSep } from "@/components/shared/MetaSep";

export type TimeStatus = "now" | "next" | null;

const GRADING_RE = /\b(kolokvij|kviz|kontroln[ae]|obrana|ispit|laboratorij|domać[ae]\s+zadać[ae])\b/i;
const PREP_RE = /\b(priprema|nadoknad|popravn|popravak|prošl|konzultacij)\b/i;

function detectGradingType(topic: string | undefined): "kolokvij" | "kviz" | "kontrolna" | "obrana" | "ispit" | "laboratorij" | "domaca_zadaca" | null {
  if (!topic || PREP_RE.test(topic)) return null;
  const m = topic.match(GRADING_RE);
  if (!m) return null;
  const t = m[1].toLowerCase();
  if (t.startsWith("kolokvij")) return "kolokvij";
  if (t.startsWith("kviz")) return "kviz";
  if (t.startsWith("kontroln")) return "kontrolna";
  if (t.startsWith("obrana")) return "obrana";
  if (t.startsWith("ispit")) return "ispit";
  if (t.startsWith("laboratorij")) return "laboratorij";
  if (t.startsWith("domać")) return "domaca_zadaca";
  return null;
}

function MonitorIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function PlayNextIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"
      style={{ flexShrink: 0 }}>
      <path d="M5 4 L15 12 L5 20 Z" />
      <rect x="16" y="4" width="3" height="16" rx="0.5" />
    </svg>
  );
}

export function SlotCard({
  slot,
  showProf,
  onClick,
  timeStatus,
  topic,
}: {
  slot: Slot;
  showProf?: boolean;
  onClick?: () => void;
  timeStatus?: TimeStatus;
  topic?: string;
}) {
  const subj = subjectMap.get(slot.subject_id);
  const label = subj ? subj.short_name : slot.subject_id;
  const cc = getCourseColor(slot.subject_id);
  const gradingType = detectGradingType(topic);
  const sparkleColors = gradingType
    ? [cc.accent, cc.text, EVENT_COLOR[gradingType]]
    : null;

  return (
    <div
      onClick={onClick}
      className={`slot-cell cursor-pointer active:scale-[0.985] t-base transition-[filter,transform] group${timeStatus === "now" ? " slot-now" : ""}`}
      style={{
        background: cc.tint,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        boxShadow: sparkleColors
          ? `inset 0 0 0 1px color-mix(in srgb, ${cc.accent} 35%, transparent)`
          : "inset 0 0 0 1px rgb(255 255 255 / 0.04)",
      }}
    >
      {sparkleColors && (
        <Sparkle
          color={sparkleColors}
          count={14}
          minSize={2}
          maxSize={7}
          overflowPx={4}
          fadeOutSpeed={4}
          flicker={false}
          newSparkleOnFadeOut
        />
      )}

      {/* Left accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: cc.accent,
        }}
      />

      {/* Row 1: Course name (P/V) + badges */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="text-[13px] font-bold leading-none tracking-[-0.01em] truncate"
          style={{ color: cc.text }}
        >
          {label} <span className="font-semibold opacity-60">({slot.type})</span>
        </span>
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {slot.online && (
            <span
              className="slot-time-badge"
              aria-label="Online"
              title="Online"
              style={{
                background: "color-mix(in srgb, var(--u-approaching) 18%, transparent)",
                color: "var(--u-approaching)",
                border: "1px solid color-mix(in srgb, var(--u-approaching) 30%, transparent)",
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 6px",
              }}
            >
              <MonitorIcon />
            </span>
          )}
          {timeStatus === "now" && (
            <span className="slot-time-badge" style={{ background: cc.accent }}>SAT</span>
          )}
          {timeStatus === "next" && (
            <span
              className="slot-time-badge"
              aria-label="Sljedeće"
              title="Sljedeće"
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--foreground)",
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 6px",
              }}
            >
              <PlayNextIcon />
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Topic — truncated, grey, italic */}
      {topic && (
        <div className="mt-1.5 text-[11px] leading-snug truncate italic text-muted-fg opacity-60">
          {topic}
        </div>
      )}

      {/* Row 3: Meta — room · group · prof (room hidden when online; the top badge covers it) */}
      <div className="mt-1.5 text-muted-fg text-[11px] leading-none flex items-center gap-0 opacity-60 group-hover:opacity-90 t-fast transition-opacity">
        {!slot.online && slot.room && (
          <span className="font-medium tabular-nums">{slot.room}</span>
        )}
        {slot.group && (
          <>
            {!slot.online && slot.room && <MetaSep />}
            <span className="font-medium">{slot.group}</span>
          </>
        )}
        {showProf && slot.prof && (
          <>
            {((!slot.online && slot.room) || slot.group) && <MetaSep />}
            <span className="truncate">{slot.prof}</span>
          </>
        )}
      </div>
    </div>
  );
}
