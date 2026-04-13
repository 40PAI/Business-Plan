import type { BusinessPlanData, PlanBlock, OrgNode } from "./plan-schema";

// ─── Org tree renderer ───────────────────────────────────────────────────────

function renderOrgNode(node: OrgNode, isRoot = false): string {
  const children = node.children ?? [];
  return `
    <div class="org-node-wrap">
      <div class="org-node ${isRoot ? "org-root" : ""}">
        <div class="org-title">${node.title}</div>
        ${node.subtitle ? `<div class="org-sub">${node.subtitle}</div>` : ""}
      </div>
      ${children.length > 0 ? `
        <div class="org-children">
          ${children.map((c) => renderOrgNode(c)).join("")}
        </div>` : ""}
    </div>`;
}

// ─── Block renderer ──────────────────────────────────────────────────────────

function renderBlock(block: PlanBlock): string {
  switch (block.type) {
    case "text":
      return `<p class="bp-text">${block.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;

    case "bullets":
      return `<ul class="bp-bullets">${block.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

    case "numbered":
      return `<ol class="bp-numbered">${block.items.map((i) => `<li>${i}</li>`).join("")}</ol>`;

    case "table":
      return `
        ${block.title ? `<p class="tbl-title">${block.title}</p>` : ""}
        <div class="tbl-wrap">
          <table>
            <thead><tr>${block.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>${block.rows.map((r, ri) => `<tr class="${ri % 2 === 0 ? "" : "alt"}">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>`;

    case "swot":
      return `
        <div class="swot">
          <div class="swot-q swot-s"><div class="swot-label">💪 Forças</div><ul>${block.strengths.map((i) => `<li>${i}</li>`).join("")}</ul></div>
          <div class="swot-q swot-w"><div class="swot-label">⚠️ Fraquezas</div><ul>${block.weaknesses.map((i) => `<li>${i}</li>`).join("")}</ul></div>
          <div class="swot-q swot-o"><div class="swot-label">🚀 Oportunidades</div><ul>${block.opportunities.map((i) => `<li>${i}</li>`).join("")}</ul></div>
          <div class="swot-q swot-t"><div class="swot-label">🔥 Ameaças</div><ul>${block.threats.map((i) => `<li>${i}</li>`).join("")}</ul></div>
        </div>`;

    case "metrics":
      return `
        <div class="metrics">
          ${block.items.map((m) => `
            <div class="metric">
              <div class="metric-label">${m.label}</div>
              <div class="metric-value">${m.value}${m.unit ? `<span class="metric-unit"> ${m.unit}</span>` : ""}</div>
              ${m.desc ? `<div class="metric-desc">${m.desc}</div>` : ""}
            </div>`).join("")}
        </div>`;

    case "highlight": {
      const colors: Record<string, string> = {
        blue: "#dbeafe|#1d4ed8",
        green: "#d1fae5|#065f46",
        amber: "#fef3c7|#92400e",
        red: "#fee2e2|#991b1b",
        slate: "#f1f5f9|#334155",
      };
      const [bg, text] = (colors[block.color ?? "blue"] ?? colors.blue).split("|");
      return `
        <div class="highlight" style="background:${bg};border-left-color:${text}">
          <div class="hl-label" style="color:${text}">${block.label}</div>
          <div class="hl-value" style="color:${text}">${block.value}</div>
          ${block.sublabel ? `<div class="hl-sub">${block.sublabel}</div>` : ""}
        </div>`;
    }

    case "organogram":
      return `<div class="org-wrap">${renderOrgNode(block.root, true)}</div>`;

    case "timeline":
      return `
        <div class="timeline">
          ${block.phases.map((p, i) => `
            <div class="tl-item">
              <div class="tl-dot">${i + 1}</div>
              <div class="tl-content">
                <span class="tl-period">${p.period}</span>
                <strong class="tl-title">${p.title}</strong>
                <ul>${p.tasks.map((t) => `<li>${t}</li>`).join("")}</ul>
              </div>
            </div>`).join("")}
        </div>`;

    default:
      return "";
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function getPlanHTMLBlob(businessName: string, content: string | BusinessPlanData): Blob {
  const html = buildPlanHTML(businessName, content);
  return new Blob([html], { type: "text/html;charset=utf-8" });
}

export function downloadPlanHTML(businessName: string, content: string | BusinessPlanData) {
  const blob = getPlanHTMLBlob(businessName, content);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${businessName} - Business Plan.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildPlanHTML(businessName: string, content: string | BusinessPlanData): string {
  if (typeof content === "string") {
    // Markdown fallback — wrap in minimal styled container
    return `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/><title>${businessName} — Business Plan</title>
    <style>body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:2rem;color:#1e293b;line-height:1.6}h1,h2,h3{color:#1e3a8a}table{width:100%;border-collapse:collapse;margin:1em 0}th{background:#1e3a8a;color:#fff;padding:8px 12px;text-align:left}td{padding:7px 12px;border-bottom:1px solid #e2e8f0}tr:nth-child(even) td{background:#f8fafc}</style>
    </head><body><h1>${businessName} — Business Plan</h1><hr/><pre style="white-space:pre-wrap">${content}</pre></body></html>`;
  }

  const plan = content;

  // Build nav links
  const navLinks = plan.sections.map((s) =>
    `<a href="#sec-${s.id}">${s.number}. ${s.title}</a>`
  ).join("");

  // Build sections
  const sectionsHtml = plan.sections.map((s) => {
    const blocks = (s.blocks ?? []).map(renderBlock).join("");
    const subs = (s.subsections ?? []).map((sub) =>
      `<div class="subsection"><h3>${sub.title}</h3>${sub.blocks.map(renderBlock).join("")}</div>`
    ).join("");
    return `
      <section id="sec-${s.id}">
        <div class="section-header">
          <span class="section-num">Secção ${s.number}</span>
          <h2>${s.number}. ${s.title}</h2>
          <div class="section-rule"></div>
        </div>
        ${blocks}${subs}
      </section>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${plan.cover.businessName} — Business Plan</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: #1e3a8a;
      --accent: #3b82f6;
      --bg: #f8fafc;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #1e293b;
      --muted: #64748b;
      --radius: 12px;
    }

    html { scroll-behavior: smooth; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 15px; color: var(--text); background: var(--bg); }

    /* ── Layout ── */
    .layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px; flex-shrink: 0; background: var(--primary);
      padding: 2rem 1.2rem; position: sticky; top: 0; height: 100vh;
      overflow-y: auto; display: flex; flex-direction: column; gap: .3rem;
    }
    .sidebar-brand { color: white; font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; margin-bottom: 1rem; opacity: .6; }
    .sidebar a {
      color: rgba(255,255,255,.75); text-decoration: none; font-size: .82rem;
      padding: .45rem .8rem; border-radius: 8px; display: block; transition: all .15s;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sidebar a:hover { background: rgba(255,255,255,.12); color: white; }
    .main { flex: 1; padding: 3rem 4rem; max-width: 900px; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main { padding: 1.5rem; }
    }

    /* ── Cover ── */
    .cover { border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); margin-bottom: 3.5rem; }
    .cover-top { background: var(--primary); padding: 2rem 2.5rem; }
    .cover-top .label { font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.6); }
    .cover-top h1 { color: white; font-size: 2.2rem; font-weight: 700; margin-top: .3rem; }
    .cover-body { background: white; padding: 1.5rem 2.5rem; }
    .tagline { color: var(--muted); font-style: italic; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); font-size: .95rem; }
    .cover-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .cover-field .cf-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
    .cover-field .cf-value { font-weight: 600; font-size: .9rem; margin-top: .2rem; }
    .confidential { font-size: .75rem; color: var(--muted); text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }

    /* ── Sections ── */
    section { margin-bottom: 4rem; }
    .section-header { margin-bottom: 1.5rem; }
    .section-num { font-family: monospace; font-size: .75rem; color: var(--accent); }
    .section-header h2 { font-size: 2rem; font-weight: 700; margin-top: .2rem; letter-spacing: -.02em; }
    .section-rule { width: 48px; height: 3px; background: var(--accent); opacity: .4; margin-top: .75rem; border-radius: 2px; }
    .subsection { margin-top: 1.5rem; }
    .subsection h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: .75rem; color: var(--text); }

    /* ── Blocks ── */
    .bp-text { line-height: 1.7; color: #374151; margin: .5rem 0 .75rem; }
    .bp-bullets, .bp-numbered { margin: .5rem 0 .75rem; padding-left: 1.5rem; }
    .bp-bullets li, .bp-numbered li { margin: .35rem 0; line-height: 1.5; color: #374151; }

    /* Table */
    .tbl-wrap { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--border); margin: .75rem 0 1rem; }
    .tbl-title { font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: .4rem; }
    table { width: 100%; border-collapse: collapse; font-size: .88rem; }
    thead tr { background: #f1f5f9; border-bottom: 1px solid var(--border); }
    th { padding: .65rem 1rem; text-align: left; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text); }
    td { padding: .65rem 1rem; color: #374151; line-height: 1.4; border-bottom: 1px solid #f1f5f9; }
    tr.alt td { background: #fafafa; }

    /* SWOT */
    .swot { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin: .75rem 0 1rem; }
    .swot-q { border-radius: var(--radius); padding: 1rem; }
    .swot-s { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .swot-w { background: #fff1f2; border: 1px solid #fecdd3; }
    .swot-o { background: #eff6ff; border: 1px solid #bfdbfe; }
    .swot-t { background: #fffbeb; border: 1px solid #fde68a; }
    .swot-label { font-weight: 700; font-size: .8rem; margin-bottom: .5rem; }
    .swot-s .swot-label { color: #15803d; }
    .swot-w .swot-label { color: #be123c; }
    .swot-o .swot-label { color: #1d4ed8; }
    .swot-t .swot-label { color: #b45309; }
    .swot-q ul { list-style: none; padding: 0; }
    .swot-q li { font-size: .82rem; color: #374151; padding: .2rem 0; }
    .swot-q li::before { content: "• "; opacity: .5; }

    /* Metrics */
    .metrics { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: .75rem; margin: .75rem 0 1rem; }
    .metric { background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; }
    .metric-label { font-size: .75rem; color: var(--muted); margin-bottom: .3rem; }
    .metric-value { font-size: 1.4rem; font-weight: 700; color: var(--text); line-height: 1.1; }
    .metric-unit { font-size: .85rem; font-weight: 400; color: var(--accent); }
    .metric-desc { font-size: .73rem; color: var(--muted); margin-top: .3rem; line-height: 1.3; }

    /* Highlight */
    .highlight { border-left: 4px solid; border-radius: 0 var(--radius) var(--radius) 0; padding: .9rem 1.2rem; margin: .6rem 0; }
    .hl-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; opacity: .7; margin-bottom: .2rem; }
    .hl-value { font-size: 1.15rem; font-weight: 700; }
    .hl-sub { font-size: .78rem; opacity: .6; margin-top: .2rem; }

    /* Organogram */
    .org-wrap { overflow-x: auto; padding: 1.5rem; background: #f8fafc; border-radius: var(--radius); border: 1px solid var(--border); margin: .75rem 0 1rem; }
    .org-node-wrap { display: flex; flex-direction: column; align-items: center; }
    .org-node { border-radius: 8px; border: 1px solid var(--border); background: white; padding: .5rem 1rem; text-align: center; min-width: 120px; max-width: 180px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .org-root { background: var(--primary); border-color: var(--primary); color: white; }
    .org-root .org-sub { color: rgba(255,255,255,.7); }
    .org-title { font-weight: 600; font-size: .85rem; }
    .org-sub { font-size: .75rem; color: var(--muted); margin-top: .15rem; }
    .org-children { display: flex; gap: 1.5rem; align-items: flex-start; position: relative; padding-top: 1.5rem; }
    .org-children::before { content: ""; position: absolute; top: 0; left: 50%; width: 1px; height: .75rem; background: var(--border); transform: translateX(-50%); }
    .org-children > .org-node-wrap::before { content: ""; display: block; width: 1px; height: .75rem; background: var(--border); margin: 0 auto; }

    /* Timeline */
    .timeline { margin: .75rem 0 1rem; }
    .tl-item { display: flex; gap: 1rem; padding-bottom: 1.5rem; position: relative; }
    .tl-item:not(:last-child)::before { content: ""; position: absolute; left: 15px; top: 32px; bottom: 0; width: 1px; background: var(--border); }
    .tl-dot { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: white; font-weight: 700; font-size: .8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tl-content { flex: 1; padding-top: .2rem; }
    .tl-period { display: inline-block; background: #eff6ff; color: var(--accent); border-radius: 99px; font-size: .75rem; font-weight: 600; padding: .15rem .65rem; margin-bottom: .35rem; font-family: monospace; }
    .tl-title { display: block; font-weight: 600; font-size: .95rem; margin-bottom: .4rem; }
    .tl-content ul { list-style: none; padding: 0; }
    .tl-content li { font-size: .82rem; color: var(--muted); padding: .15rem 0; }
    .tl-content li::before { content: "· "; }

    /* Footer */
    .page-footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: .78rem; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="layout">
    <nav class="sidebar">
      <div class="sidebar-brand">Business Plan</div>
      ${navLinks}
    </nav>
    <main class="main">

      <!-- Cover -->
      <div class="cover">
        <div class="cover-top">
          <div class="label">Business Plan</div>
          <h1>${plan.cover.businessName}</h1>
        </div>
        <div class="cover-body">
          ${plan.cover.tagline ? `<p class="tagline">"${plan.cover.tagline}"</p>` : ""}
          <div class="cover-grid">
            ${[
              ["Sector", plan.cover.sector],
              ["Localização", `${plan.cover.province}, ${plan.cover.country}`],
              ["Forma Jurídica", plan.cover.legalForm ?? ""],
              ["Data", plan.cover.date],
              ["Versão", plan.cover.version],
              ["Contacto", plan.cover.contact ?? ""],
            ].filter(([, v]) => v).map(([l, v]) => `
              <div class="cover-field">
                <div class="cf-label">${l}</div>
                <div class="cf-value">${v}</div>
              </div>`).join("")}
          </div>
          ${plan.cover.confidential ? `<p class="confidential">${plan.cover.confidential}</p>` : ""}
        </div>
      </div>

      <!-- Sections -->
      ${sectionsHtml}

      <div class="page-footer">
        Gerado por <strong>PlanAI</strong> &nbsp;·&nbsp;
        ${new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
      </div>
    </main>
  </div>
</body>
</html>`;
}
