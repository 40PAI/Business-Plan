"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { getProject } from "@/lib/storage";
import type { Project } from "@/lib/types";

export default function PlanViewer() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push("/dashboard");
      return;
    }
    setProject(p);
  }, [projectId, router]);

  const rawContent = project?.artifacts.plan.content || "";
  const content = rawContent
    .replace(/: OPENROUTER PROCESSING\n?/g, "")
    .replace(/OPENROUTER PROCESSING\n?/g, "")
    .replace(/^\s*:\s*$/gm, "");

  const handleExportPDF = useCallback(async () => {
    if (!project || exporting) return;
    setExporting(true);
    try {
      const { generatePlanPDF } = await import("@/lib/pdf");
      generatePlanPDF(project.businessName, content);
    } finally {
      setExporting(false);
    }
  }, [project, exporting, content]);

  if (!project) return null;

  // Markdown renderer with table support
  const renderMarkdown = (md: string) => {
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Detect markdown table (line starts with |)
      if (line.trim().startsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (row: string) =>
            row.split("|").slice(1, -1).map((c) => c.trim());

          const headers = parseRow(tableLines[0]);
          const bodyRows = tableLines
            .slice(2)
            .filter((r) => !r.match(/^\|[\s-:|]+\|$/))
            .map(parseRow);

          elements.push(
            <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/60">
                    {headers.map((h, hi) => (
                      <th
                        key={hi}
                        className="px-4 py-3 text-left font-semibold text-foreground text-xs uppercase tracking-wider"
                      >
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr
                      key={ri}
                      className={`border-b border-border/30 ${ri % 2 === 0 ? "bg-background" : "bg-secondary/10"}`}
                    >
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-3 text-foreground/80">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={i}
            className="font-serif italic text-3xl md:text-4xl tracking-tight text-foreground mt-12 mb-4 first:mt-0"
          >
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={i}
            className="font-sans text-xl md:text-2xl font-bold text-foreground mt-10 mb-3"
          >
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={i}
            className="font-sans text-lg font-semibold text-foreground mt-6 mb-2"
          >
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li
            key={i}
            className="text-foreground/80 ml-6 list-disc leading-relaxed"
          >
            {renderInline(line.slice(2))}
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s/, "");
        elements.push(
          <li
            key={i}
            className="text-foreground/80 ml-6 list-decimal leading-relaxed"
          >
            {renderInline(text)}
          </li>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-3" />);
      } else {
        elements.push(
          <p key={i} className="text-foreground/80 leading-relaxed">
            {renderInline(line)}
          </p>
        );
      }
      i++;
    }

    return elements;
  };

  const renderInline = (text: string) => {
    // Bold
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-foreground">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      {/* Noise */}
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
            disabled={exporting || !content}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-accent-foreground/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? "A exportar..." : "Exportar PDF"}
          </button>
        </div>

        {/* Plan title */}
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground mb-2">
            Business Plan
          </p>
          <h1 className="font-serif italic text-4xl md:text-5xl tracking-tight text-foreground">
            {project.businessName}.
          </h1>
        </div>

        {/* Plan content */}
        <article className="prose-planai space-y-1">
          {renderMarkdown(content)}
        </article>
      </main>
    </div>
  );
}
