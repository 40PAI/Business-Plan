"use client";

import { useState } from "react";
import type { NumericField, SelectOption } from "@/lib/types";
import { ChipSelect } from "./chip-select";

interface NumericInputProps {
  fields: NumericField[];
  subSelect?: {
    label: string;
    options: SelectOption[];
    maxSelect: number;
  };
  value: {
    numericValues: Record<string, string>;
    currency: string;
    channels: string[];
  };
  onChange: (value: {
    numericValues: Record<string, string>;
    currency: string;
    channels: string[];
  }) => void;
}

export function NumericInput({ fields, subSelect, value, onChange }: NumericInputProps) {
  const [currency, setCurrency] = useState(value.currency || "Kz");

  const handleNumericChange = (key: string, val: string) => {
    const cleaned = val.replace(/[^\d.]/g, "");
    onChange({
      ...value,
      numericValues: { ...value.numericValues, [key]: cleaned },
    });
  };

  const handleCurrencyChange = (cur: string) => {
    setCurrency(cur);
    onChange({ ...value, currency: cur });
  };

  const formatDisplay = (val: string) => {
    if (!val) return "";
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString("pt-AO");
  };

  return (
    <div className="space-y-6">
      {/* Currency selector */}
      <div className="flex gap-2">
        {["Kz", "USD", "EUR"].map((cur) => (
          <button
            key={cur}
            type="button"
            onClick={() => handleCurrencyChange(cur)}
            className={`px-4 py-2 rounded-full text-sm font-mono font-medium transition-all duration-300 ${
              currency === cur
                ? "bg-foreground text-primary-foreground"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            {cur}
          </button>
        ))}
      </div>

      {/* Numeric fields */}
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {field.label}
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-accent-foreground/30 transition-all"
              placeholder={field.placeholder}
              value={formatDisplay(value.numericValues[field.key] || "")}
              onChange={(e) => handleNumericChange(field.key, e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
              {currency}
            </span>
          </div>
        </div>
      ))}

      {/* Sub-select for channels */}
      {subSelect && (
        <div className="mt-8 pt-6 border-t border-border/50">
          <h4 className="text-sm font-medium text-foreground/80 mb-4">
            {subSelect.label}
          </h4>
          <ChipSelect
            options={subSelect.options}
            mode="multi"
            maxSelect={subSelect.maxSelect}
            value={value.channels}
            onChange={(channels) =>
              onChange({ ...value, channels: channels as string[] })
            }
          />
        </div>
      )}
    </div>
  );
}
