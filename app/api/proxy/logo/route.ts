import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const prompt = url.searchParams.get("prompt");
    const seed = url.searchParams.get("seed") || "1";

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?width=768&height=768&seed=${seed}`;

    const authHeaders: Record<string, string> = {};
    if (process.env.POLLINATIONS_API_KEY) {
      authHeaders["Authorization"] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
    }

    const response = await fetch(pollinationsUrl, { headers: authHeaders });

    if (!response.ok) {
      console.error("Pollinations error:", response.status, await response.text());
      return new Response("Error fetching logo from Pollinations", { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Logo proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
