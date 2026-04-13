export const maxDuration = 300;
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildPlanJSONSystemPrompt, buildPlanJSONUserPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    // Single blocking call — returns structured JSON instead of 5 streaming markdown chunks.
    // This eliminates duplication, reduces tokens, and enables the rich JSON renderer.
    const raw = await callOpenRouter(
      buildPlanJSONSystemPrompt(),
      buildPlanJSONUserPrompt(answers),
      14000
    );

    // Validate and extract the JSON object from the response
    let jsonContent = raw.trim();

    // Strip markdown code fences if the model wrapped the JSON
    jsonContent = jsonContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    // Confirm it at least starts with { — if not, try to extract
    if (!jsonContent.startsWith("{")) {
      const match = jsonContent.match(/\{[\s\S]*\}/);
      if (match) jsonContent = match[0];
    }

    return new Response(jsonContent, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
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
