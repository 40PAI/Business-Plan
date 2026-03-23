import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const prompt = url.searchParams.get("prompt");
    const seed = url.searchParams.get("seed") || "1";
    const name = url.searchParams.get("name") || "Brand";

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?width=768&height=768&seed=${seed}`;

    // Retry up to 3 times with delays to handle rate limits (429)
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, attempt * 5000));
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(pollinationsUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.status === 429) {
          console.warn(`Pollinations 429 (attempt ${attempt + 1}/3), retrying...`);
          continue;
        }

        if (!response.ok) {
          console.warn(`Pollinations ${response.status} (attempt ${attempt + 1}/3)`);
          continue;
        }

        const contentType = response.headers.get("Content-Type") || "";
        if (!contentType.startsWith("image/")) {
          console.warn(`Unexpected content type: ${contentType} (attempt ${attempt + 1}/3)`);
          continue;
        }

        return new Response(response.body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (fetchErr) {
        const msg = fetchErr instanceof Error ? fetchErr.message : "Fetch failed";
        console.warn(`Pollinations fetch error (attempt ${attempt + 1}/3):`, msg);
      }
    }

    // Fallback: generate a clean SVG logo placeholder
    console.warn("Pollinations failed after 3 attempts, returning SVG fallback");
    const initials = name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Deterministic color from seed
    const seedNum = parseInt(seed, 10) || 0;
    const hue = (seedNum * 137) % 360;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768">
  <rect width="768" height="768" fill="white"/>
  <circle cx="384" cy="340" r="200" fill="hsl(${hue}, 45%, 55%)"/>
  <text x="384" y="360" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="700" font-size="140" fill="white">${initials}</text>
  <text x="384" y="580" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="48" fill="hsl(${hue}, 30%, 35%)">${escapeXml(name)}</text>
  <text x="384" y="640" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" fill="#999">Logo provisório · Clique Regenerar</text>
</svg>`;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Logo proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
