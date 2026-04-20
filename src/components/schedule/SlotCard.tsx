import type { Slot } from "@/data/types";
import { subjectMap } from "@/data/schedule";
import { getCourseColor } from "@/lib/labels";
import { MetaSep } from "@/components/shared/MetaSep";

export type TimeStatus = "now" | "next" | null;

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
