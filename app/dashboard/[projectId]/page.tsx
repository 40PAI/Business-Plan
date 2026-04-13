"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, FileText, Palette, Presentation, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

import { getProject, saveProject } from "@/lib/storage";
import type { Project } from "@/lib/types";
import { ArtifactCard } from "@/components/dashboard/artifact-card";

type GenerationPhase = "idle" | "plan" | "pitch" | "logo" | "done" | "error";
type FailedPhase = "plan" | "pitch" | "logo" | null;

const PHASE_LABELS: Record<"plan" | "pitch" | "logo", string> = {
  plan: "Business Plan",
  pitch: "Pitch Deck",
  logo: "Logo",
};

const PHASE_PROGRESS: Record<"plan" | "pitch" | "logo", number> = {
  logo: 33,
  pitch: 66,
  plan: 100,
};

const PHASE_STEP: Record<"plan" | "pitch" | "logo", string> = {
  logo: "1/3",
  pitch: "2/3",
  plan: "3/3",
};

function GenerationBanner({
  phase,
  failedPhase,
  onRetry,
}: {
  phase: GenerationPhase;
  failedPhase: FailedPhase;
  onRetry: () => void;
}) {
  if (phase === "idle" || phase === "done") return null;

  if (phase === "error" && failedPhase) {
    return (
      <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            Erro ao gerar <span className="font-semibold">{PHASE_LABELS[failedPhase]}</span>.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-xl border border-red-400/40 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-400/10 transition-all shrink-0"
        >
          <RefreshCw size={12} />
          Tentar novamente
        </button>
      </div>
    );
  }

  const activePhase = phase as "plan" | "pitch" | "logo";
  const progress = PHASE_PROGRESS[activePhase];

  return (
    <div className="mb-6 rounded-2xl border border-border/50 bg-secondary/20 backdrop-blur-md px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-foreground/80">
          A gerar <span className="font-semibold text-foreground">{PHASE_LABELS[activePhase]}</span>…
        </p>
        <span className="text-xs font-mono text-muted-foreground">{PHASE_STEP[activePhase]}</span>
      </div>
      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-foreground rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>("idle");
  const [failedPhase, setFailedPhase] = useState<FailedPhase>(null);
  const container = useRef<HTMLDivElement>(null);
  const hasStartedGeneration = useRef(false);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      const p = await getProject(projectId);
      if (!p) {
        router.push("/dashboard");
        return;
      }
      setProject(p);
      setIsLoading(false);
    }
    loadProject();
  }, [projectId, router]);

  const updateProject = useCallback(async (updated: Project) => {
    setProject({
      ...updated,
      artifacts: {
        plan: { ...updated.artifacts.plan },
        logo: { ...updated.artifacts.logo },
        pitch: { ...updated.artifacts.pitch },
      },
    });
    await saveProject(updated);
  }, []);

  // Auto-generate on first load if all artifacts are pending
  useEffect(() => {
    if (!project || hasStartedGeneration.current) return;
    const allPending =
      project.artifacts.plan.status === "pending" &&
      project.artifacts.logo.status === "pending" &&
      project.artifacts.pitch.status === "pending";

    if (allPending) {
      hasStartedGeneration.current = true;
      generateAll(project);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const generatePlan = useCallback(async (proj: Project) => {
    proj.artifacts.plan = { status: "generating" };
    updateProject(proj);

    try {
      const res = await fetch("/api/generate/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: proj.answers }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      // Plan now returns a single JSON object (not a stream).
      // Store raw JSON — the plan viewer will detect and use JSONPlanRenderer.
      const text = await res.text();
      let content = text.trim();

      // Verify it's valid JSON; fall back to markdown mode if not.
      try {
        JSON.parse(content);
      } catch {
        content = `__MARKDOWN__\n${content}`;
      }

      proj.artifacts.plan = { status: "done", content };
      updateProject(proj);

      // Auto-upload plan as DOC to Supabase Storage
      try {
        const { getPlanDOCBlob } = await import("@/lib/pdf");
        let planData = null;
        try { planData = JSON.parse(content); } catch { /* markdown fallback */ }
        const docBlob = getPlanDOCBlob(proj.businessName, planData || content);
        const fd = new FormData();
        fd.append("projectId", proj.id);
        fd.append("file", docBlob, `${proj.businessName.replace(/\s+/g, "_")}_Plan.doc`);
        const up = await fetch("/api/upload/document", { method: "POST", body: fd });
        if (up.ok) {
          const { publicUrl } = await up.json();
          proj.artifacts.plan.fileUrl = publicUrl;
          updateProject(proj);
        }
      } catch (upErr) {
        console.warn("Auto-upload plan DOC failed (non-fatal):", upErr);
      }
    } catch (error) {
      proj.artifacts.plan = {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
      updateProject(proj);
      throw error; // re-throw so generateAll catches it
    }
  }, [updateProject]);

  const generateLogo = useCallback(async (proj: Project) => {
    proj.artifacts.logo = { status: "generating" };
    updateProject(proj);

    try {
      const res = await fetch("/api/generate/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: proj.answers, projectId: proj.id }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const newUrl = data.storageUrl || data.urls[0];
      const currentUrls = proj.artifacts.logo.urls || [];
      proj.artifacts.logo = {
        status: "done",
        urls: [newUrl, ...currentUrls],
      };
      await updateProject(proj);
    } catch (error) {
      proj.artifacts.logo = {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
      updateProject(proj);
      throw error;
    }
  }, [updateProject]);

  const generatePitch = useCallback(async (proj: Project) => {
    proj.artifacts.pitch = { status: "generating" };
    updateProject(proj);

    try {
      const res = await fetch("/api/generate/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: proj.answers }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      // Stream the response and accumulate content
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullContent += decoder.decode(value, { stream: true });
      }

      // Parse slides JSON from accumulated content
      let slides = null;
      try {
        const cleaned = fullContent
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        slides = JSON.parse(cleaned);
      } catch {
        try {
          const match = fullContent.match(/\[[\s\S]*\]/);
          if (match) slides = JSON.parse(match[0]);
        } catch {
          slides = null;
        }
      }

      const pitchContent = Array.isArray(slides) ? JSON.stringify(slides) : fullContent;
      proj.artifacts.pitch = { status: "done", content: pitchContent };
      updateProject(proj);

      // Auto-upload pitch JSON to Supabase Storage
      try {
        const pitchBlob = new Blob([pitchContent], { type: "application/json" });
        const fd = new FormData();
        fd.append("projectId", proj.id);
        fd.append("file", pitchBlob, `${proj.businessName.replace(/\s+/g, "_")}_Pitch.json`);
        const up = await fetch("/api/upload/document", { method: "POST", body: fd });
        if (up.ok) {
          const { publicUrl } = await up.json();
          proj.artifacts.pitch.fileUrl = publicUrl;
          updateProject(proj);
        }
      } catch (upErr) {
        console.warn("Auto-upload pitch failed (non-fatal):", upErr);
      }
    } catch (error) {
      proj.artifacts.pitch = {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
      updateProject(proj);
      throw error;
    }
  }, [updateProject]);

  const sendWebhook = useCallback(async (proj: Project) => {
    if (proj.webhookSent) return;
    try {
      const payload = {
        projectId: proj.id,
        createdAt: proj.createdAt,
        businessName: proj.businessName,
        businessArea: proj.businessArea,
        businessPhase: proj.businessPhase,
        businessGoal: proj.businessGoal,
        contact: proj.contact || null,
        plan: proj.artifacts.plan.content || null,
        logoUrl: proj.artifacts.logo.urls?.[0] || null,
        pitch: proj.artifacts.pitch.content || null,
      };

      await fetch(
        "https://automacoes.plenuz.co.ao/webhook/b09ca47f-521e-411b-86d4-f97909a8cf17",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      proj.webhookSent = true;
      updateProject(proj);
    } catch (err) {
      console.error("Webhook error:", err);
    }
  }, [updateProject]);

  const generateAll = useCallback(async (proj: Project) => {
    setFailedPhase(null);
    let currentPhase: "plan" | "pitch" | "logo" = "plan";

    try {
      // Sequential generation — all three share the same `proj` object reference.
      // Because calls are awaited one at a time, there are zero concurrent mutations.
      // Each phase re-checks status so partial retries skip already-done artifacts.

      // Order: logo → pitch → plan
      // Logo is fastest, plan is slowest (5 streaming chunks)
      if (proj.artifacts.logo.status !== "done") {
        currentPhase = "logo";
        setGenerationPhase("logo");
        await generateLogo(proj);
      }

      if (proj.artifacts.pitch.status !== "done") {
        currentPhase = "pitch";
        setGenerationPhase("pitch");
        await generatePitch(proj);
      }

      if (proj.artifacts.plan.status !== "done") {
        currentPhase = "plan";
        setGenerationPhase("plan");
        await generatePlan(proj);
      }

      setGenerationPhase("done");

      // sendWebhook has its own try/catch — failures never affect generationPhase
      try {
        await sendWebhook(proj);
      } catch (err) {
        console.error("Webhook error (non-fatal):", err);
      }
    } catch (err) {
      setFailedPhase(currentPhase);
      setGenerationPhase("error");
    }
  }, [generatePlan, generatePitch, generateLogo, sendWebhook]);

  useGSAP(
    () => {
      gsap.from(".project-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
    },
    { scope: container }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-mono text-sm animate-pulse">Obtendo projecto do Supabase...</p>
      </div>
    );
  }

  if (!project) return null;

  const rawPlanContent = project.artifacts.plan.content || "";
  let planPreview: string | undefined;
  if (rawPlanContent) {
    if (rawPlanContent.startsWith("__MARKDOWN__\n")) {
      planPreview = rawPlanContent.slice("__MARKDOWN__\n".length).replace(/^#+\s*/gm, "").replace(/\*\*/g, "").slice(0, 150);
    } else {
      try {
        const parsed = JSON.parse(rawPlanContent);
        // Extract first text block from first section for preview
        const firstSection = parsed.sections?.[0];
        const firstTextBlock = firstSection?.blocks?.find((b: { type: string }) => b.type === "text");
        planPreview = firstTextBlock?.content?.slice(0, 150) ?? parsed.cover?.tagline?.slice(0, 150);
      } catch {
        planPreview = rawPlanContent.slice(0, 150);
      }
    }
  }

  return (
    <div
      ref={container}
      className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-white"
    >
      {/* Noise */}
      <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05]">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-chart-1/10 blur-[120px] rounded-full mix-blend-screen translate-x-1/4 -translate-y-1/4" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="project-reveal flex items-center gap-4 mb-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={20} className="text-muted-foreground" />
          </Link>
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border border-border">
            <Sparkles size={18} className="text-accent-foreground" />
          </div>
        </div>

        {/* Project info */}
        <div className="project-reveal mb-10">
          <h1 className="font-serif italic text-4xl md:text-5xl tracking-tight text-foreground mb-2">
            {project.businessName}.
          </h1>
          <p className="text-muted-foreground">
            {project.businessArea} ·{" "}
            {new Date(project.createdAt).toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Generation progress banner */}
        <GenerationBanner
          phase={generationPhase}
          failedPhase={failedPhase}
          onRetry={() => generateAll(project)}
        />

        {/* Artifact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="project-reveal">
            <ArtifactCard
              title="Business Plan"
              icon={<FileText className="text-accent-foreground" />}
              artifact={project.artifacts.plan}
              viewHref={`/dashboard/${projectId}/plan`}
              onRegenerate={() => {
                project.artifacts.plan = { status: "pending" };
                generateAll(project);
              }}
              preview={planPreview}
            />
          </div>
          <div className="project-reveal">
            <ArtifactCard
              title="Pitch Deck"
              icon={<Presentation className="text-accent-foreground" />}
              artifact={project.artifacts.pitch}
              viewHref={`/dashboard/${projectId}/pitch`}
              onRegenerate={() => {
                project.artifacts.pitch = { status: "pending" };
                generateAll(project);
              }}
              preview={
                project.artifacts.pitch.content
                  ? "15 slides prontos"
                  : undefined
              }
            />
          </div>
          <div className="project-reveal">
            <ArtifactCard
              title="Logo"
              icon={<Palette className="text-accent-foreground" />}
              artifact={project.artifacts.logo}
              viewHref={`/dashboard/${projectId}/logo`}
              onRegenerate={() => {
                project.artifacts.logo = { status: "pending" };
                generateAll(project);
              }}
              preview={
                project.artifacts.logo.urls
                  ? `${project.artifacts.logo.urls.length} variações geradas`
                  : undefined
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
