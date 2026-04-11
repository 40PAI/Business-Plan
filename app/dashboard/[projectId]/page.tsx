"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, FileText, Palette, Presentation, Sparkles } from "lucide-react";

import { getProject, saveProject } from "@/lib/storage";
import type { Project } from "@/lib/types";
import { ArtifactCard } from "@/components/dashboard/artifact-card";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    // Deep clone artifacts to ensure React detects state changes
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

      const contentType = res.headers.get("content-type") || "";
      const planFormat = res.headers.get("x-plan-format");

      if (contentType.includes("application/json")) {
        // New structured JSON format
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        proj.artifacts.plan = {
          status: "done",
          content: JSON.stringify(data.plan),
        };
        updateProject(proj);
      } else {
        // Fallback: streaming markdown
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let content = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const clean = chunk
            .replace(/: ?OPENROUTER PROCESSING\n?/g, "")
            .replace(/OPENROUTER PROCESSING\n?/g, "");
          if (clean) {
            content += clean;
            proj.artifacts.plan = { status: "generating", content };
            updateProject(proj);
          }
        }
        // Mark as markdown format so viewer knows
        proj.artifacts.plan = { status: "done", content: `__MARKDOWN__\n${content}` };
        updateProject(proj);
      }
      // Suppress unused variable warning
      void planFormat;
    } catch (error) {
      proj.artifacts.plan = {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
      updateProject(proj);
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
      
      // Keep history: prepend the new one
      const currentUrls = proj.artifacts.logo.urls || [];
      proj.artifacts.logo = { 
        status: "done", 
        urls: [newUrl, ...currentUrls] 
      };
      await updateProject(proj);
    } catch (error) {
      proj.artifacts.logo = {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
      updateProject(proj);
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

      const data = await res.json();
      proj.artifacts.pitch = {
        status: "done",
        content: data.slides ? JSON.stringify(data.slides) : (data.raw || ""),
      };
      updateProject(proj);
    } catch (error) {
      proj.artifacts.pitch = {
        status: "error",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
      updateProject(proj);
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
    await Promise.all([
      generatePlan(proj),
      generateLogo(proj),
      generatePitch(proj),
    ]);

    // Send webhook after all artifacts are generated
    sendWebhook(proj);
  }, [generatePlan, generateLogo, generatePitch, sendWebhook]);

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

  const planPreview = project.artifacts.plan.content?.slice(0, 150) || undefined;

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

      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-12">
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

        {/* Artifact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="project-reveal">
            <ArtifactCard
              title="Business Plan"
              icon={<FileText className="text-accent-foreground" />}
              artifact={project.artifacts.plan}
              viewHref={`/dashboard/${projectId}/plan`}
              onRegenerate={() => generatePlan(project)}
              preview={planPreview}
            />
          </div>
          <div className="project-reveal">
            <ArtifactCard
              title="Logo"
              icon={<Palette className="text-accent-foreground" />}
              artifact={project.artifacts.logo}
              viewHref={`/dashboard/${projectId}/logo`}
              onRegenerate={() => generateLogo(project)}
              preview={
                project.artifacts.logo.urls
                  ? `${project.artifacts.logo.urls.length} variações geradas`
                  : undefined
              }
            />
          </div>
          <div className="project-reveal">
            <ArtifactCard
              title="Pitch Deck"
              icon={<Presentation className="text-accent-foreground" />}
              artifact={project.artifacts.pitch}
              viewHref={`/dashboard/${projectId}/pitch`}
              onRegenerate={() => generatePitch(project)}
              preview={
                project.artifacts.pitch.content
                  ? "10 slides prontos"
                  : undefined
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
