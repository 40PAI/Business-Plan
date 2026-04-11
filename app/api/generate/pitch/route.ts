export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildPitchSystemPrompt, buildPitchUserPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const systemPrompt = buildPitchSystemPrompt();
    const userPrompt = buildPitchUserPrompt(answers);

    const content = await callOpenRouter(systemPrompt, userPrompt, 12000);

    // Aggressively extract JSON array from the response
    let slides = null;

    // Try: strip markdown fences and parse
    try {
      const cleaned = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      slides = JSON.parse(cleaned);
    } catch {
      // Try: find the first [...] block
      try {
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
          slides = JSON.parse(match[0]);
        }
      } catch {
        slides = null;
      }
    }

    if (!Array.isArray(slides)) {
      // Return raw content for client-side retry
      return Response.json({ slides: null, raw: content });
    }

    return Response.json({ slides, raw: null });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Pitch generation error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
