import { NextRequest } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildPitchSystemPrompt, buildPitchUserPrompt } from "@/lib/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const systemPrompt = buildPitchSystemPrompt();
    const userPrompt = buildPitchUserPrompt(answers);

    const content = await callOpenRouter(systemPrompt, userPrompt);

    // Try to parse JSON from the response
    let slides;
    try {
      // Handle case where model wraps in markdown code block
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      slides = JSON.parse(cleaned);
    } catch {
      slides = null;
    }

    return Response.json({ slides, raw: content });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Pitch generation error:", msg);
    return Response.json(
      { error: msg },
      { status: 500 }
    );
  }
}
