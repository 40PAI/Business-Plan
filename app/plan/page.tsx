"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { STEPS } from "@/lib/steps";
import type { StepAnswer, Project, Step } from "@/lib/types";
import { saveProject } from "@/lib/storage";

import { ChipSelect } from "@/components/wizard/chip-select";
import { ConditionalFields } from "@/components/wizard/conditional-fields";
import { NumericInput } from "@/components/wizard/numeric-input";
import { DualSelect } from "@/components/wizard/dual-select";
import { NameGenerator } from "@/components/wizard/name-generator";
import { ContactInput } from "@/components/wizard/contact-input";
import { StepProgress } from "@/components/wizard/step-progress";
import { LogoTypeSelect } from "@/components/wizard/logo-type-select";

function getDefaultAnswer(step: Step): StepAnswer {
  switch (step.type) {
    case "single-select":
      return step.options?.[0]?.conditionalFields
        ? { selected: "", conditionalValues: {} }
        : "";
    case "multi-select":
      return step.options?.[0]?.conditionalFields
        ? { selected: [], conditionalValues: {} }
        : [];
    case "numeric-fields":
      return { numericValues: {}, currency: "Kz", channels: [] };
    case "text-input":
      return { textValue: "", aiGenerated: [], selectedName: undefined };
    case "dual-select":
      return { dualA: "", dualB: "" };
    case "logo-type-select":
      return "";
    case "contact-input":
      return { countryCode: "+244", whatsapp: "", email: "" };
    default:
      return "";
  }
}

function isStepValid(step: Step, answer: StepAnswer): boolean {
  switch (step.type) {
    case "single-select": {
      if (step.options?.[0]?.conditionalFields) {
        const a = answer as { selected: string; conditionalValues?: Record<string, string> };
        return !!a.selected;
      }
      return typeof answer === "string" && answer.length > 0;
    }
    case "multi-select": {
      if (step.options?.[0]?.conditionalFields) {
        const a = (answer as unknown) as { selected: string[]; conditionalValues?: Record<string, string> };
        return Array.isArray(a.selected) && a.selected.length > 0;
      }
      return Array.isArray(answer) && answer.length > 0;
    }
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
    case "logo-type-select":
      return typeof answer === "string" && answer.length > 0;
    case "contact-input": {
      const a = answer as { countryCode: string; whatsapp: string; email: string };
      const hasWhatsapp = a.whatsapp.length >= 6;
      const hasEmail = a.email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email);
      return hasWhatsapp || hasEmail;
    }
    default:
      return false;
  }
}

function extractBusinessName(answers: Record<number, StepAnswer>): string {
  const a11 = answers[11] as { textValue?: string; selectedName?: string } | undefined;
  return a11?.selectedName || a11?.textValue || "Sem nome";
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

function extractBusinessGoal(_answers: Record<number, StepAnswer>): string {
  return "N/D";
}

export default function PlanWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StepAnswer>>({});
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Restore from sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = sessionStorage.getItem("planai_wizard_progress_v2");
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

  // Compute active steps based on answers (Step 1 determines sector conditional fields)
  const activeSteps = useMemo(() => {
    const sectorAnswer = extractBusinessArea(answers);
    
    return STEPS.filter((step) => {
      if (!step.sectorCondition) return true;
      // Step has a sector condition. Show only if the selected sector matches one of the prefixes.
      return step.sectorCondition.some((condition) => 
        sectorAnswer.toLowerCase().includes(condition.toLowerCase())
      );
    });
  }, [answers]);

  // Adjust current index if it goes out of bounds when activeSteps shrinks
  useEffect(() => {
    if (activeSteps.length > 0 && currentStepIndex >= activeSteps.length) {
      setCurrentStepIndex(activeSteps.length - 1);
    }
  }, [activeSteps.length, currentStepIndex]);


  // Save progress to sessionStorage
  const persistProgress = useCallback(
    (updated: Record<number, StepAnswer>) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("planai_wizard_progress_v2", JSON.stringify(updated));
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
    if (currentStepIndex < activeSteps.length - 1) {
      animateTransition("next", () => setCurrentStepIndex((prev) => prev + 1));
    } else {
      handleGenerate();
    }
  };

  const handlePrev = () => {
    // If we go back and change sector, it might drop active steps
    // We deal with this mostly through the activeSteps filter
    if (currentStepIndex > 0) {
      animateTransition("prev", () => setCurrentStepIndex((prev) => prev - 1));
    } else {
      router.push("/");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const projectId = nanoid(10);

      // Extract contact info from step 13 — infer delivery preference from filled fields
      const contactAnswer = answers[13] as { countryCode: string; whatsapp: string; email: string } | undefined;
      const hasWhatsapp = (contactAnswer?.whatsapp?.length ?? 0) >= 6;
      const hasEmail = !!contactAnswer?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactAnswer.email);
      const deliveryPreference = hasWhatsapp && hasEmail ? "both" : hasWhatsapp ? "whatsapp" : "email";
      const contact = contactAnswer
        ? {
            countryCode: contactAnswer.countryCode,
            whatsapp: contactAnswer.whatsapp,
            email: contactAnswer.email,
            deliveryPreference,
          }
        : undefined;

      const project: Project = {
        id: projectId,
        createdAt: new Date().toISOString(),
        businessName: extractBusinessName(answers),
        businessArea: extractBusinessArea(answers),
        businessPhase: extractBusinessPhase(answers),
        businessGoal: extractBusinessGoal(answers),
        contact,
        answers,
        artifacts: {
          plan: { status: "pending" },
          logo: { status: "pending" },
          pitch: { status: "pending" },
        },
      };

      await saveProject(project);
      sessionStorage.removeItem("planai_wizard_progress_v2");
      router.push(`/dashboard/${projectId}`);
    } catch (err) {
      console.error("Error generating project:", err);
      setIsGenerating(false);
    }
  };

  if (!mounted || activeSteps.length === 0) return null;

  const step = activeSteps[currentStepIndex];
  const currentAnswer = answers[step.id] ?? getDefaultAnswer(step);
  const valid = isStepValid(step, currentAnswer);

  return (
    <div
      ref={container}
      className="relative min-h-screen bg-background text-foreground flex items-center justify-center p-3 sm:p-6 selection:bg-accent selection:text-white"
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
          <StepProgress currentStep={currentStepIndex} totalSteps={activeSteps.length} />
        </div>

        {/* Form Container */}
        <div
          ref={formRef}
          className="bg-secondary/20 backdrop-blur-xl border border-secondary/50 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-2xl min-h-[400px] overflow-hidden"
        >
          <div className="mb-3 text-sm font-medium text-accent-foreground">
            {step.block}
          </div>
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
              {/* Conditional fields logic handled below for both single and multi */}
            </div>
          )}

          {step.type === "multi-select" && step.options && (
            <div>
              <ChipSelect
                options={step.options}
                mode="multi"
                maxSelect={step.maxSelect}
                value={
                  step.options[0]?.conditionalFields
                    ? (currentAnswer as { selected: string[] }).selected || []
                    : (currentAnswer as string[])
                }
                onChange={(val) => {
                  if (step.options?.[0]?.conditionalFields) {
                    const prev = (currentAnswer as unknown) as { selected: string[]; conditionalValues?: Record<string, string> };
                    updateAnswer(step.id, {
                      selected: val as string[],
                      conditionalValues: prev.conditionalValues || {},
                    });
                  } else {
                    updateAnswer(step.id, val as string[]);
                  }
                }}
              />
            </div>
          )}

          {/* Render conditional fields for any selected options (works for single or multi) */}
          {step.options && step.options[0]?.conditionalFields && (() => {
            const ans = (currentAnswer as unknown) as { selected: string | string[]; conditionalValues?: Record<string, string> };
            const selectedArray = Array.isArray(ans.selected) ? ans.selected : ans.selected ? [ans.selected] : [];
            
            if (selectedArray.length === 0) return null;

            return (
              <div className="space-y-6 mt-8">
                {selectedArray.map((sel) => {
                  const option = step.options?.find((o) => o.label === sel);
                  if (!option?.conditionalFields) return null;

                  return (
                    <div key={sel} className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-accent-foreground/60">
                        <div className="h-px flex-1 bg-border" />
                        <span>Sobre: {sel}</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <ConditionalFields
                        fields={option.conditionalFields}
                        values={ans.conditionalValues || {}}
                        onChange={(vals) =>
                          updateAnswer(step.id, {
                            selected: ans.selected,
                            conditionalValues: { ...ans.conditionalValues, ...vals },
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}

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

          {step.type === "logo-type-select" && (
            <LogoTypeSelect
              value={currentAnswer as string}
              onChange={(val) => updateAnswer(step.id, val)}
            />
          )}

          {step.type === "contact-input" && (
            <ContactInput
              value={
                currentAnswer as {
                  countryCode: string;
                  whatsapp: string;
                  email: string;
                }
              }
              onChange={(val) => updateAnswer(step.id, val)}
            />
          )}

          {/* Next / Generate button */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!valid || isGenerating}
              className="group relative overflow-hidden rounded-full bg-foreground px-8 py-4 text-primary-foreground font-medium transition-all hover:scale-105 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] duration-500 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    A preparar plano...
                  </>
                ) : (
                  <>
                    {currentStepIndex === activeSteps.length - 1 ? "Gerar Business Plan" : "Continuar"}
                    {currentStepIndex === activeSteps.length - 1 ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </>
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
