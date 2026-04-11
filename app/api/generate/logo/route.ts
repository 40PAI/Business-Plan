import { NextRequest } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildLogoPromptSystemPrompt, buildLogoPromptUserPrompt } from "@/lib/prompts";
import { uploadLogo } from "@/lib/storage-upload";

const N8N_WEBHOOK_URL =
  "https://automacoes.plenuz.co.ao/webhook/e6e6bc9f-b7f9-4420-b84d-2c1a97b09031";

export async function POST(req: NextRequest) {
  try {
    const { answers, projectId } = await req.json();

    if (!projectId) {
      return Response.json({ error: "projectId é necessário" }, { status: 400 });
    }

    // Step 1: Generate image prompt via OpenRouter (Claude Sonnet)
    const imagePrompt = await callOpenRouter(
      buildLogoPromptSystemPrompt(),
      buildLogoPromptUserPrompt(answers)
    );
    const cleanPrompt = imagePrompt.replace(/^["']|["']$/g, "").trim();

    // Step 2: Send prompt to n8n webhook and wait for binary image
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    let dataUrl: string;
    try {
      const webhookRes = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt }),
        signal: controller.signal,
      });

      if (!webhookRes.ok) {
        const body = await webhookRes.text().catch(() => "");
        throw new Error(`Webhook ${webhookRes.status}: ${body.slice(0, 120)}`);
      }

      const contentType =
        webhookRes.headers.get("content-type") ?? "image/png";
      const mimeType = contentType.split(";")[0].trim();

      const buffer = await webhookRes.arrayBuffer();
      
      // Step 3: Upload to Supabase Storage
      const publicUrl = await uploadLogo(projectId, buffer, mimeType);
      
      // Optional: keep base64 for immediate frontend display (but Supabase is preferred)
      // dataUrl = `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`;
      dataUrl = publicUrl;
    } finally {
      clearTimeout(timeoutId);
    }

    return Response.json({ 
      urls: [dataUrl], 
      prompt: cleanPrompt,
      storageUrl: dataUrl 
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Logo generation error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
