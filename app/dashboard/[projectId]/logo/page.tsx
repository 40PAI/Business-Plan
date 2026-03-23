"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, Loader2 } from "lucide-react";
import { getProject, saveProject } from "@/lib/storage";
import type { Project } from "@/lib/types";

export default function LogoViewer() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push("/dashboard");
      return;
    }
    setProject(p);
  }, [projectId, router]);

  const handleRegenerate = async () => {
    if (!project) return;
    setIsRegenerating(true);
    setImgLoaded(false);
    setImgError(false);

    try {
      const res = await fetch("/api/generate/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: project.businessName,
          businessArea: project.businessArea,
          logoStyle: extractDual(project.answers[13], "dualA"),
          logoType: extractDual(project.answers[13], "dualB"),
        }),
      });

      const data = await res.json();
      project.artifacts.logo = { status: "done", urls: data.urls };
      saveProject(project);
      setProject({ ...project });
    } catch {
      // Keep existing logo
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!project) return null;

  const logoUrl = project.artifacts.logo.urls?.[0];

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05]">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href={`/dashboard/${projectId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao projecto
          </Link>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-accent-foreground/30 transition-all disabled:opacity-50"
          >
            {isRegenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Regenerar
          </button>
        </div>

        {/* Title */}
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground mb-2">
            Logo
          </p>
          <h1 className="font-serif italic text-4xl md:text-5xl tracking-tight text-foreground">
            {project.businessName}.
          </h1>
        </div>

        {/* Logo display */}
        {logoUrl ? (
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-full max-w-md aspect-square rounded-[2rem] overflow-hidden border border-border/50 bg-white shadow-xl">
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                  <Loader2 size={32} className="animate-spin text-muted-foreground" />
                </div>
              )}
              {imgError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/10 gap-3">
                  <p className="text-sm text-muted-foreground">Erro ao carregar o logo</p>
                  <button
                    onClick={handleRegenerate}
                    className="text-sm text-accent-foreground hover:underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`Logo ${project.businessName}`}
                className={`w-full h-full object-contain p-6 transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            </div>

            {imgLoaded && (
              <a
                href={logoUrl}
                download={`${project.businessName}-logo.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-105 duration-300"
              >
                <Download size={14} />
                Download PNG
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Nenhum logo disponível.</p>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="mt-4 text-sm text-accent-foreground hover:underline"
            >
              Gerar logo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function extractDual(answer: unknown, key: "dualA" | "dualB"): string {
  if (!answer || typeof answer !== "object" || !(key in (answer as Record<string, unknown>)))
    return "";
  return (answer as Record<string, string>)[key];
}
