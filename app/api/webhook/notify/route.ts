export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

const WEBHOOK_URL =
  "https://automacoes.plenuz.co.ao/webhook/b09ca47f-521e-411b-86d4-f97909a8cf17";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return Response.json(
        { error: `Webhook responded ${res.status}: ${body.slice(0, 200)}` },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Webhook proxy error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
