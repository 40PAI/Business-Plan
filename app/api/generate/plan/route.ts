export const maxDuration = 300;
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { streamOpenRouter } from "@/lib/openrouter";
import { buildPlanSystemPrompt, buildPlanUserPromptChunk } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sys = buildPlanSystemPrompt();

          // 5 sequential chunks — each covers a group of sections.
          for (let i = 0; i < 5; i++) {
            const userPrompt = buildPlanUserPromptChunk(answers, i);
            const chunkStream = await streamOpenRouter(sys, userPrompt, 8000);
            const reader = chunkStream.getReader();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }

            // Section separator between chunks
            if (i < 4) {
              controller.enqueue(new TextEncoder().encode("\n\n---\n\n"));
            }
          }

          controller.close();
        } catch (error) {
          console.error("Plan sequence error:", error);
          const msg = error instanceof Error ? error.message : "Erro na sequência";
          controller.enqueue(new TextEncoder().encode(`\n\nErro interno: ${msg}`));
          controller.close();
        }
      }
    });

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
