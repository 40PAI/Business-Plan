export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { streamOpenRouter } from "@/lib/openrouter";
import { buildPlanSystemPrompt, buildPlanUserPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    // Stream directly from AI provider to client — no server-side buffering.
    // This keeps the connection alive on Vercel because data flows continuously,
    // avoiding the 10s/30s timeout that kills buffered responses.
    const stream = await streamOpenRouter(
      buildPlanSystemPrompt(),
      buildPlanUserPrompt(answers)
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Plan-Format": "markdown",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Plan generation error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
