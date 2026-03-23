import { NextRequest } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildNamesSystemPrompt, buildNamesUserPrompt } from "@/lib/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const systemPrompt = buildNamesSystemPrompt();
    const userPrompt = buildNamesUserPrompt(answers);

    const content = await callOpenRouter(systemPrompt, userPrompt);

    let names: string[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      names = JSON.parse(cleaned);
    } catch {
      // Fallback: extract names from text
      names = content
        .split("\n")
        .map((line) => line.replace(/^[\d\-.*]+\s*/, "").trim())
        .filter((line) => line.length > 0 && line.length < 30)
        .slice(0, 10);
    }

    return Response.json({ names });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Name generation error:", msg);
    return Response.json(
      { error: msg },
      { status: 500 }
    );
  }
}
