export async function GET() {
  const results: Record<string, string> = {};
  const errors: string[] = [];

  // Test 1: OpenRouter
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview",
        messages: [{ role: "user", content: "Say hello in 3 words" }],
        max_tokens: 20,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      results.openrouter = `OK: ${data.choices?.[0]?.message?.content?.slice(0, 50)}`;
    } else {
      const body = await res.text().catch(() => "");
      results.openrouter = `ERROR ${res.status}: ${body.slice(0, 100)}`;
    }
  } catch (e) {
    results.openrouter = `FAILED: ${(e as Error).message}`;
  }

  // Test 2: Pollinations POST (the endpoint that worked before)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: "You generate business names. Return only a JSON array of 3 names." },
          { role: "user", content: "Generate 3 names for a tech company" },
        ],
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json().catch(async () => {
        // Maybe it returned plain text
        return { _raw: "response was not JSON" };
      });
      const content = data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 200);
      results.pollinations_post = `OK: ${String(content).slice(0, 200)}`;
    } else {
      const body = await res.text().catch(() => "");
      results.pollinations_post = `ERROR ${res.status}: ${body.slice(0, 200)}`;
    }
  } catch (e) {
    results.pollinations_post = `FAILED: ${(e as Error).message}`;
  }

  // Test 3: HuggingFace (new URL)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(
      "https://router.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-3B-Instruct",
          messages: [{ role: "user", content: "Say hello" }],
          max_tokens: 10,
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      results.huggingface = `OK: ${data.choices?.[0]?.message?.content?.slice(0, 50)}`;
    } else {
      const body = await res.text().catch(() => "");
      results.huggingface = `ERROR ${res.status}: ${body.slice(0, 200)}`;
    }
  } catch (e) {
    results.huggingface = `FAILED: ${(e as Error).message}`;
  }

  // Test 4: Groq (needs GROQ_API_KEY)
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      results.groq = "SKIPPED: no GROQ_API_KEY set";
    } else {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Say hello" }],
          max_tokens: 10,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        results.groq = `OK: ${data.choices?.[0]?.message?.content?.slice(0, 50)}`;
      } else {
        const body = await res.text().catch(() => "");
        results.groq = `ERROR ${res.status}: ${body.slice(0, 100)}`;
      }
    }
  } catch (e) {
    results.groq = `FAILED: ${(e as Error).message}`;
  }

  // Test 5: Pollinations image
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(
      "https://image.pollinations.ai/prompt/simple%20logo?width=100&height=100&nologo=true",
      { signal: controller.signal, redirect: "follow" }
    );
    clearTimeout(timeout);
    results.pollinations_image = res.ok
      ? `OK (${res.headers.get("content-type")}, ${res.headers.get("content-length")} bytes)`
      : `ERROR ${res.status}`;
  } catch (e) {
    results.pollinations_image = `FAILED: ${(e as Error).message}`;
  }

  return Response.json(results);
}
