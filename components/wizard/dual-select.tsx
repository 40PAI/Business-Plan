"use client";

import { IconRenderer } from "./icon-renderer";
import type { DualSelectGroup } from "@/lib/types";

interface DualSelectProps {
  groups: DualSelectGroup[];
  value: { dualA: string; dualB: string };
  onChange: (value: { dualA: string; dualB: string }) => void;
}

export function DualSelect({ groups, value, onChange }: DualSelectProps) {
  const handleSelect = (groupIndex: number, label: string) => {
    if (groupIndex === 0) {
      onChange({ ...value, dualA: label });
    } else {
      onChange({ ...value, dualB: label });
    }
  };

  const getSelected = (groupIndex: number) =>
    groupIndex === 0 ? value.dualA : value.dualB;

  return (
    <div className="space-y-10">
      {groups.map((group, groupIndex) => (
        <div key={group.title}>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {group.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {group.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {group.options.map((option) => {
              const active = getSelected(groupIndex) === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleSelect(groupIndex, option.label)}
                  className={`group relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] ${
                    active
                      ? "border-primary/60 bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  {option.icon && (
                    <IconRenderer
                      name={option.icon}
                      size={18}
                      className={
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
