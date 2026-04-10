"use client";

import { useState } from "react";
import { IconRenderer } from "./icon-renderer";
import type { SelectOption } from "@/lib/types";

interface ChipSelectProps {
  options: SelectOption[];
  mode: "single" | "multi";
  maxSelect?: number;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export function ChipSelect({ options, mode, maxSelect = 99, value, onChange }: ChipSelectProps) {
  const [otherText, setOtherText] = useState("");
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  const isSelected = (label: string) => selected.includes(label);

  const handleSelect = (label: string) => {
    if (label === "Outro") {
      if (mode === "single") {
        onChange("Outro");
      } else {
        if (isSelected("Outro")) {
          onChange(selected.filter((s) => s !== "Outro" && !s.startsWith("Outro: ")));
        } else if (selected.length < maxSelect) {
          onChange([...selected.filter((s) => !s.startsWith("Outro")), "Outro"]);
        }
      }
      return;
    }

    if (mode === "single") {
      onChange(label);
    } else {
      if (isSelected(label)) {
        onChange(selected.filter((s) => s !== label));
      } else if (selected.length < maxSelect) {
        onChange([...selected, label]);
      }
    }
  };

  const handleOtherText = (text: string) => {
    setOtherText(text);
    if (mode === "single") {
      onChange(text ? `Outro: ${text}` : "Outro");
    } else {
      const withoutOther = selected.filter((s) => s !== "Outro" && !s.startsWith("Outro: "));
      onChange([...withoutOther, text ? `Outro: ${text}` : "Outro"]);
    }
  };

  const showOtherInput =
    (mode === "single" && (value === "Outro" || (typeof value === "string" && value.startsWith("Outro")))) ||
    (mode === "multi" && selected.some((s) => s === "Outro" || s.startsWith("Outro")));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const active =
            option.label === "Outro"
              ? showOtherInput
              : isSelected(option.label);

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => handleSelect(option.label)}
              className={`group relative flex items-center gap-2.5 rounded-full border px-5 py-3 text-left text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] whitespace-nowrap ${
                active
                  ? "border-primary/60 bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              {option.icon && (
                <IconRenderer
                  name={option.icon}
                  size={16}
                  className={`shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                />
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {showOtherInput && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            type="text"
            autoFocus
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-foreground/30 transition-all"
            placeholder="Especifique..."
            value={otherText}
            onChange={(e) => handleOtherText(e.target.value)}
          />
        </div>
      )}

      {mode === "multi" && maxSelect < 90 && (
        <p className="text-xs text-muted-foreground font-mono">
          {selected.length}/{maxSelect} seleccionados
        </p>
      )}

      {mode === "multi" && maxSelect >= 90 && selected.length > 0 && (
        <p className="text-xs text-muted-foreground font-mono">
          {selected.length} seleccionados
        </p>
      )}
    </div>
  );
}
