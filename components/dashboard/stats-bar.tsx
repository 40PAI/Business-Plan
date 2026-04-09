"use client";

import { Calendar, CalendarDays, BarChart, FileText } from "lucide-react";

interface StatsBarProps {
  totalProjects: number;
  lastGenerated: string | null;
  totalArtifacts: number;
  temporal?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
}

export function StatsBar({ totalProjects, lastGenerated, totalArtifacts, temporal }: StatsBarProps) {
  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const periodStats = [
    { label: "Hoje", value: temporal?.today || 0 },
    { label: "Esta Semana", value: temporal?.thisWeek || 0 },
    { label: "Este Mês", value: temporal?.thisMonth || 0 },
    { label: "Este Ano", value: temporal?.thisYear || 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-secondary/20 border border-border/50 p-5 backdrop-blur-md flex items-start justify-between">
          <div>
            <p className="font-mono text-3xl font-bold text-foreground">{String(totalProjects).padStart(2, "0")}</p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Planos Totais</p>
          </div>
          <BarChart className="text-muted-foreground opacity-50" size={24} />
        </div>
        <div className="rounded-2xl bg-secondary/20 border border-border/50 p-5 backdrop-blur-md flex items-start justify-between">
          <div>
            <p className="font-mono text-3xl font-bold text-foreground">{formatDate(lastGenerated)}</p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Último gerado</p>
          </div>
          <CalendarDays className="text-muted-foreground opacity-50" size={24} />
        </div>
        <div className="rounded-2xl bg-secondary/20 border border-border/50 p-5 backdrop-blur-md flex items-start justify-between">
          <div>
            <p className="font-mono text-3xl font-bold text-foreground">{String(totalArtifacts).padStart(2, "0")}</p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Artefactos criados</p>
          </div>
          <FileText className="text-muted-foreground opacity-50" size={24} />
        </div>
      </div>
      
      {temporal && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {periodStats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-background/50 border border-border/40 p-3 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
              <p className="font-mono text-xl text-foreground font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
