"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface DropdownProps {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
}

export function Dropdown({ options, value, onChange, placeholder = "Sve" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // All items including the clear option
  const allItems = [{ value: null as string | null, label: placeholder }, ...options.map(o => ({ value: o.value as string | null, label: o.label }))];

  const selectedLabel = value !== null ? options.find(o => o.value === value)?.label : null;

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  const select = useCallback((v: string | null) => {
    onChange(v);
    close();
  }, [onChange, close]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[focusedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < allItems.length) {
        select(allItems[focusedIndex].value);
      }
    }
  }, [open, focusedIndex, allItems, close, select]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(o => !o);
          setFocusedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "8px 14px 8px 12px",
          fontSize: "13px",
          fontWeight: 600,
          color: selectedLabel ? "var(--foreground)" : "var(--muted-fg)",
          cursor: "pointer",
          outline: "none",
          whiteSpace: "nowrap",
          minWidth: "180px",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <span>{selectedLabel ?? placeholder}</span>
        <ChevronIcon open={open} />
      </button>

      {/* Panel */}
      <div
        role="listbox"
        aria-label={placeholder}
        style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          minWidth: "100%",
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgb(0 0 0 / 0.5)",
          zIndex: 30,
          overflow: "hidden",
          // Animation
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-6px)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 150ms ease, transform 150ms ease",
        }}
      >
        <ul
          ref={listRef}
          style={{
            margin: 0,
            padding: "4px 0",
            listStyle: "none",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {allItems.map((item, idx) => {
            const isSelected = item.value === value || (item.value === null && value === null);
            const isFocused = idx === focusedIndex;
            return (
              <li
                key={item.value ?? "__clear__"}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setFocusedIndex(idx)}
                onMouseLeave={() => setFocusedIndex(-1)}
                onClick={() => select(item.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px",
                  fontSize: "12px",
                  fontWeight: isSelected ? 600 : 400,
                  color: item.value === null ? "var(--muted-fg)" : "var(--foreground)",
                  background: isFocused ? "var(--card)" : "transparent",
                  cursor: "pointer",
                  transition: "background 80ms ease",
                  userSelect: "none",
                }}
              >
                <span>{item.label}</span>
                {isSelected && item.value !== null && (
                  <CheckIcon />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{
        flexShrink: 0,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 150ms ease",
        color: "var(--muted-fg)",
      }}
    >
      <path
        d="M2 3.5L5 6.5L8 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      style={{ flexShrink: 0, color: "var(--foreground)" }}
    >
      <path
        d="M2 5.5L4.5 8L9 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
