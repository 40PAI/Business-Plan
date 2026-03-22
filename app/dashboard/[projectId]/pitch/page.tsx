"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { getProject } from "@/lib/storage";
import type { Project } from "@/lib/types";

interface Slide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  speakerNotes?: string;
}

export default function PitchViewer() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push("/dashboard");
      return;
    }
    setProject(p);

    // Parse slides
    if (p.artifacts.pitch.content) {
      try {
        const parsed = JSON.parse(p.artifacts.pitch.content);
        if (Array.isArray(parsed)) {
          setSlides(parsed);
        }
      } catch {
        // If content is a string (raw), try to parse it
        try {
          const cleaned = p.artifacts.pitch.content
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            setSlides(parsed);
          }
        } catch {
          setSlides([]);
        }
      }
    }
  }, [projectId, router]);

  const handleExportPDF = useCallback(async () => {
    if (!project || exporting || slides.length === 0) return;
    setExporting(true);
    try {
      const { generatePitchPDF } = await import("@/lib/pdf");
      generatePitchPDF(project.businessName, slides);
    } finally {
      setExporting(false);
    }
  }, [project, exporting, slides]);

  if (!project) return null;

  const slide = slides[currentSlide];
  const total = slides.length;

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05]">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-12">
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
            onClick={handleExportPDF}
            disabled={exporting || slides.length === 0}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-accent-foreground/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? "A exportar..." : "Exportar PDF"}
          </button>
        </div>

        {/* Title */}
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground mb-2">
            Pitch Deck
          </p>
          <h1 className="font-serif italic text-4xl md:text-5xl tracking-tight text-foreground">
            {project.businessName}.
          </h1>
        </div>

        {slides.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Nenhum slide disponível.</p>
          </div>
        ) : (
          <>
            {/* Slide viewer */}
            <div className="bg-secondary/20 backdrop-blur-xl border border-secondary/50 rounded-[2.5rem] p-10 md:p-16 shadow-2xl min-h-[400px] flex flex-col justify-center">
              {slide && (
                <>
                  {/* Slide number */}
                  <p className="font-mono text-xs text-accent-foreground mb-6">
                    Slide {slide.slideNumber || currentSlide + 1} / {total}
                  </p>

                  {/* Title */}
                  <h2 className="font-serif italic text-3xl md:text-4xl tracking-tight text-foreground mb-3">
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="text-lg text-muted-foreground font-light mb-8">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Bullets */}
                  {slide.bullets && slide.bullets.length > 0 && (
                    <ul className="space-y-3 mb-8">
                      {slide.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-foreground/80"
                        >
                          <ArrowRight
                            size={14}
                            className="text-accent-foreground mt-1 shrink-0"
                          />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Speaker notes */}
                  {slide.speakerNotes && (
                    <div className="mt-auto pt-6 border-t border-border/30">
                      <p className="text-xs font-mono text-muted-foreground">
                        <span className="text-accent-foreground">Nota:</span>{" "}
                        {slide.speakerNotes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              {/* Dots */}
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? "w-6 bg-accent-foreground"
                        : "w-2 bg-secondary hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentSlide(Math.min(total - 1, currentSlide + 1))
                }
                disabled={currentSlide === total - 1}
                className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
