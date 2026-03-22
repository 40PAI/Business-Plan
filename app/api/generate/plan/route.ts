import { NextRequest } from "next/server";
import { streamOpenRouter } from "@/lib/openrouter";
import { buildPlanSystemPrompt, buildPlanUserPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const systemPrompt = buildPlanSystemPrompt();
    const userPrompt = buildPlanUserPrompt(answers);

    const stream = await streamOpenRouter(systemPrompt, userPrompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
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
