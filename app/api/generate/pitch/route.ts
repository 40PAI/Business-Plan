export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { streamOpenRouter } from "@/lib/openrouter";
import { buildPitchSystemPrompt, buildPitchUserPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    // Stream directly from AI provider to client — avoids Vercel timeout.
    // The client will accumulate the full content and parse slides JSON.
    const stream = await streamOpenRouter(
      buildPitchSystemPrompt(),
      buildPitchUserPrompt(answers)
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Kind": "pitch-stream",
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
