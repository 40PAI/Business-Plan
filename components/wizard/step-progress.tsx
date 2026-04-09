"use client";

import { STEPS, BLOCKS } from "@/lib/steps";
import { useMemo } from "react";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  // To keep the segmented progress bar looking good with dynamic steps,
  // we count how many active steps belong to each block.
  // We assume that the 'currentStep' passed here is the index within the activeSteps array.
  
  // Reconstruct activeSteps just for reference (or pass it down, but we can compute it if we know the currentStep ID,
  // however since page.tsx only passes currentStep index, we should pass activeSteps or just use a simpler visual approach.
  // Wait, if we just use the global STEPS, the blocks array in steps.ts doesn't have the dynamic steps mapped cleanly to the `steps` array
  // because dynamic steps don't have IDs in `BLOCKS[3].steps`.
  
  // Let's modify the props to accept activeSteps directly or we can just render a simpler unified progress bar.
  // Since we want segmented lines, let's just create segments based on the blocks of the CURRENT active steps.
  
  return (
    <div className="space-y-3">
      {/* Block label */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground">
          Progresso
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Unified Progress bar since dynamic blocks break the strict 7-segment hardcoded array */}
      <div className="h-1 bg-secondary/50 rounded-full overflow-hidden w-full relative">
        <div
          className="absolute left-0 top-0 h-full bg-accent-foreground transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
