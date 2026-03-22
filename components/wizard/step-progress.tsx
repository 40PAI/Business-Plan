"use client";

import { BLOCKS } from "@/lib/steps";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  // Find which block we're in
  let currentBlockIndex = 0;
  let stepsBeforeBlock = 0;
  for (let i = 0; i < BLOCKS.length; i++) {
    if (currentStep < stepsBeforeBlock + BLOCKS[i].steps.length) {
      currentBlockIndex = i;
      break;
    }
    stepsBeforeBlock += BLOCKS[i].steps.length;
  }

  const currentBlock = BLOCKS[currentBlockIndex];

  return (
    <div className="space-y-3">
      {/* Block label */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground">
          {currentBlock.name}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="flex gap-1.5">
        {BLOCKS.map((block, blockIdx) => {
          const blockSteps = block.steps.length;
          let blockProgress = 0;

          if (blockIdx < currentBlockIndex) {
            blockProgress = 100;
          } else if (blockIdx === currentBlockIndex) {
            const stepInBlock = currentStep - stepsBeforeBlock;
            blockProgress = ((stepInBlock + 1) / blockSteps) * 100;
          }

          // Recalculate stepsBeforeBlock for the check above
          // This is already handled correctly by the loop before

          return (
            <div
              key={block.name}
              className="flex-1 h-1 bg-secondary/50 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-accent-foreground rounded-full transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                style={{ width: `${blockProgress}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
