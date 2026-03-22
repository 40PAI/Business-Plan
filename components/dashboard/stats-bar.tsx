"use client";

interface StatsBarProps {
  totalProjects: number;
  lastGenerated: string | null;
  totalArtifacts: number;
}

export function StatsBar({ totalProjects, lastGenerated, totalArtifacts }: StatsBarProps) {
  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stats = [
    { label: "Projectos", value: String(totalProjects).padStart(2, "0") },
    { label: "Último gerado", value: formatDate(lastGenerated) },
    { label: "Artefactos criados", value: String(totalArtifacts).padStart(2, "0") },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-secondary/20 border border-border/50 p-5 backdrop-blur-md"
        >
          <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
