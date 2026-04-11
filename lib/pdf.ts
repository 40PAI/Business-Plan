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
      h1 { page-break-before: auto; }
      table { page-break-inside: avoid; }
    }
    .cover { text-align:center; padding: 3cm 0 2cm; border-bottom: 2px solid #1e3a8a; margin-bottom: 2cm; }
    .cover .label { font-size:9pt; letter-spacing:.15em; text-transform:uppercase; color:#64748b; margin-bottom:.5cm; }
    h1 { font-size: 20pt; color: #0f172a; margin: 1.2em 0 .4em; border-bottom: 2px solid #e2e8f0; padding-bottom: .3em; }
    h2 { font-size: 15pt; color: #1e3a8a; margin: 1em 0 .3em; }
    h3 { font-size: 13pt; color: #0f172a; margin: .9em 0 .2em; }
    h4 { font-size: 11pt; font-weight: bold; color: #334155; margin: .7em 0 .2em; }
    p { margin: .4em 0 .5em; line-height: 1.6; }
    ul, ol { margin: .4em 0 .6em; padding-left: 1.4em; }
    li { margin: .25em 0; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 10pt; }
    th { background: #1e3a8a; color: white; padding: 7px 10px; text-align: left; font-size: 9pt; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    blockquote { border-left: 4px solid #3b82f6; margin: .8em 0; padding: .4em 1em; color: #475569; font-style: italic; background: #f0f9ff; border-radius: 0 6px 6px 0; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1em 0; }
    pre.ascii { font-family: monospace; font-size: 9pt; background: #f8fafc; border: 1px solid #e2e8f0; padding: .8em; border-radius: 6px; overflow-x: auto; white-space: pre; color: #334155; }
    pre code { display: block; background: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 6px; font-size: 9pt; white-space: pre-wrap; }
    strong { color: #0f172a; }
    .footer { text-align: center; font-size: 8pt; color: #94a3b8; margin-top: 2em; padding-top: .5em; border-top: 1px solid #e2e8f0; }
    .print-btn { position: fixed; top: 1cm; right: 1cm; background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 12pt; z-index: 999; }
    
    /* Cover Grid Styles (for JSON data) */
    .cover-header { background: #1e3a8a; color: white; padding: 3cm 1cm 1.5cm; }
    .cover-body { padding: 1.5cm; border: 1pt solid #e2e8f0; border-top: none; }
    .cover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1cm; margin-bottom: 1cm; }
    .cg-label { font-size: 8pt; text-transform: uppercase; color: #94a3b8; }
    .cg-value { font-weight: bold; }
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
    h1 { font-size: 20pt; color: #0f172a; margin-top: 1.2em; }
    h2 { font-size: 15pt; color: #1e3a8a; margin-top: 1em; }
    h3 { font-size: 13pt; color: #0f172a; margin-top: .9em; }
    h4 { font-size: 11pt; font-weight: bold; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; }
    th { background: #1e3a8a; color: white; padding: 6pt 8pt; text-align: left; font-size: 9pt; }
    td { padding: 5pt 8pt; border-bottom: 1pt solid #e2e8f0; font-size: 10pt; }
    tr:nth-child(even) td { background: #f8fafc; }
    blockquote { border-left: 4pt solid #3b82f6; padding-left: 12pt; color: #64748b; font-style: italic; margin: .5em 0; }
    hr { border: none; border-top: 1pt solid #e2e8f0; margin: 1em 0; }
    ul, ol { margin: .4em 0; padding-left: 1.4em; }
    li { margin: .2em 0; }
    pre.ascii { font-family: monospace; font-size: 9pt; }
    pre code { font-family: monospace; font-size: 9pt; }
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
