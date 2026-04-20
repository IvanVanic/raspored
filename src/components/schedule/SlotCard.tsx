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

type SparkleSpec = { top: string; left: string; size: number; delay: string; dur: string; shape: "star" | "burst" | "dot" };

const SPARKLES: SparkleSpec[] = [
  { top: "8%",  left: "6%",  size: 14, delay: "0s",   dur: "2.4s", shape: "star" },
  { top: "22%", left: "36%", size: 9,  delay: "0.3s", dur: "2.1s", shape: "burst" },
  { top: "14%", left: "74%", size: 12, delay: "0.8s", dur: "2.6s", shape: "star" },
  { top: "46%", left: "14%", size: 8,  delay: "1.2s", dur: "1.9s", shape: "burst" },
  { top: "38%", left: "58%", size: 6,  delay: "0.5s", dur: "1.7s", shape: "dot" },
  { top: "50%", left: "88%", size: 11, delay: "1.6s", dur: "2.3s", shape: "star" },
  { top: "70%", left: "28%", size: 13, delay: "0.1s", dur: "2.5s", shape: "star" },
  { top: "78%", left: "62%", size: 9,  delay: "1.0s", dur: "2.2s", shape: "burst" },
  { top: "62%", left: "48%", size: 6,  delay: "1.9s", dur: "1.8s", shape: "dot" },
  { top: "88%", left: "82%", size: 10, delay: "0.7s", dur: "2.4s", shape: "burst" },
  { top: "30%", left: "92%", size: 5,  delay: "2.2s", dur: "1.6s", shape: "dot" },
  { top: "84%", left: "10%", size: 8,  delay: "1.4s", dur: "2.0s", shape: "burst" },
];

const STAR_PATH = "M12 0 L14.4 9.6 L24 12 L14.4 14.4 L12 24 L9.6 14.4 L0 12 L9.6 9.6 Z";
const BURST_PATH = "M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z M12 5 L12 19 M5 12 L19 12";

function SparkleShape({ shape }: { shape: SparkleSpec["shape"] }) {
  if (shape === "dot") {
    return <circle cx="12" cy="12" r="5" fill="currentColor" />;
  }
  if (shape === "burst") {
    return (
      <>
        <path d={STAR_PATH} fill="currentColor" opacity="0.9" />
        <path d="M12 2 L12 22 M2 12 L22 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </>
    );
  }
  return <path d={STAR_PATH} fill="currentColor" />;
}

function SparkleOverlay({ color }: { color: string }) {
  return (
    <div className="sparkle-overlay" aria-hidden="true">
      {SPARKLES.map((s, i) => (
        <svg
          key={i}
          className={`sparkle sparkle-${s.shape}`}
          width={s.size}
          height={s.size}
          viewBox="0 0 24 24"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.dur,
            color,
          }}
        >
          <SparkleShape shape={s.shape} />
        </svg>
      ))}
    </div>
  );
}

function MonitorIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
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
  const sparkleColor = gradingType ? EVENT_COLOR[gradingType] : null;

  return (
    <div
      onClick={onClick}
      className={`slot-cell cursor-pointer active:scale-[0.985] t-base transition-[filter,transform] group${timeStatus === "now" ? " slot-now" : ""}`}
      style={{
        background: cc.tint,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        boxShadow: sparkleColor
          ? `inset 0 0 0 1px color-mix(in srgb, ${sparkleColor} 28%, transparent)`
          : "inset 0 0 0 1px rgb(255 255 255 / 0.04)",
      }}
    >
      {sparkleColor && <SparkleOverlay color={sparkleColor} />}

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
              style={{
                background: "color-mix(in srgb, var(--u-approaching) 18%, transparent)",
                color: "var(--u-approaching)",
                border: "1px solid color-mix(in srgb, var(--u-approaching) 30%, transparent)",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <MonitorIcon />
              ONLINE
            </span>
          )}
          {timeStatus === "now" && (
            <span className="slot-time-badge" style={{ background: cc.accent }}>SAT</span>
          )}
          {timeStatus === "next" && (
            <span className="slot-time-badge" style={{ background: "var(--muted-fg)" }}>SLJEDEĆE</span>
          )}
        </div>
      </div>

      {/* Row 2: Topic — truncated, grey, italic */}
      {topic && (
        <div className="mt-1.5 text-[11px] leading-snug truncate italic text-muted-fg opacity-60">
          {topic}
        </div>
      )}

      {/* Row 3: Meta — group · room · prof */}
      <div className="mt-1.5 text-muted-fg text-[11px] leading-none flex items-center gap-0 opacity-60 group-hover:opacity-90 t-fast transition-opacity">
        {slot.online ? (
          <span className="font-medium" style={{ color: "var(--u-approaching)", opacity: 1 }}>Online</span>
        ) : (
          <span className="font-medium tabular-nums">{slot.room}</span>
        )}
        {slot.group && (
          <>
            <MetaSep />
            <span className="font-medium">{slot.group}</span>
          </>
        )}
        {showProf && slot.prof && (
          <>
            <MetaSep />
            <span className="truncate">{slot.prof}</span>
          </>
        )}
      </div>
    </div>
  );
}
