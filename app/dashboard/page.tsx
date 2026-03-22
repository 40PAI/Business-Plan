"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Plus, Sparkles } from "lucide-react";

import { getProjects, getProjectStats } from "@/lib/storage";
import type { Project } from "@/lib/types";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { ProjectCard } from "@/components/dashboard/project-card";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({ totalProjects: 0, lastGenerated: null as string | null, totalArtifacts: 0 });
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProjects(getProjects());
    setStats(getProjectStats());
  }, []);

  useGSAP(
    () => {
      gsap.from(".dashboard-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    },
    { scope: container, dependencies: [projects.length] }
  );

  return (
    <div
      ref={container}
      className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-white"
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
        <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-chart-1/10 blur-[120px] rounded-full mix-blend-screen translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-secondary/20 blur-[140px] rounded-full mix-blend-screen" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 py-12">
        {/* Header */}
        <div className="dashboard-reveal flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary border border-border">
              <Sparkles size={18} className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-sans text-2xl font-bold tracking-tight">PlanAI</h1>
              <p className="text-xs text-muted-foreground font-mono">Dashboard</p>
            </div>
          </div>
          <Link
            href="/plan"
            className="group relative overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-105 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] duration-500"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={16} />
              Novo Plano
            </span>
            <div className="absolute inset-0 z-0 bg-accent translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-reveal mb-10">
          <StatsBar
            totalProjects={stats.totalProjects}
            lastGenerated={stats.lastGenerated}
            totalArtifacts={stats.totalArtifacts}
          />
        </div>

        {/* Projects list */}
        {projects.length === 0 ? (
          <div className="dashboard-reveal flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6 border border-border/50">
              <Sparkles size={24} className="text-muted-foreground" />
            </div>
            <h2 className="font-serif italic text-2xl text-foreground mb-2">
              Nenhum projecto ainda.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-8">
              Crie o seu primeiro Business Plan com inteligência artificial em poucos minutos.
            </p>
            <Link
              href="/plan"
              className="group relative overflow-hidden rounded-full bg-foreground px-8 py-4 text-primary-foreground font-medium transition-all hover:scale-105 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] duration-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                Criar Primeiro Plano
                <Plus size={16} />
              </span>
              <div className="absolute inset-0 z-0 bg-accent translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="dashboard-reveal">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
