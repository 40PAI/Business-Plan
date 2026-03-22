import jsPDF from "jspdf";

const MARGIN = 25;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Colors
const COLOR_DARK = [15, 23, 42] as const;     // slate-900
const COLOR_MID = [71, 85, 105] as const;      // slate-500
const COLOR_ACCENT = [30, 64, 120] as const;   // blue accent
const COLOR_LIGHT_BG = [241, 245, 249] as const; // slate-100

function addHeader(doc: jsPDF, businessName: string, type: string) {
  // Header bar
  doc.setFillColor(...COLOR_DARK);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("PlanAI", MARGIN, 12);
  doc.setFont("helvetica", "normal");
  doc.text(type, PAGE_W - MARGIN, 12, { align: "right" });

  // Title
  doc.setTextColor(...COLOR_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(businessName, MARGIN, 35);

  // Divider
  doc.setDrawColor(...COLOR_ACCENT);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 40, MARGIN + 40, 40);
}

function addFooter(doc: jsPDF, page: number, total: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_MID);
  doc.text(`Gerado por PlanAI`, MARGIN, PAGE_H - 10);
  doc.text(`${page} / ${total}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 20) {
    doc.addPage();
    return 25;
  }
  return y;
}

// --- Business Plan PDF ---

export function generatePlanPDF(businessName: string, markdownContent: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, businessName, "Business Plan");

  let y = 50;
  const lines = markdownContent.split("\n");

  for (const line of lines) {
    if (line.trim() === "") {
      y += 3;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      y = ensureSpace(doc, y, 20);
      y += 8;
      doc.setFillColor(...COLOR_LIGHT_BG);
      doc.roundedRect(MARGIN - 2, y - 6, CONTENT_W + 4, 12, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...COLOR_DARK);
      doc.text(line.slice(2), MARGIN, y + 2);
      y += 14;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      y = ensureSpace(doc, y, 16);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...COLOR_ACCENT);
      doc.text(line.slice(3), MARGIN, y);
      // underline
      doc.setDrawColor(...COLOR_ACCENT);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, y + 2, MARGIN + doc.getTextWidth(line.slice(3)), y + 2);
      y += 8;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      y = ensureSpace(doc, y, 14);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_DARK);
      doc.text(line.slice(4), MARGIN, y);
      y += 7;
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const text = cleanBold(line.slice(2));
      y = ensureSpace(doc, y, 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_MID);

      // Bullet dot
      doc.setFillColor(...COLOR_ACCENT);
      doc.circle(MARGIN + 2, y - 1, 1, "F");

      const wrapped = doc.splitTextToSize(text, CONTENT_W - 10);
      for (const wLine of wrapped) {
        y = ensureSpace(doc, y, 5);
        doc.text(wLine, MARGIN + 7, y);
        y += 5;
      }
      y += 1;
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      const text = cleanBold(numMatch[2]);
      y = ensureSpace(doc, y, 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_ACCENT);
      doc.text(`${numMatch[1]}.`, MARGIN, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLOR_MID);
      const wrapped = doc.splitTextToSize(text, CONTENT_W - 10);
      for (const wLine of wrapped) {
        y = ensureSpace(doc, y, 5);
        doc.text(wLine, MARGIN + 7, y);
        y += 5;
      }
      y += 1;
      continue;
    }

    // Regular paragraph
    const text = cleanBold(line);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_MID);
    const wrapped = doc.splitTextToSize(text, CONTENT_W);
    for (const wLine of wrapped) {
      y = ensureSpace(doc, y, 5);
      doc.text(wLine, MARGIN, y);
      y += 5;
    }
    y += 1;
  }

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`${businessName} - Business Plan.pdf`);
}

// --- Pitch Deck PDF ---

interface Slide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  speakerNotes?: string;
}

export function generatePitchPDF(businessName: string, slides: Slide[]) {
  // Landscape for pitch deck
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = 297;
  const H = 210;
  const M = 20;

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) doc.addPage("a4", "landscape");
    const slide = slides[i];

    // Background
    doc.setFillColor(...COLOR_DARK);
    doc.rect(0, 0, W, H, "F");

    // Slide number badge
    doc.setFillColor(...COLOR_ACCENT);
    doc.roundedRect(M, M, 30, 10, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Slide ${slide.slideNumber || i + 1} / ${slides.length}`, M + 15, M + 6.5, { align: "center" });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(slide.title, W - M * 2);
    let y = M + 25;
    for (const tLine of titleLines) {
      doc.text(tLine, M, y);
      y += 12;
    }

    // Subtitle
    if (slide.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(180, 190, 210);
      doc.text(slide.subtitle, M, y + 2);
      y += 12;
    }

    // Divider
    y += 4;
    doc.setDrawColor(60, 80, 120);
    doc.setLineWidth(0.3);
    doc.line(M, y, M + 60, y);
    y += 10;

    // Bullets
    if (slide.bullets && slide.bullets.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      for (const bullet of slide.bullets) {
        if (y > H - 35) break;
        // Arrow icon
        doc.setTextColor(100, 140, 200);
        doc.text("→", M, y);
        // Bullet text
        doc.setTextColor(220, 225, 235);
        const wrapped = doc.splitTextToSize(bullet, W - M * 2 - 15);
        for (const wLine of wrapped) {
          if (y > H - 35) break;
          doc.text(wLine, M + 10, y);
          y += 7;
        }
        y += 3;
      }
    }

    // Speaker notes at bottom
    if (slide.speakerNotes) {
      doc.setDrawColor(50, 60, 80);
      doc.setLineWidth(0.2);
      doc.line(M, H - 25, W - M, H - 25);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 150);
      const noteLines = doc.splitTextToSize(`Nota: ${slide.speakerNotes}`, W - M * 2);
      let ny = H - 20;
      for (const nLine of noteLines.slice(0, 2)) {
        doc.text(nLine, M, ny);
        ny += 4;
      }
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80, 90, 110);
    doc.text(`${businessName} — PlanAI`, M, H - 8);
    doc.text(`${i + 1} / ${slides.length}`, W - M, H - 8, { align: "right" });
  }

  doc.save(`${businessName} - Pitch Deck.pdf`);
}

// Strip markdown bold markers for PDF
function cleanBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}
