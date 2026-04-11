"use client";

import Link from "next/link";
import { Loader2, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import type { ArtifactState } from "@/lib/types";

interface ArtifactCardProps {
  title: string;
  icon: React.ReactNode;
  artifact: ArtifactState;
  viewHref: string;
  onRegenerate: () => void;
  preview?: string;
}

export function ArtifactCard({
  title,
  icon,
  artifact,
  viewHref,
  onRegenerate,
  preview,
}: ArtifactCardProps) {
  return (
    <div className="rounded-[2rem] bg-secondary/20 backdrop-blur-md border border-border/50 p-4 sm:p-6 md:p-8 transition-all duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center border border-border">
          {icon}
        </div>
        <h3 className="font-sans text-lg font-semibold">{title}</h3>
      </div>

      {/* Content based on status */}
      {artifact.status === "generating" && (
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="w-8 h-8 text-accent-foreground animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">A sintetizar...</p>
          {/* Progress shimmer */}
          <div className="mt-4 w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div className="h-full bg-accent-foreground/30 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {artifact.status === "done" && (
        <div>
          {preview && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
              {preview}
            </p>
          )}
          <div className="flex gap-3">
            <Link
              href={viewHref}
              className="group flex-1 flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] duration-300"
            >
              Ver
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              onClick={onRegenerate}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent-foreground/30 transition-all duration-300"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      )}

      {artifact.status === "error" && (
        <div className="flex flex-col items-center py-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <p className="text-sm text-red-400 mb-4">
            {artifact.error || "Erro na geração"}
          </p>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-all"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      {artifact.status === "pending" && (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Aguardando geração...</p>
          <div className="w-full h-1 bg-secondary/50 rounded-full" />
        </div>
      )}
    </div>
  );
}
