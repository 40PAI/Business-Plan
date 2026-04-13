import type { BusinessPlanData, PlanBlock } from "./plan-schema";

// --- Markdown to HTML ---

function inlineMd(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inCodeBlock = false;
  let codeContent = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeContent = "";
        i++;
        continue;
      } else {
        inCodeBlock = false;
        html += `<pre><code>${codeContent.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`;
        codeContent = "";
        i++;
        continue;
      }
    }
    if (inCodeBlock) { codeContent += line + "\n"; i++; continue; }

    // Skip ellipsis / artifacts
    if (line.trim() === "..." || line.trim() === "….") { i++; continue; }

    // Skip lines that look like garbled encoded content
    if (/^[%\s&]+$/.test(line.trim()) && line.trim().length > 10) { i++; continue; }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      html += "<hr/>"; i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      html += `<blockquote>${inlineMd(line.slice(2))}</blockquote>`; i++; continue;
    }

    // Table
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { tableLines.push(lines[i]); i++; }
      const hasSep = tableLines.some(r => r.match(/^\|[\s\-:|]+\|$/));
      if (hasSep && tableLines.length >= 2) {
        const parseRow = (r: string) => r.split("|").slice(1, -1).map(c => c.trim());
        const headers = parseRow(tableLines[0]);
        const body = tableLines.slice(2).filter(r => !r.match(/^\|[\s\-:|]+\|$/)).map(parseRow);
        html += `<table><thead><tr>${headers.map(h => `<th>${inlineMd(h)}</th>`).join("")}</tr></thead><tbody>`;
        body.forEach(row => { html += `<tr>${row.map(c => `<td>${inlineMd(c)}</td>`).join("")}</tr>`; });
        html += "</tbody></table>";
      } else {
        html += `<pre class="ascii">${tableLines.map(l => l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")).join("\n")}</pre>`;
      }
      continue;
    }

    if (line.startsWith("# ")) { html += `<h1>${line.slice(2)}</h1>`; i++; continue; }
    if (line.startsWith("## ")) { html += `<h2>${line.slice(3)}</h2>`; i++; continue; }
    if (line.startsWith("### ")) { html += `<h3>${line.slice(4)}</h3>`; i++; continue; }
    if (line.startsWith("#### ")) { html += `<h4>${line.slice(5)}</h4>`; i++; continue; }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      html += `<ul><li>${inlineMd(line.slice(2))}</li></ul>`; i++; continue;
    }
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) { html += `<ol start="${numMatch[1]}"><li>${inlineMd(numMatch[2])}</li></ol>`; i++; continue; }
    if (line.trim() === "") { html += "<br/>"; i++; continue; }

    html += `<p>${inlineMd(line)}</p>`;
    i++;
  }
  return html;
}

// --- JSON Plan to HTML ---

function blockToHtml(block: PlanBlock): string {
  switch (block.type) {
    case "text":
      return `<p>${block.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
    case "bullets":
      return `<ul>${block.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
    case "numbered":
      return `<ol>${block.items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
    case "table":
      return `${block.title ? `<p class="table-title">${block.title}</p>` : ""}<table><thead><tr>${block.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${block.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    case "swot":
      return `<table class="swot"><thead><tr><th class="s">Forças</th><th class="w">Fraquezas</th></tr></thead><tbody><tr><td>${block.strengths.map((i) => `• ${i}`).join("<br/>")}</td><td>${block.weaknesses.map((i) => `• ${i}`).join("<br/>")}</td></tr><tr><td class="o" style="border-top:1pt solid #e2e8f0"><b>Oportunidades</b><br/>${block.opportunities.map((i) => `• ${i}`).join("<br/>")}</td><td class="t" style="border-top:1pt solid #e2e8f0"><b>Ameaças</b><br/>${block.threats.map((i) => `• ${i}`).join("<br/>")}</td></tr></tbody></table>`;
    case "metrics":
      return `<div class="metrics">${block.items.map((m) => `<div class="metric"><div class="metric-label">${m.label}</div><div class="metric-value">${m.value}${m.unit ? ` <span>${m.unit}</span>` : ""}</div>${m.desc ? `<div class="metric-desc">${m.desc}</div>` : ""}</div>`).join("")}</div>`;
    case "highlight":
      return `<div class="highlight highlight-${block.color || "blue"}"><div class="hl-label">${block.label}</div><div class="hl-value">${block.value}</div>${block.sublabel ? `<div class="hl-sub">${block.sublabel}</div>` : ""}</div>`;
    case "organogram":
      return `<div class="org-note">Ver organograma na plataforma online</div>`;
    case "timeline":
      return `<div class="timeline">${block.phases.map((p, i) => `<div class="tl-phase"><div class="tl-num">${i + 1}</div><div class="tl-body"><div class="tl-period">${p.period}</div><div class="tl-title">${p.title}</div><ul>${p.tasks.map((t) => `<li>${t}</li>`).join("")}</ul></div></div>`).join("")}</div>`;
    default:
      return "";
  }
}

export function planToHtml(plan: BusinessPlanData): string {
  const sectionsHtml = plan.sections.map((s) => {
    const blocksHtml = (s.blocks || []).map(blockToHtml).join("");
    const subsHtml = (s.subsections || []).map((sub) => `<h3>${sub.title}</h3>${sub.blocks.map(blockToHtml).join("")}`).join("");
    return `<section><h2>${s.number}. ${s.title}</h2>${blocksHtml}${subsHtml}</section>`;
  }).join("");

  return `
    <div class="cover">
      <div class="cover-header">
        <div class="cover-label">Business Plan</div>
        <h1>${plan.cover.businessName}</h1>
      </div>
      <div class="cover-body">
        ${plan.cover.tagline ? `<p class="tagline">"${plan.cover.tagline}"</p>` : ""}
        <div class="cover-grid">
          ${[
            ["Sector", plan.cover.sector],
            ["Localização", `${plan.cover.province}, ${plan.cover.country}`],
            ["Forma Jurídica", plan.cover.legalForm],
            ["Data", plan.cover.date],
            ["Versão", plan.cover.version],
            ["Contacto", plan.cover.contact],
          ].filter(([, v]) => v).map(([l, v]) => `<div><div class="cg-label">${l}</div><div class="cg-value">${v}</div></div>`).join("")}
        </div>
        ${plan.cover.confidential ? `<p class="confidential">${plan.cover.confidential}</p>` : ""}
      </div>
    </div>
    ${sectionsHtml}`;
}

// --- Business Plan PDF (via window.print) ---

export function generatePlanPDF(businessName: string, content: string | BusinessPlanData) {
  const body = typeof content === "string" ? markdownToHtml(content) : planToHtml(content);
  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <title>${businessName} — Business Plan</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 0; padding: 0; }
    @page { margin: 2cm 2.5cm; size: A4; }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
      section { page-break-inside: avoid; }
      table { page-break-inside: avoid; }
      .metrics { page-break-inside: avoid; }
    }

    /* ── Typography ── */
    h1 { font-size: 20pt; color: #0f172a; margin: 1.2em 0 .4em; border-bottom: 2px solid #e2e8f0; padding-bottom: .3em; }
    h2 { font-size: 15pt; color: #1e3a8a; margin: 1.4em 0 .4em; padding-bottom: .2em; border-bottom: 1.5pt solid #dbeafe; }
    h3 { font-size: 12pt; color: #0f172a; margin: 1em 0 .25em; font-weight: 600; }
    h4 { font-size: 11pt; font-weight: bold; color: #334155; margin: .7em 0 .2em; }
    p { margin: .35em 0 .5em; line-height: 1.65; }
    ul, ol { margin: .35em 0 .6em; padding-left: 1.4em; }
    li { margin: .2em 0; line-height: 1.55; }
    strong { color: #0f172a; }
    blockquote { border-left: 4px solid #3b82f6; margin: .8em 0; padding: .4em 1em; color: #475569; font-style: italic; background: #f0f9ff; border-radius: 0 6px 6px 0; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1em 0; }
    pre.ascii { font-family: monospace; font-size: 9pt; background: #f8fafc; border: 1px solid #e2e8f0; padding: .8em; border-radius: 6px; white-space: pre; color: #334155; }
    pre code { display: block; background: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 6px; font-size: 9pt; white-space: pre-wrap; }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; margin: .8em 0; font-size: 10pt; }
    th { background: #1e3a8a; color: white; padding: 7px 10px; text-align: left; font-size: 9pt; font-weight: 600; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; line-height: 1.45; }
    tr:nth-child(even) td { background: #f8fafc; }
    .table-title { font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: .06em; color: #64748b; margin-bottom: .3em; }

    /* ── Cover ── */
    .cover { margin-bottom: 1.5cm; border: 1pt solid #e2e8f0; border-radius: 4pt; overflow: hidden; }
    .cover-header { background: #1e3a8a; color: white; padding: 1.2cm 1.5cm 1cm; }
    .cover-header h1 { color: white; border: none; font-size: 22pt; margin: .2cm 0 0; padding: 0; }
    .cover-label { font-size: 8pt; letter-spacing: .2em; text-transform: uppercase; opacity: .7; }
    .cover-body { background: white; padding: 1cm 1.5cm; }
    .tagline { font-style: italic; color: #64748b; font-size: 11pt; margin-bottom: .7cm; padding-bottom: .5cm; border-bottom: 1pt solid #e2e8f0; }
    .cover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5cm; margin: .3cm 0 .6cm; }
    .cg-label { font-size: 7pt; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; }
    .cg-value { font-weight: bold; font-size: 10pt; margin-top: .05cm; }
    .confidential { font-size: 7pt; color: #94a3b8; text-align: center; margin-top: .5cm; padding-top: .3cm; border-top: 1pt solid #f1f5f9; }

    /* ── SWOT ── */
    .swot { width: 100%; border-collapse: separate; border-spacing: 4pt; margin: .6em 0; }
    .swot th { font-size: 10pt; font-weight: 700; padding: 8pt 10pt; border-radius: 4pt; }
    .swot th.s { background: #f0fdf4; color: #15803d; border: 1pt solid #bbf7d0; }
    .swot th.w { background: #fff1f2; color: #be123c; border: 1pt solid #fecdd3; }
    .swot td { font-size: 9pt; padding: 8pt 10pt; border-radius: 4pt; line-height: 1.5; vertical-align: top; }
    .swot td.o { background: #eff6ff; border: 1pt solid #bfdbfe; }
    .swot td.t { background: #fffbeb; border: 1pt solid #fde68a; }

    /* ── Metrics ── */
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: .4cm; margin: .6em 0 .8em; }
    .metric { background: #f8fafc; border: 1pt solid #e2e8f0; border-radius: 6pt; padding: .5cm .6cm; }
    .metric-label { font-size: 7.5pt; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-bottom: .1cm; }
    .metric-value { font-size: 15pt; font-weight: 700; color: #0f172a; line-height: 1.1; }
    .metric-value span { font-size: 9pt; color: #1d4ed8; font-weight: 400; }
    .metric-desc { font-size: 7.5pt; color: #94a3b8; margin-top: .15cm; line-height: 1.35; }

    /* ── Highlights ── */
    .highlight { border-left: 4pt solid; padding: .4cm .8cm; margin: .4em 0 .6em; border-radius: 0 5pt 5pt 0; }
    .highlight-blue  { background: #eff6ff; border-left-color: #1d4ed8; }
    .highlight-green { background: #f0fdf4; border-left-color: #15803d; }
    .highlight-amber { background: #fffbeb; border-left-color: #b45309; }
    .highlight-red   { background: #fff1f2; border-left-color: #be123c; }
    .highlight-slate { background: #f8fafc; border-left-color: #334155; }
    .hl-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; opacity: .65; margin-bottom: .1cm; }
    .hl-value { font-size: 13pt; font-weight: 700; line-height: 1.2; }
    .hl-sub   { font-size: 8pt; opacity: .6; margin-top: .1cm; }

    /* ── Timeline ── */
    .timeline { margin: .6em 0 .8em; }
    .tl-phase { display: flex; gap: .5cm; margin-bottom: .6cm; align-items: flex-start; }
    .tl-num { min-width: 22pt; height: 22pt; border-radius: 50%; background: #1e3a8a; color: white; font-weight: 700; font-size: 9pt; text-align: center; line-height: 22pt; flex-shrink: 0; }
    .tl-body { flex: 1; }
    .tl-period { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 8pt; font-weight: 600; padding: 1pt 6pt; border-radius: 10pt; font-family: monospace; margin-bottom: .15cm; }
    .tl-title { font-weight: 700; font-size: 10.5pt; display: block; margin-bottom: .2cm; }
    .tl-body ul { margin: 0; padding-left: 1.2em; }
    .tl-body li { font-size: 9pt; margin: .1cm 0; color: #475569; }

    /* ── Organogram fallback ── */
    .org-note { background: #f8fafc; border: 1pt dashed #cbd5e1; padding: .5cm; text-align: center; color: #64748b; font-style: italic; font-size: 9pt; border-radius: 4pt; margin: .5em 0; }

    /* ── Footer & UI ── */
    section { margin-bottom: 1.2cm; }
    .footer { text-align: center; font-size: 8pt; color: #94a3b8; margin-top: 2em; padding-top: .5em; border-top: 1px solid #e2e8f0; }
    .print-btn { position: fixed; top: 1cm; right: 1cm; background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 12pt; z-index: 999; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨 Imprimir / PDF</button>
  ${body}
  <div class="footer">Gerado por PlanAI &nbsp;·&nbsp; ${new Date().toLocaleDateString("pt-PT", { day:"2-digit", month:"long", year:"numeric" })}</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

// --- Pitch Deck PDF (via window.print) ---

interface Slide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  speakerNotes?: string;
}

export function generatePitchPDF(businessName: string, slides: Slide[]) {
  const slidesHtml = slides.map((slide, i) => `
    <div class="slide${i < slides.length - 1 ? " page-break" : ""}">
      <div class="slide-num">Slide ${slide.slideNumber || i + 1} / ${slides.length}</div>
      <h1>${slide.title}</h1>
      ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ""}
      <div class="divider"></div>
      ${slide.bullets && slide.bullets.length > 0 ? `
        <ul>
          ${slide.bullets.map(b => `<li>${b}</li>`).join("")}
        </ul>` : ""}
      ${slide.speakerNotes ? `
        <div class="notes">
          <span class="notes-label">Nota do Apresentador:</span> ${slide.speakerNotes}
        </div>` : ""}
    </div>`).join("");

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <title>${businessName} — Pitch Deck</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Calibri', Arial, sans-serif; margin: 0; padding: 0; background: #0f172a; color: white; }
    @page { size: A4 landscape; margin: 0; }
    @media print { .no-print { display: none !important; } }
    .slide { width: 100%; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 3cm 4cm; background: #0f172a; }
    .page-break { page-break-after: always; }
    .slide-num { font-size: 9pt; color: #64748b; margin-bottom: 1.5cm; letter-spacing: .1em; }
    h1 { font-size: 28pt; color: white; margin: 0 0 .3cm; line-height: 1.2; }
    .subtitle { font-size: 14pt; color: #94a3b8; margin: 0 0 .6cm; }
    .divider { width: 3cm; height: 3px; background: #3b82f6; margin: .5cm 0; }
    ul { margin: .5cm 0; padding: 0; list-style: none; }
    li { padding: .3cm 0 .3cm 1.2cm; position: relative; font-size: 13pt; color: #e2e8f0; line-height: 1.4; }
    li::before { content: "→"; position: absolute; left: 0; color: #3b82f6; }
    .notes { margin-top: auto; padding-top: .8cm; border-top: 1px solid #1e3a8a; font-size: 8pt; color: #475569; font-style: italic; }
    .notes-label { font-style: normal; font-weight: bold; color: #3b82f6; }
    .footer { font-size: 8pt; color: #334155; text-align: right; margin-top: .5cm; }
    .print-btn { position: fixed; top: .5cm; right: .5cm; background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 12pt; z-index: 999; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨 Imprimir / PDF</button>
  ${slidesHtml}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

// --- Business Plan DOC (Word-compatible HTML with UTF-8 BOM) ---

export function getPlanDOCBlob(businessName: string, content: string | BusinessPlanData): Blob {
  const body = typeof content === "string" ? markdownToHtml(content) : planToHtml(content);
  const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${businessName} - Business Plan</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 2cm 2.5cm; }
    h1 { font-size: 20pt; color: #0f172a; margin-top: 1.2em; border-bottom: 1pt solid #e2e8f0; padding-bottom: .2em; }
    h2 { font-size: 15pt; color: #1e3a8a; margin-top: 1.4em; border-bottom: 1pt solid #dbeafe; padding-bottom: .15em; }
    h3 { font-size: 12pt; color: #0f172a; margin-top: 1em; font-weight: 600; }
    h4 { font-size: 11pt; font-weight: bold; color: #334155; }
    p { margin: .35em 0 .5em; line-height: 1.6; }
    ul, ol { margin: .35em 0 .6em; padding-left: 1.4em; }
    li { margin: .2em 0; line-height: 1.55; }
    strong { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: .8em 0; }
    th { background: #1e3a8a; color: white; padding: 6pt 9pt; text-align: left; font-size: 9pt; }
    td { padding: 5pt 9pt; border-bottom: 1pt solid #e2e8f0; font-size: 10pt; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .table-title { font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: .2em; }
    blockquote { border-left: 4pt solid #3b82f6; padding-left: 12pt; color: #64748b; font-style: italic; margin: .5em 0; }
    hr { border: none; border-top: 1pt solid #e2e8f0; margin: 1em 0; }
    pre.ascii { font-family: monospace; font-size: 9pt; }
    pre code { font-family: monospace; font-size: 9pt; }
    /* Cover */
    .cover-header { background: #1e3a8a; color: white; padding: 1cm 1.5cm; margin-bottom: 0; }
    .cover-header h1 { color: white; border: none; }
    .cover-label { font-size: 8pt; text-transform: uppercase; letter-spacing: .15em; opacity: .7; }
    .cover-body { border: 1pt solid #e2e8f0; padding: .8cm 1.2cm; margin-bottom: 1em; }
    .tagline { font-style: italic; color: #64748b; margin-bottom: .5em; padding-bottom: .4em; border-bottom: 1pt solid #e2e8f0; }
    .cover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .4cm; }
    .cg-label { font-size: 7pt; text-transform: uppercase; color: #94a3b8; }
    .cg-value { font-weight: bold; font-size: 10pt; }
    .confidential { font-size: 7pt; color: #94a3b8; text-align: center; margin-top: .4em; padding-top: .3em; border-top: 1pt solid #f1f5f9; }
    /* SWOT */
    .swot { border-collapse: separate; border-spacing: 3pt; }
    .swot th.s { background: #f0fdf4; color: #15803d; border: 1pt solid #bbf7d0; font-size: 10pt; padding: 7pt 9pt; }
    .swot th.w { background: #fff1f2; color: #be123c; border: 1pt solid #fecdd3; font-size: 10pt; padding: 7pt 9pt; }
    .swot td.o { background: #eff6ff; border: 1pt solid #bfdbfe; font-size: 9pt; padding: 7pt 9pt; vertical-align: top; }
    .swot td.t { background: #fffbeb; border: 1pt solid #fde68a; font-size: 9pt; padding: 7pt 9pt; vertical-align: top; }
    /* Metrics */
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: .35cm; margin: .5em 0 .7em; }
    .metric { background: #f8fafc; border: 1pt solid #e2e8f0; padding: .4cm .5cm; }
    .metric-label { font-size: 7.5pt; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-bottom: .1cm; }
    .metric-value { font-size: 14pt; font-weight: 700; color: #0f172a; }
    .metric-value span { font-size: 9pt; color: #1d4ed8; font-weight: 400; }
    .metric-desc { font-size: 7.5pt; color: #94a3b8; margin-top: .1cm; line-height: 1.35; }
    /* Highlights */
    .highlight { border-left: 4pt solid; padding: .35cm .7cm; margin: .4em 0; }
    .highlight-blue  { background: #eff6ff; border-left-color: #1d4ed8; }
    .highlight-green { background: #f0fdf4; border-left-color: #15803d; }
    .highlight-amber { background: #fffbeb; border-left-color: #b45309; }
    .highlight-red   { background: #fff1f2; border-left-color: #be123c; }
    .highlight-slate { background: #f8fafc; border-left-color: #334155; }
    .hl-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; opacity: .65; margin-bottom: .1cm; }
    .hl-value { font-size: 13pt; font-weight: 700; }
    .hl-sub   { font-size: 8pt; opacity: .6; margin-top: .1cm; }
    /* Timeline */
    .timeline { margin: .5em 0 .7em; }
    .tl-phase { margin-bottom: .5cm; padding-left: .3cm; border-left: 3pt solid #dbeafe; }
    .tl-period { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 8pt; font-weight: 600; padding: 1pt 5pt; font-family: monospace; margin-bottom: .1cm; }
    .tl-title { font-weight: 700; font-size: 10.5pt; display: block; margin-bottom: .2cm; }
    .tl-body ul { margin: 0; padding-left: 1.2em; }
    .tl-body li { font-size: 9pt; margin: .1cm 0; color: #475569; }
    .org-note { background: #f8fafc; border: 1pt dashed #cbd5e1; padding: .4cm; text-align: center; color: #64748b; font-style: italic; font-size: 9pt; margin: .4em 0; }
  </style>
</head>
<body>
<h1>${businessName} — Business Plan</h1>
<hr/>
${body}
</body>
</html>`;

  const BOM = "\uFEFF";
  return new Blob([BOM + docHtml], { type: "application/msword;charset=utf-8" });
}

export function generatePlanDOC(businessName: string, content: string | BusinessPlanData) {
  const blob = getPlanDOCBlob(businessName, content);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${businessName} - Business Plan.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Pitch Deck DOC ---

export function generatePitchDOC(businessName: string, slides: Slide[]) {
  const slidesHtml = slides.map((slide, i) => `
    <div style="page-break-after: ${i < slides.length - 1 ? "always" : "avoid"}; padding: 1.5cm 0;">
      <p style="font-size:8pt; color:#64748b;">Slide ${slide.slideNumber || i + 1} / ${slides.length}</p>
      <h1 style="font-size:22pt; color:#0f172a; margin: .3cm 0;">${slide.title}</h1>
      ${slide.subtitle ? `<p style="font-size:13pt; color:#64748b;">${slide.subtitle}</p>` : ""}
      <hr style="border:none; border-top:2pt solid #1e3a8a; width:3cm; margin:.5cm 0 .6cm;"/>
      ${slide.bullets && slide.bullets.length > 0 ? `
        <ul style="margin:.4cm 0;">
          ${slide.bullets.map(b => `<li style="margin:.3cm 0; font-size:12pt;">${b}</li>`).join("")}
        </ul>` : ""}
      ${slide.speakerNotes ? `
        <p style="font-size:8pt; color:#94a3b8; font-style:italic; margin-top:.8cm; border-top:1pt solid #e2e8f0; padding-top:.4cm;"><strong>Nota:</strong> ${slide.speakerNotes}</p>` : ""}
    </div>`).join("");

  const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${businessName} - Pitch Deck</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; color: #1e293b; margin: 2cm; }
    ul { padding-left: 1.4em; }
    li { margin: .2em 0; }
  </style>
</head>
<body>
<h1 style="font-size:24pt;">${businessName} — Pitch Deck</h1>
${slidesHtml}
</body>
</html>`;

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + docHtml], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${businessName} - Pitch Deck.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
