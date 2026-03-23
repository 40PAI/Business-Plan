import { callOpenRouter } from "./openrouter";

export async function generateLogoUrls(
  businessName: string,
  businessArea: string,
  logoStyle: string,
  logoType: string
): Promise<string[]> {
  const style = logoStyle || "Modern and minimalist";
  const type = logoType || "Mascote";

  let finalPrompt = "";
  try {
    const systemPrompt =
      "You are an expert logo designer. Create a SHORT image generation prompt (max 100 words) in English for a logo. Output ONLY the prompt, no explanations.";

    const userPromptText = `Logo for "${businessName}" (${businessArea}). Style: ${style}. Type: ${type}. Clean vector, white background, no text.`;

    finalPrompt = await callOpenRouter(systemPrompt, userPromptText);
    finalPrompt = finalPrompt.replace(/^"/, "").replace(/"$/, "").trim();
    // Truncate if LLM ignored the length instruction
    if (finalPrompt.length > 500) {
      finalPrompt = finalPrompt.slice(0, 500);
    }
  } catch (error) {
    console.error("Failed to generate prompt from LLM:", error);
    finalPrompt = `Professional ${type} logo for ${businessName}, ${businessArea}. ${style} style, clean vector, minimal, high contrast, centered, white background, no text`;
  }

  const encoded = encodeURIComponent(finalPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  const nameParam = encodeURIComponent(businessName);
  return [`/api/proxy/logo?prompt=${encoded}&seed=${seed}&name=${nameParam}`];
}
