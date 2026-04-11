"use client";

import Link from "next/link";
import { FileText, Palette, Presentation, ArrowRight, Check, Clock, AlertCircle } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

function ArtifactBadge({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  status: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        status === "done"
          ? "bg-green-500/10 text-green-400"
          : status === "error"
            ? "bg-red-500/10 text-red-400"
            : "bg-secondary text-muted-foreground"
      }`}
    >
      <Icon size={12} />
      <span>{label}</span>
      {status === "done" && <Check size={10} />}
      {status === "pending" && <Clock size={10} />}
      {status === "error" && <AlertCircle size={10} />}
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const date = new Date(project.createdAt).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/dashboard/${project.id}`}>
      <div className="group rounded-[2rem] bg-secondary/20 backdrop-blur-md border border-border/50 p-4 sm:p-6 md:p-8 hover:border-accent-foreground/20 hover:bg-secondary/30 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-sans text-xl font-bold text-foreground">
              {project.businessName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {project.businessArea} · {date}
            </p>
          </div>
          <ArrowRight
            size={20}
            className="shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300"
          />
        </div>

        {/* Meta */}
        <p className="text-xs text-muted-foreground mb-5">
          <span className="font-medium text-foreground/70">Fase:</span> {project.businessPhase} ·{" "}
          <span className="font-medium text-foreground/70">Objectivo:</span> {project.businessGoal}
        </p>

        {/* Artifact badges */}
        <div className="flex flex-wrap gap-2">
          <ArtifactBadge
            icon={FileText}
            label="Plano"
            status={project.artifacts.plan.status}
          />
          <ArtifactBadge
            icon={Palette}
            label="Logo"
            status={project.artifacts.logo.status}
          />
          <ArtifactBadge
            icon={Presentation}
            label="Pitch"
            status={project.artifacts.pitch.status}
          />
        </div>
      </div>
    </Link>
  );
}
