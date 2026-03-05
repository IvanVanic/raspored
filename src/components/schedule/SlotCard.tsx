import type { Slot, UrgencyLevel } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { getCourseColor } from "@/lib/labels";
import { MetaSep } from "@/components/shared/MetaSep";

export type TimeStatus = "now" | "next" | null;

export function SlotCard({
  slot,
  showProf,
  onClick,
  urgency,
  timeStatus,
  topic,
}: {
  slot: Slot;
  showProf?: boolean;
  onClick?: () => void;
  urgency?: UrgencyLevel;
  timeStatus?: TimeStatus;
  topic?: string;
}) {
  const subj = subjectMap.get(slot.subject_id);
  const label = subj ? subj.short_name : slot.subject_id;
  const cc = getCourseColor(slot.subject_id);

  const urgencyColor =
    urgency === "critical"
      ? "var(--u-critical)"
      : urgency === "approaching"
      ? "var(--u-approaching)"
      : undefined;

  return (
    <div
      onClick={onClick}
      className={`slot-cell cursor-pointer active:scale-[0.985] t-base transition-[filter,transform] group${timeStatus === "now" ? " slot-now" : ""}`}
      style={{
        background: cc.tint,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.04)",
      }}
    >
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
        {urgencyColor && (
          <span className="urgency-dot shrink-0" style={{ background: urgencyColor }} />
        )}
        <div className="ml-auto flex items-center gap-1 shrink-0">
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
        {slot.group && (
          <>
            <span className="font-medium">{slot.group}</span>
            <MetaSep />
          </>
        )}
        <span className="font-medium tabular-nums">{slot.room}</span>
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
