"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type PillDropdownOption = {
  label: string;
  value: string;
};

type PillDropdownProps = {
  className?: string;
  id?: string;
  label: string;
  onChange: (value: string) => void;
  options: PillDropdownOption[];
  value: string;
};

export default function PillDropdown({
  className,
  id,
  label,
  onChange,
  options,
  value,
}: PillDropdownProps) {
  const reactId = useId();
  const buttonId = id ?? `pill-dropdown-${reactId}`;
  const listboxId = `${buttonId}-listbox`;
  const optionIdPrefix = `${buttonId}-option`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedIndex = useMemo(() => {
    const idx = options.findIndex((option) => option.value === value);
    return idx >= 0 ? idx : 0;
  }, [options, value]);
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);

  const selectedOption = options[selectedIndex] ?? options[0];

  useEffect(() => {
    setHighlightedIndex(selectedIndex);
  }, [selectedIndex]);

  const closeMenu = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const commitSelection = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    listboxRef.current?.focus();
    const activeOption = document.getElementById(`${optionIdPrefix}-${highlightedIndex}`);
    activeOption?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen, optionIdPrefix]);

  const moveHighlight = (direction: 1 | -1) => {
    setHighlightedIndex((currentIndex) => {
      if (options.length === 0) {
        return 0;
      }

      if (currentIndex < 0) {
        return direction === 1 ? 0 : options.length - 1;
      }

      return (currentIndex + direction + options.length) % options.length;
    });
  };

  return (
    <div ref={rootRef} className={clsx("relative inline-flex", className)}>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={label}
        className={clsx(
          "inline-flex min-w-[11rem] items-center justify-between gap-3 rounded-full border border-black bg-gray-200 px-4 py-1.5 text-left font-light text-black transition-colors hover:bg-gray-300 focus:outline-none"
        )}
        onClick={() => {
          if (options.length === 0) {
            return;
          }
          setIsOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (options.length === 0) {
            return;
          }

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
            setHighlightedIndex(event.key === "ArrowDown" ? selectedIndex : Math.max(selectedIndex, 0));
          }
        }}
      >
        <span className="truncate">{selectedOption?.label ?? label}</span>
        <span
          aria-hidden="true"
          className={clsx(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/40 text-black transition-transform duration-150",
            isOpen && "rotate-180"
          )}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 4.5 6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={buttonId}
          aria-activedescendant={`${optionIdPrefix}-${highlightedIndex}`}
          className="absolute left-0 top-[calc(100%+0.5rem)] z-20 min-w-full rounded-[1.5rem] border border-black bg-gray-300 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.18)] focus:outline-none"
          onKeyDown={(event) => {
            if (options.length === 0) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveHighlight(1);
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              moveHighlight(-1);
              return;
            }

            if (event.key === "Home") {
              event.preventDefault();
              setHighlightedIndex(0);
              return;
            }

            if (event.key === "End") {
              event.preventDefault();
              setHighlightedIndex(options.length - 1);
              return;
            }

            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              const nextOption = options[highlightedIndex];
              if (nextOption) {
                commitSelection(nextOption.value);
              }
              return;
            }

            if (event.key === "Tab") {
              closeMenu();
            }
          }}
        >
          <div className="max-h-64 overflow-y-auto">
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={option.value}
                  id={`${optionIdPrefix}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={clsx(
                    "flex w-full items-center rounded-full px-3 py-2 text-left font-light text-black transition-colors",
                    isSelected && "bg-black text-white",
                    !isSelected && isHighlighted && "bg-gray-200",
                    !isSelected && !isHighlighted && "hover:bg-gray-200"
                  )}
                  onMouseEnter={() => {
                    setHighlightedIndex(index);
                  }}
                  onClick={() => {
                    commitSelection(option.value);
                  }}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
