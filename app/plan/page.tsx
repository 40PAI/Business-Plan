"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { STEPS } from "@/lib/steps";
import type { StepAnswer, Project } from "@/lib/types";
import { saveProject } from "@/lib/storage";

import { ChipSelect } from "@/components/wizard/chip-select";
import { ConditionalFields } from "@/components/wizard/conditional-fields";
import { NumericInput } from "@/components/wizard/numeric-input";
import { DualSelect } from "@/components/wizard/dual-select";
import { NameGenerator } from "@/components/wizard/name-generator";
import { StepProgress } from "@/components/wizard/step-progress";

function getDefaultAnswer(stepIndex: number): StepAnswer {
  const step = STEPS[stepIndex];
  switch (step.type) {
    case "single-select":
      return step.options?.[0]?.conditionalFields
        ? { selected: "", conditionalValues: {} }
        : "";
    case "multi-select":
      return [];
    case "numeric-fields":
      return { numericValues: {}, currency: "Kz", channels: [] };
    case "text-input":
      return { textValue: "", aiGenerated: [], selectedName: undefined };
    case "dual-select":
      return { dualA: "", dualB: "" };
    default:
      return "";
  }
}

function isStepValid(stepIndex: number, answer: StepAnswer): boolean {
  const step = STEPS[stepIndex];

  switch (step.type) {
    case "single-select": {
      if (step.options?.[0]?.conditionalFields) {
        const a = answer as { selected: string; conditionalValues?: Record<string, string> };
        return !!a.selected;
      }
      return typeof answer === "string" && answer.length > 0;
    }
    case "multi-select":
      return Array.isArray(answer) && answer.length > 0;
    case "numeric-fields": {
      const a = answer as { numericValues: Record<string, string>; currency: string; channels: string[] };
      const allFilled = step.numericFields?.every(
        (f) => a.numericValues[f.key] && a.numericValues[f.key].length > 0
      );
      return !!allFilled && a.channels.length > 0;
    }
    case "text-input": {
      const a = answer as { textValue: string };
      return !!a.textValue && a.textValue.trim().length >= 2;
    }
    case "dual-select": {
      const a = answer as { dualA: string; dualB: string };
      return !!a.dualA && !!a.dualB;
    }
    default:
      return false;
  }
}

function extractBusinessName(answers: Record<number, StepAnswer>): string {
  const a12 = answers[12] as { textValue?: string; selectedName?: string } | undefined;
  return a12?.selectedName || a12?.textValue || "Sem nome";
}

function extractBusinessArea(answers: Record<number, StepAnswer>): string {
  const a1 = answers[1];
  if (typeof a1 === "string") return a1;
  return "N/D";
}

function extractBusinessPhase(answers: Record<number, StepAnswer>): string {
  const a2 = answers[2];
  if (typeof a2 === "string") return a2;
  if (typeof a2 === "object" && a2 && "selected" in a2) return a2.selected as string;
  return "N/D";
}

function extractBusinessGoal(answers: Record<number, StepAnswer>): string {
  const a11 = answers[11];
  if (typeof a11 === "string") return a11;
  return "N/D";
}

export default function PlanWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StepAnswer>>({});
  const [mounted, setMounted] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Restore from sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = sessionStorage.getItem("planai_wizard_progress");
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!mounted || !formRef.current) return;
      gsap.from(formRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    },
    { scope: container, dependencies: [mounted] }
  );

  // Save progress to sessionStorage
  const persistProgress = useCallback(
    (updated: Record<number, StepAnswer>) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("planai_wizard_progress", JSON.stringify(updated));
      }
    },
    []
  );

  const updateAnswer = (stepId: number, value: StepAnswer) => {
    const updated = { ...answers, [stepId]: value };
    setAnswers(updated);
    persistProgress(updated);
  };

  const animateTransition = (direction: "next" | "prev", callback: () => void) => {
    const xOffset = direction === "next" ? -30 : 30;
    gsap.to(formRef.current, {
      x: xOffset,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        callback();
        gsap.fromTo(
          formRef.current,
          { x: -xOffset, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
        );
      },
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      animateTransition("next", () => setCurrentStep((prev) => prev + 1));
    } else {
      handleGenerate();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      animateTransition("prev", () => setCurrentStep((prev) => prev - 1));
    } else {
      router.push("/");
    }
  };

  const handleGenerate = () => {
    const projectId = nanoid(10);
    const project: Project = {
      id: projectId,
      createdAt: new Date().toISOString(),
      businessName: extractBusinessName(answers),
      businessArea: extractBusinessArea(answers),
      businessPhase: extractBusinessPhase(answers),
      businessGoal: extractBusinessGoal(answers),
      answers,
      artifacts: {
        plan: { status: "pending" },
        logo: { status: "pending" },
        pitch: { status: "pending" },
      },
    };

    saveProject(project);
    sessionStorage.removeItem("planai_wizard_progress");
    router.push(`/dashboard/${projectId}`);
  };

  const step = STEPS[currentStep];
  const currentAnswer = answers[step.id] ?? getDefaultAnswer(currentStep);
  const valid = isStepValid(currentStep, currentAnswer);

  return (
    <div
      ref={container}
      className="relative min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-accent selection:text-white"
    >
      {/* Noise Overlay */}
      <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05]">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vh] bg-chart-1/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vh] bg-accent/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 w-full max-w-2xl">
        {/* Progress header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border">
              <Sparkles size={14} className="text-accent-foreground" />
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="mb-10">
          <StepProgress currentStep={currentStep} totalSteps={STEPS.length} />
        </div>

        {/* Form Container */}
        <div
          ref={formRef}
          className="bg-secondary/20 backdrop-blur-xl border border-secondary/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          <h2 className="font-serif italic text-3xl md:text-4xl tracking-tight mb-3 text-foreground">
            {step.title}.
          </h2>
          <p className="text-muted-foreground font-light text-base mb-8">
            {step.description}
          </p>

          {/* Step content by type */}
          {step.type === "single-select" && step.options && (
            <div>
              <ChipSelect
                options={step.options}
                mode="single"
                value={
                  step.options[0]?.conditionalFields
                    ? (currentAnswer as { selected: string }).selected || ""
                    : (currentAnswer as string)
                }
                onChange={(val) => {
                  if (step.options?.[0]?.conditionalFields) {
                    const prev = currentAnswer as { selected: string; conditionalValues?: Record<string, string> };
                    updateAnswer(step.id, {
                      selected: val as string,
                      conditionalValues: prev.conditionalValues || {},
                    });
                  } else {
                    updateAnswer(step.id, val as string);
                  }
                }}
              />
              {/* Conditional fields for step 2 */}
              {step.options[0]?.conditionalFields && (() => {
                const ans = currentAnswer as { selected: string; conditionalValues?: Record<string, string> };
                const selectedOption = step.options?.find((o) => o.label === ans.selected);
                if (selectedOption?.conditionalFields) {
                  return (
                    <ConditionalFields
                      fields={selectedOption.conditionalFields}
                      values={ans.conditionalValues || {}}
                      onChange={(vals) =>
                        updateAnswer(step.id, {
                          selected: ans.selected,
                          conditionalValues: vals,
                        })
                      }
                    />
                  );
                }
                return null;
              })()}
            </div>
          )}

          {step.type === "multi-select" && step.options && (
            <ChipSelect
              options={step.options}
              mode="multi"
              maxSelect={step.maxSelect}
              value={currentAnswer as string[]}
              onChange={(val) => updateAnswer(step.id, val as string[])}
            />
          )}

          {step.type === "numeric-fields" && step.numericFields && (
            <NumericInput
              fields={step.numericFields}
              subSelect={step.subSelect}
              value={
                currentAnswer as {
                  numericValues: Record<string, string>;
                  currency: string;
                  channels: string[];
                }
              }
              onChange={(val) => updateAnswer(step.id, val)}
            />
          )}

          {step.type === "text-input" && (
            <NameGenerator
              value={
                currentAnswer as {
                  textValue: string;
                  aiGenerated?: string[];
                  selectedName?: string;
                }
              }
              onChange={(val) => updateAnswer(step.id, val)}
              answers={answers}
            />
          )}

          {step.type === "dual-select" && step.dualGroups && (
            <DualSelect
              groups={step.dualGroups}
              value={currentAnswer as { dualA: string; dualB: string }}
              onChange={(val) => updateAnswer(step.id, val)}
            />
          )}

          {/* Next / Generate button */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!valid}
              className="group relative overflow-hidden rounded-full bg-foreground px-8 py-4 text-primary-foreground font-medium transition-all hover:scale-105 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] duration-500 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {currentStep === STEPS.length - 1 ? "Gerar Business Plan" : "Continuar"}
                {currentStep === STEPS.length - 1 ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </span>
              <div className="absolute inset-0 z-0 bg-accent translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
