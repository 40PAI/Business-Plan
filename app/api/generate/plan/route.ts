export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { streamOpenRouter } from "@/lib/openrouter";
import { buildPlanJSONSystemPrompt, buildPlanJSONUserPrompt, buildPlanSystemPrompt, buildPlanUserPrompt } from "@/lib/prompts";
import { isBusinessPlanData } from "@/lib/plan-schema";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    // Collect the full streamed response (needed to parse JSON)
    const stream = await streamOpenRouter(
      buildPlanJSONSystemPrompt(),
      buildPlanJSONUserPrompt(answers)
    );

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullContent += decoder.decode(value, { stream: true });
    }

    // Try to parse as structured JSON
    const cleaned = fullContent
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Find outermost JSON object
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start >= 0 && end > start) {
      try {
        const planData = JSON.parse(cleaned.slice(start, end + 1));
        if (isBusinessPlanData(planData)) {
          return Response.json({ format: "json", plan: planData });
        }
      } catch {
        // Fall through to markdown fallback
      }
    }

    // Fallback: regenerate as markdown (old format)
    console.warn("JSON parse failed, falling back to markdown plan");
    const markdownStream = await streamOpenRouter(
      buildPlanSystemPrompt(),
      buildPlanUserPrompt(answers)
    );

    return new Response(markdownStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
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
