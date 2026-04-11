const OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet";

// --- OpenRouter ---
async function makeOpenRouterRequest(body: Record<string, unknown>) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "PlanAI",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      let errorMessage = `OpenRouter ${response.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        errorMessage = parsed.error?.message || errorMessage;
      } catch {
        // use default
      }
      throw new Error(errorMessage);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Pollinations OpenAI-compatible endpoint (anonymous, no key) ---
async function makePollinationsRequest(
  messages: { role: string; content: string }[],
  stream = false
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages,
        stream,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Pollinations ${response.status}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Pollinations simple GET endpoint (plain text) ---
async function makePollinationsSimpleRequest(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const encoded = encodeURIComponent(fullPrompt);
    const response = await fetch(
      `https://text.pollinations.ai/${encoded}?model=openai&seed=${Date.now()}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(`Pollinations Simple ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

// --- Groq (free tier, needs GROQ_API_KEY) ---
async function makeGroqRequest(
  body: Record<string, unknown>
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`Groq ${response.status}: ${errorBody.slice(0, 100)}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// --- HuggingFace (needs HF key or free tier) ---
async function makeHuggingFaceRequest(
  messages: { role: string; content: string }[],
  stream = false
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(
      "https://router.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-3B-Instruct",
          messages,
          max_tokens: 4000,
          stream,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace ${response.status}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Public API ---

export async function streamOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 8000
): Promise<ReadableStream<Uint8Array>> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  // Try models via OpenRouter — paid first, then free-tier fallbacks
  const orModels = [
    "anthropic/claude-3.5-haiku",
    "anthropic/claude-3-haiku",
    "google/gemini-2.0-flash-001",
    "google/gemini-flash-1.5-8b",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  for (const model of orModels) {
    try {
      const response = await makeOpenRouterRequest({
        model,
        messages,
        stream: true,
        max_tokens: Math.min(maxTokens, 8192),
        temperature: 0.7,
      });
      return createSSEStream(response);
    } catch (e1) {
      console.warn(`OpenRouter stream failed for ${model}:`, (e1 as Error).message);
    }
  }

  // Try Groq (streaming)
  try {
    const response = await makeGroqRequest({
      model: "llama-3.3-70b-versatile",
      messages,
      stream: true,
      max_tokens: Math.min(maxTokens, 8000),
      temperature: 0.7,
    });
    return createSSEStream(response);
  } catch (e2) {
    console.warn("Groq stream failed:", (e2 as Error).message);
  }

  // Try Pollinations OpenAI endpoint (streaming)
  try {
    const response = await makePollinationsRequest(messages, true);
    return createSSEStream(response);
  } catch (e3) {
    console.warn("Pollinations stream failed:", (e3 as Error).message);
  }

  // Try HuggingFace (streaming)
  try {
    const response = await makeHuggingFaceRequest(messages, true);
    return createSSEStream(response);
  } catch (e4) {
    console.warn("HuggingFace stream failed:", (e4 as Error).message);
  }

  // Last resort: Pollinations simple GET (non-streaming, wrap in stream)
  try {
    const text = await makePollinationsSimpleRequest(systemPrompt, userPrompt);
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(text));
        controller.close();
      },
    });
  } catch (e4) {
    console.error("All providers failed:", (e4 as Error).message);
    throw new Error(
      "Todos os provedores de IA falharam. Verifique sua conexão ou tente novamente mais tarde."
    );
  }
}

export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 8000
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const orModels = [
    "anthropic/claude-3.5-haiku",
    "anthropic/claude-3-haiku",
    "google/gemini-2.0-flash-001",
    "google/gemini-flash-1.5-8b",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  // Try models via OpenRouter sequentially
  for (const model of orModels) {
    try {
      const response = await makeOpenRouterRequest({
        model,
        messages,
        max_tokens: Math.min(maxTokens, 8192),
        temperature: 0.8,
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
      throw new Error(`Empty response from ${model}`);
    } catch (e1) {
      console.warn(`OpenRouter call failed for ${model}:`, (e1 as Error).message);
    }
  }

  // Try Groq
  try {
    const response = await makeGroqRequest({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: Math.min(maxTokens, 8000),
      temperature: 0.8,
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) return content;
    throw new Error("Empty response from Groq");
  } catch (e2) {
    console.warn("Groq call failed:", (e2 as Error).message);
  }

  // Try Pollinations OpenAI endpoint
  try {
    const response = await makePollinationsRequest(messages, false);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) return content;
    throw new Error("Empty response from Pollinations");
  } catch (e3) {
    console.warn("Pollinations call failed:", (e3 as Error).message);
  }

  // Try HuggingFace
  try {
    const response = await makeHuggingFaceRequest(messages, false);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) return content;
    throw new Error("Empty response from HuggingFace");
  } catch (e4) {
    console.warn("HuggingFace call failed:", (e4 as Error).message);
  }

  // Last resort: Pollinations simple GET
  try {
    const text = await makePollinationsSimpleRequest(systemPrompt, userPrompt);
    if (text.trim()) return text;
    throw new Error("Empty response from Pollinations Simple");
  } catch (e4) {
    console.error("All providers failed:", (e4 as Error).message);
    throw new Error(
      "Todos os provedores de IA falharam. Verifique sua conexão ou tente novamente mais tarde."
    );
  }
}

// --- Helpers ---

function createSSEStream(response: Response): ReadableStream<Uint8Array> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Process any remaining buffer content before closing
            if (buffer.trim()) {
              const trimmed = buffer.trim();
              if (trimmed.startsWith("data: ")) {
                const data = trimmed.slice(6);
                if (data !== "[DONE]") {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(encoder.encode(content));
                    }
                  } catch {
                    // skip
                  }
                }
              }
            }
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process only complete lines (split by \n, keep last incomplete part in buffer)
          const parts = buffer.split("\n");
          buffer = parts.pop() || ""; // keep incomplete last line in buffer

          for (const line of parts) {
            const trimmed = line.trim();

            // Empty lines: send a space to keep connection alive on Vercel
            if (trimmed === "") {
              controller.enqueue(encoder.encode(" "));
              continue;
            }

            // SSE comments (e.g. ": OPENROUTER PROCESSING"): send a space keep-alive
            if (trimmed.startsWith(":")) {
              controller.enqueue(encoder.encode(" "));
              continue;
            }

            // Handle SSE data lines
            if (trimmed.startsWith("data: ")) {
              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                } else {
                  // Empty content chunk: send keep-alive
                  controller.enqueue(encoder.encode(" "));
                }
                // Check for finish_reason to detect model stopping
                const finishReason = parsed.choices?.[0]?.finish_reason;
                if (finishReason && finishReason !== "stop") {
                  console.warn("Stream finished with reason:", finishReason);
                }
              } catch {
                // Malformed JSON: send keep-alive to maintain connection
                controller.enqueue(encoder.encode(" "));
              }
              continue;
            }

            // Non-SSE plain text (Pollinations fallback) — emit directly
            // but filter out anything that looks like OpenRouter metadata
            if (
              !trimmed.includes("OPENROUTER") &&
              !trimmed.includes("PROCESSING") &&
              !trimmed.startsWith("event:")
            ) {
              controller.enqueue(encoder.encode(trimmed + "\n"));
            } else {
              // OpenRouter metadata: send keep-alive
              controller.enqueue(encoder.encode(" "));
            }
          }
        }
      } catch (err) {
        console.error("SSE stream error:", err);
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}
