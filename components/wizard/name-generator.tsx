"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";

interface NameGeneratorProps {
  value: {
    textValue: string;
    aiGenerated?: string[];
    selectedName?: string;
  };
  onChange: (value: {
    textValue: string;
    aiGenerated?: string[];
    selectedName?: string;
  }) => void;
  answers: Record<number, unknown>;
}

export function NameGenerator({ value, onChange, answers }: NameGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.names && data.names.length > 0) {
        onChange({ ...value, aiGenerated: data.names });
      } else {
        // API returned empty, use fallback
        onChange({ ...value, aiGenerated: generateFallbackNames() });
      }
    } catch {
      // Fallback names if API fails
      onChange({ ...value, aiGenerated: generateFallbackNames() });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackNames = () => {
    const prefixes = ["Nova", "Pulse", "Core", "Flow", "Apex", "Vibe", "Nexo", "Alto", "Prime", "Luma"];
    const suffixes = ["Tech", "Hub", "Lab", "Pro", "AI", "Go", "Plus", "X", "One", "IO"];
    const names: string[] = [];
    for (let i = 0; i < 10; i++) {
      const p = prefixes[i % prefixes.length];
      const s = suffixes[(i + 3) % suffixes.length];
      names.push(i % 2 === 0 ? `${p}${s}` : p);
    }
    return names;
  };

  const handleSelectName = (name: string) => {
    onChange({ ...value, textValue: name, selectedName: name });
  };

  return (
    <div className="space-y-6">
      {/* Text input */}
      <input
        type="text"
        className="w-full bg-background border border-border rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-accent-foreground/30 transition-all"
        placeholder="O nome do seu negócio..."
        value={value.textValue || ""}
        onChange={(e) =>
          onChange({ ...value, textValue: e.target.value, selectedName: undefined })
        }
      />

      {/* Separator */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          ou peça sugestões à IA
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="group relative w-full overflow-hidden rounded-2xl border border-border/50 bg-secondary/20 px-6 py-4 text-sm font-medium text-foreground transition-all hover:scale-[1.01] hover:border-accent-foreground/30 hover:bg-secondary/40 disabled:opacity-50 disabled:hover:scale-100"
      >
        <span className="flex items-center justify-center gap-2">
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              A gerar sugestões...
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-accent-foreground" />
              Gerar 10 sugestões de nome
            </>
          )}
        </span>
      </button>

      {/* Generated names */}
      {value.aiGenerated && value.aiGenerated.length > 0 && (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {value.aiGenerated.map((name) => {
            const active = value.selectedName === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSelectName(name)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
                  active
                    ? "border-accent-foreground/40 bg-secondary text-foreground shadow-md"
                    : "border-border/50 bg-secondary/20 text-muted-foreground hover:border-border hover:bg-secondary/40"
                }`}
              >
                <span>{name}</span>
                {active && <Check size={14} className="text-accent-foreground" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
