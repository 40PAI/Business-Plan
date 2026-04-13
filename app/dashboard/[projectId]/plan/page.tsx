"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Printer, FileCode } from "lucide-react";
import { getProject } from "@/lib/storage";
import type { Project } from "@/lib/types";
import type {
  BusinessPlanData,
  PlanBlock,
  PlanSubsection,
  OrgNode,
} from "@/lib/plan-schema";
import { isBusinessPlanData } from "@/lib/plan-schema";
import { planToHtml, getPlanDOCBlob } from "@/lib/pdf";

// ─── Block renderers ────────────────────────────────────────────────────

function TextBlock({ content }: { content: string }) {
  return <p className="text-foreground/80 leading-relaxed">{content}</p>;
}

function BulletsBlock({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 my-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-foreground/80">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberedBlock({ items }: { items: string[] }) {
  return (
    <ol className="space-y-1.5 my-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-foreground/80">
          <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">
            {i + 1}
          </span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function TableBlock({ title, headers, rows }: { title?: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4">
      {title && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/50 border-b border-border/60">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={`border-b border-border/20 ${ri % 2 === 0 ? "bg-background" : "bg-secondary/10"}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-3 text-foreground/80 leading-snug">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SWOTBlock({ strengths, weaknesses, opportunities, threats }: {
  strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[];
}) {
  const quadrants = [
    { label: "Forças", items: strengths, color: "bg-emerald-500/10 border-emerald-500/30", textColor: "text-emerald-700 dark:text-emerald-400" },
    { label: "Fraquezas", items: weaknesses, color: "bg-red-500/10 border-red-500/30", textColor: "text-red-700 dark:text-red-400" },
    { label: "Oportunidades", items: opportunities, color: "bg-blue-500/10 border-blue-500/30", textColor: "text-blue-700 dark:text-blue-400" },
    { label: "Ameaças", items: threats, color: "bg-amber-500/10 border-amber-500/30", textColor: "text-amber-700 dark:text-amber-400" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 my-4">
      {quadrants.map((q) => (
        <div key={q.label} className={`rounded-xl border p-4 ${q.color}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${q.textColor}`}>{q.label}</p>
          <ul className="space-y-1">
            {q.items.map((item, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className={`mt-1 shrink-0 h-1 w-1 rounded-full ${q.textColor.replace("text-", "bg-")}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function OrgNodeComponent({ node, isRoot = false }: { node: OrgNode; isRoot?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-lg border px-4 py-2 text-center min-w-[130px] max-w-[180px] ${
        isRoot
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-secondary/40 border-border text-foreground"
      }`}>
        <p className="font-semibold text-sm leading-tight">{node.title}</p>
        {node.subtitle && <p className={`text-xs mt-0.5 ${isRoot ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{node.subtitle}</p>}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-px h-5 bg-border" />
          <div className="flex gap-4 items-start">
            {node.children.map((child, i) => (
              <div key={i} className="flex flex-col items-center">
                {node.children!.length > 1 && i === 0 && (
                  <div className="w-full h-px bg-border mb-0" style={{ display: "none" }} />
                )}
                <OrgNodeComponent node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrgBlock({ root }: { root: OrgNode }) {
  return (
    <div className="my-4 overflow-x-auto">
      <div className="inline-flex flex-col items-center p-6 bg-secondary/10 rounded-2xl border border-border/40 min-w-full">
        <OrgChart node={root} />
      </div>
    </div>
  );
}

function OrgChart({ node }: { node: OrgNode }) {
  const children = node.children || [];
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-lg border bg-primary text-primary-foreground border-primary px-4 py-2 text-center min-w-[140px] shadow-md">
        <p className="font-semibold text-sm">{node.title}</p>
        {node.subtitle && <p className="text-xs text-primary-foreground/70">{node.subtitle}</p>}
      </div>
      {children.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          {children.length > 1 && (
            <div className="flex items-start" style={{ gap: 0 }}>
              {children.map((child, i) => (
                <div key={i} className="flex flex-col items-center relative px-3">
                  {/* Horizontal connector */}
                  {children.length > 1 && (
                    <div
                      className="absolute top-0 h-px bg-border"
                      style={{
                        left: i === 0 ? "50%" : "0",
                        right: i === children.length - 1 ? "50%" : "0",
                      }}
                    />
                  )}
                  <div className="w-px h-6 bg-border" />
                  <OrgChildNode node={child} />
                </div>
              ))}
            </div>
          )}
          {children.length === 1 && <OrgChildNode node={children[0]} />}
        </>
      )}
    </div>
  );
}

function OrgChildNode({ node }: { node: OrgNode }) {
  const children = node.children || [];
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-lg border bg-card border-border px-3 py-2 text-center min-w-[120px] max-w-[160px]">
        <p className="font-semibold text-xs leading-tight text-foreground">{node.title}</p>
        {node.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{node.subtitle}</p>}
      </div>
      {children.length > 0 && (
        <>
          <div className="w-px h-4 bg-border" />
          <div className="flex gap-3">
            {children.map((child, i) => (
              <OrgChildNode key={i} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MetricsBlock({ items }: { items: Array<{ label: string; value: string; unit?: string; desc?: string }> }) {
  return (
    <div className={`grid gap-3 my-4 ${items.length <= 2 ? "grid-cols-2" : items.length === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
      {items.map((m, i) => (
        <div key={i} className="bg-secondary/20 border border-border/40 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
          <p className="text-xl font-bold text-foreground leading-tight">{m.value}</p>
          {m.unit && <p className="text-xs text-primary mt-0.5">{m.unit}</p>}
          {m.desc && <p className="text-xs text-muted-foreground/70 mt-1 leading-tight">{m.desc}</p>}
        </div>
      ))}
    </div>
  );
}

const highlightColors = {
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200",
  green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
  red: "bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200",
  slate: "bg-secondary/30 border-border text-foreground",
};

function HighlightBlock({ label, value, sublabel, color = "blue" }: {
  label: string; value: string; sublabel?: string; color?: keyof typeof highlightColors;
}) {
  return (
    <div className={`rounded-xl border p-4 my-3 ${highlightColors[color] || highlightColors.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-lg font-bold leading-snug">{value}</p>
      {sublabel && <p className="text-xs opacity-60 mt-1">{sublabel}</p>}
    </div>
  );
}

function TimelineBlock({ phases }: { phases: Array<{ period: string; title: string; tasks: string[] }> }) {
  return (
    <div className="my-4 space-y-4">
      {phases.map((phase, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </div>
            {i < phases.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">{phase.period}</span>
              <span className="font-semibold text-sm text-foreground">{phase.title}</span>
            </div>
            <ul className="space-y-0.5">
              {phase.tasks.map((task, j) => (
                <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="mt-1 shrink-0 h-1 w-1 rounded-full bg-muted-foreground/50" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: PlanBlock, idx: number) {
  switch (block.type) {
    case "text": return <TextBlock key={idx} content={block.content} />;
    case "bullets": return <BulletsBlock key={idx} items={block.items} />;
    case "numbered": return <NumberedBlock key={idx} items={block.items} />;
    case "table": return <TableBlock key={idx} title={block.title} headers={block.headers} rows={block.rows} />;
    case "swot": return <SWOTBlock key={idx} {...block} />;
    case "organogram": return <OrgBlock key={idx} root={block.root} />;
    case "metrics": return <MetricsBlock key={idx} items={block.items} />;
    case "highlight": return <HighlightBlock key={idx} label={block.label} value={block.value} sublabel={block.sublabel} color={block.color} />;
    case "timeline": return <TimelineBlock key={idx} phases={block.phases} />;
    default: return null;
  }
}

function SubsectionView({ sub }: { sub: PlanSubsection }) {
  return (
    <div className="mt-6">
      <h3 className="font-sans text-base font-semibold text-foreground mb-3">{sub.title}</h3>
      <div className="space-y-3">
        {sub.blocks.map((b, i) => renderBlock(b, i))}
      </div>
    </div>
  );
}

// ─── Cover component ────────────────────────────────────────────────────

function CoverSection({ cover }: { cover: BusinessPlanData["cover"] }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-10">
      {/* Top bar */}
      <div className="bg-primary px-4 sm:px-8 py-3 sm:py-4">
        <p className="text-primary-foreground/70 text-xs font-mono uppercase tracking-[0.2em]">Business Plan</p>
        <h2 className="text-primary-foreground text-2xl md:text-3xl font-bold mt-1">{cover.businessName}</h2>
      </div>
      {/* Info grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cover.tagline && (
          <div className="sm:col-span-2 border-b border-border pb-4 mb-2">
            <p className="text-muted-foreground text-sm italic">"{cover.tagline}"</p>
          </div>
        )}
        {[
          { label: "Sector", value: cover.sector },
          { label: "Localização", value: `${cover.province}, ${cover.country}` },
          { label: "Forma Jurídica", value: cover.legalForm },
          { label: "Data", value: cover.date },
          { label: "Versão", value: cover.version },
          { label: "Contacto", value: cover.contact },
        ].filter(f => f.value).map(f => (
          <div key={f.label}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</p>
            <p className="font-medium text-foreground text-sm mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>
      {cover.confidential && (
        <div className="bg-secondary/30 px-6 py-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">{cover.confidential}</p>
        </div>
      )}
    </div>
  );
}

// ─── JSON Plan Renderer ─────────────────────────────────────────────────

function JSONPlanRenderer({ plan }: { plan: BusinessPlanData }) {
  return (
    <div className="space-y-12">
      <CoverSection cover={plan.cover} />
      {plan.sections.map((section) => (
        <section key={section.id}>
          <div className="mb-6">
            <p className="font-mono text-xs text-primary mb-1">Secção {section.number}</p>
            <h2 className="font-serif italic text-3xl md:text-4xl tracking-tight text-foreground">
              {section.number}. {section.title}
            </h2>
            <div className="h-0.5 w-16 bg-primary/40 mt-3" />
          </div>
          {section.blocks && (
            <div className="space-y-3">
              {section.blocks.map((b, i) => renderBlock(b, i))}
            </div>
          )}
          {section.subsections?.map((sub, si) => (
            <SubsectionView key={si} sub={sub} />
          ))}
        </section>
      ))}
    </div>
  );
}

// ─── Markdown fallback ──────────────────────────────────────────────────

function MarkdownPlanRenderer({ content }: { content: string }) {
  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={i}>{part.slice(1, -1)}</em>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={i} className="bg-secondary/40 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
      return <span key={i}>{part}</span>;
    });
  };

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) { inCodeBlock = true; codeLines = []; i++; continue; }
      else {
        inCodeBlock = false;
        elements.push(<pre key={`code-${i}`} className="bg-secondary/30 rounded-xl p-4 my-4 text-xs font-mono overflow-x-auto">{codeLines.join("\n")}</pre>);
        codeLines = []; i++; continue;
      }
    }
    if (inCodeBlock) { codeLines.push(line); i++; continue; }
    if (line.trim() === "..." || line.trim() === "….") { i++; continue; }
    if (/^[%\s&=]+$/.test(line.trim()) && line.trim().length > 6) { i++; continue; }
    if (line.trim() === "---" || line.trim() === "***") { elements.push(<hr key={i} className="my-6 border-border/40" />); i++; continue; }
    if (line.startsWith("> ")) { elements.push(<blockquote key={i} className="border-l-4 border-primary/40 pl-4 my-3 italic text-muted-foreground">{renderInline(line.slice(2))}</blockquote>); i++; continue; }
    if (line.trim().startsWith("|")) {
      const tl: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { tl.push(lines[i]); i++; }
      const hasSep = tl.some(r => r.match(/^\|[\s\-:|]+\|$/));
      if (!hasSep) { elements.push(<pre key={`ascii-${i}`} className="text-xs font-mono bg-secondary/20 rounded-xl p-4 my-4 overflow-x-auto whitespace-pre">{tl.join("\n")}</pre>); continue; }
      const pr = (row: string) => row.split("|").slice(1, -1).map(c => c.trim());
      const headers = pr(tl[0]);
      const rows = tl.slice(2).filter(r => !r.match(/^\|[\s\-:|]+\|$/)).map(pr);
      elements.push(
        <div key={`tbl-${i}`} className="my-6 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead><tr className="bg-secondary/40">{headers.map((h, hi) => <th key={hi} className="px-4 py-3 text-left text-xs font-semibold uppercase text-foreground">{renderInline(h)}</th>)}</tr></thead>
            <tbody>{rows.map((row, ri) => <tr key={ri} className={`border-b border-border/20 ${ri%2===0?"bg-background":"bg-secondary/10"}`}>{row.map((cell, ci) => <td key={ci} className="px-4 py-3 text-foreground/80">{renderInline(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    if (line.startsWith("# ")) { elements.push(<h1 key={i} className="font-serif italic text-3xl md:text-4xl tracking-tight text-foreground mt-12 mb-4">{line.slice(2)}</h1>); i++; continue; }
    if (line.startsWith("## ")) { elements.push(<h2 key={i} className="font-sans text-xl md:text-2xl font-bold text-foreground mt-10 mb-3">{line.slice(3)}</h2>); i++; continue; }
    if (line.startsWith("### ")) { elements.push(<h3 key={i} className="font-sans text-lg font-semibold text-foreground mt-6 mb-2">{line.slice(4)}</h3>); i++; continue; }
    if (line.startsWith("#### ")) { elements.push(<h4 key={i} className="font-sans text-base font-semibold text-foreground mt-4 mb-1">{line.slice(5)}</h4>); i++; continue; }
    if (line.startsWith("- ") || line.startsWith("* ")) { elements.push(<li key={i} className="text-foreground/80 ml-6 list-disc leading-relaxed">{renderInline(line.slice(2))}</li>); i++; continue; }
    const nm = line.match(/^(\d+)\.\s(.*)/);
    if (nm) { elements.push(<li key={i} className="text-foreground/80 ml-6 list-decimal leading-relaxed">{renderInline(nm[2])}</li>); i++; continue; }
    if (line.trim() === "") { elements.push(<div key={i} className="h-3" />); i++; continue; }
    elements.push(<p key={i} className="text-foreground/80 leading-relaxed">{renderInline(line)}</p>);
    i++;
  }
  return <article className="space-y-1">{elements}</article>;
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function PlanViewer() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingDoc, setExportingDoc] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      const p = await getProject(projectId);
      if (!p) { router.push("/dashboard"); return; }
      setProject(p);
      setIsLoading(false);
    }
    loadProject();
  }, [projectId, router]);

  // Derive plan data — must be computed before any hook (no early return before hooks)
  const raw = project?.artifacts.plan.content || "";

  let planData: BusinessPlanData | null = null;
  let markdownContent = raw;
  if (raw.startsWith("__MARKDOWN__\n")) {
    markdownContent = raw.slice("__MARKDOWN__\n".length);
  } else if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isBusinessPlanData(parsed)) planData = parsed;
    } catch { /* old markdown */ }
  }

  const handleExportPDF = useCallback(async () => {
    if (!project || exporting) return;
    setExporting(true);
    try {
      const { generatePlanPDF } = await import("@/lib/pdf");
      generatePlanPDF(project.businessName, planData || markdownContent);
    } finally {
      setExporting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, exporting, planData, markdownContent]);

  const handleExportDOC = useCallback(async () => {
    if (!project || exportingDoc) return;
    setExportingDoc(true);
    try {
      const { generatePlanDOC, getPlanDOCBlob } = await import("@/lib/pdf");
      
      // 1. Generate for local download
      generatePlanDOC(project.businessName, planData || markdownContent);

      // 2. Capture blob and upload to Supabase
      const docBlob = getPlanDOCBlob(project.businessName, planData || markdownContent);
      const formData = new FormData();
      formData.append("projectId", project.id);
      formData.append("file", docBlob, `${project.businessName.replace(/\s+/g, "_")}_Plan.doc`);

      await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      });

    } finally {
      setExportingDoc(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, exportingDoc, planData, markdownContent]);

  const handleExportHTML = useCallback(async () => {
    if (!project || exportingHtml) return;
    setExportingHtml(true);
    try {
      const { downloadPlanHTML } = await import("@/lib/html-export");
      downloadPlanHTML(project.businessName, planData || markdownContent);
    } finally {
      setExportingHtml(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, exportingHtml, planData, markdownContent]);

  // Early return AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-mono text-sm">A carregar plano do Supabase...</p>
      </div>
    );
  }
  if (!project) return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.05]">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between gap-3 mb-8 md:mb-10">
          <Link href={`/dashboard/${projectId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Voltar ao projecto</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDOC}
              disabled={exportingDoc || !raw}
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 sm:px-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {exportingDoc ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span className="hidden sm:inline">{exportingDoc ? "A exportar..." : "DOC"}</span>
              <span className="sm:hidden">DOC</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting || !raw}
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 sm:px-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              <span className="hidden sm:inline">{exporting ? "A abrir..." : "PDF"}</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={handleExportHTML}
              disabled={exportingHtml || !raw}
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 sm:px-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {exportingHtml ? <Loader2 size={14} className="animate-spin" /> : <FileCode size={14} />}
              <span className="hidden sm:inline">{exportingHtml ? "A exportar..." : "HTML"}</span>
              <span className="sm:hidden">HTML</span>
            </button>
          </div>
        </div>

        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground mb-2">Business Plan</p>
          <h1 className="font-serif italic text-4xl md:text-5xl tracking-tight text-foreground">
            {project.businessName}.
          </h1>
        </div>

        {planData ? (
          <JSONPlanRenderer plan={planData} />
        ) : (
          <MarkdownPlanRenderer content={markdownContent} />
        )}
      </main>
    </div>
  );
}
