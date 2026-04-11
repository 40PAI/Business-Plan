export const maxDuration = 60;
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildPitchSystemPrompt, buildPitchUserPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    // Calling the API directly (blocking) instead of streaming.
    // Vercel hobby supports up to 60s for Node runtime.
    // This completely prevents JSON corruption from stream keep-alive spaces.
    const content = await callOpenRouter(
      buildPitchSystemPrompt(),
      buildPitchUserPrompt(answers),
      8000
    );

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Pitch generation error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
