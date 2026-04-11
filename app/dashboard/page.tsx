"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Plus, Sparkles, MapPin, Briefcase, Users, ShoppingCart } from "lucide-react";

import { getProjects, getProjectStats } from "@/lib/storage";
import type { Project } from "@/lib/types";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { ProjectCard } from "@/components/dashboard/project-card";

function TopList({ title, icon, items }: { title: string, icon: React.ReactNode, items: {name: string, count: number}[] }) {
  if (!items || items.length === 0) return null;
  const max = Math.max(...items.map(i => i.count));

  return (
    <div className="rounded-2xl bg-secondary/10 border border-border/50 p-5 backdrop-blur-md flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3 flex-grow">
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground truncate pr-2 max-w-[80%]">{item.name}</span>
              <span className="text-muted-foreground font-mono">{item.count}</span>
            </div>
            <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>({ totalProjects: 0, lastGenerated: null, totalArtifacts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [projData, statsData] = await Promise.all([
          getProjects(),
          getProjectStats()
        ]);
        setProjects(projData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [projects.length]);

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
      className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-white pb-20"
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

      <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 py-12">
        {/* Header */}
        <div className="dashboard-reveal flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary border border-border">
              <Sparkles size={18} className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-sans text-2xl font-bold tracking-tight">PlanAI</h1>
              <p className="text-xs text-muted-foreground font-mono">Overview & Analytics</p>
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

        {/* Global Stats */}
        <div className="dashboard-reveal mb-8">
          <StatsBar
            totalProjects={stats.totalProjects}
            lastGenerated={stats.lastGenerated}
            totalArtifacts={stats.totalArtifacts}
            temporal={stats.temporal}
          />
        </div>

        {/* Analytics Grid */}
        {stats.totalProjects > 0 && (
          <div className="dashboard-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <TopList title="Regiões (Top 5)" icon={<MapPin size={18} className="text-chart-1" />} items={stats.topRegions} />
            <TopList title="Sectores (Top 5)" icon={<Briefcase size={18} className="text-chart-2" />} items={stats.topSectors} />
            <TopList title="Clientes (Top 5)" icon={<Users size={18} className="text-chart-3" />} items={stats.topClients} />
            <TopList title="Canais (Top 5)" icon={<ShoppingCart size={18} className="text-chart-4" />} items={stats.topChannels} />
          </div>
        )}

        {/* Projects list */}
        {isLoading ? (
          <div className="dashboard-reveal flex flex-col items-center justify-center py-24 text-center">
            <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground font-mono text-sm">A carregar dados do Supabase...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="dashboard-reveal flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary/30 flex items-center justify-center mb-6 border border-border/50">
              <Sparkles size={24} className="text-muted-foreground" />
            </div>
            <h2 className="font-serif italic text-2xl text-foreground mb-2">
              Nenhum projecto ainda.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-8">
              Crie o seu primeiro Business Plan com inteligência artificial para preencher o dashboard com dados reais e analíticos.
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
            <h2 className="dashboard-reveal font-serif italic text-2xl text-foreground mb-4">Histórico de Planos</h2>
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
