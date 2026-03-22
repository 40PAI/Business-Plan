import { callOpenRouter } from "./openrouter";

export async function generateLogoUrls(
  businessName: string,
  businessArea: string,
  logoStyle: string,
  logoType: string
): Promise<string[]> {
  const style = logoStyle || "Modern and minimalist";
  const type = logoType || "Mascote";

  const systemPrompt = "You are an expert logo designer and prompt engineer. Your task is to create a SINGLE, highly detailed image generation prompt in English for a logo, based on the user's requirements. Do not include any conversational text or explanations. Just output the prompt.";
  
  const userPromptText = `Create an image generation prompt for a logo.
Business Name: ${businessName}
Business Area: ${businessArea}
Logo Style: ${style}
Logo Type: ${type}

The prompt should describe a clean vector design, high contrast, solid background, and professional branding without text artifacts.`;

  let finalPrompt = "";
  try {
    finalPrompt = await callOpenRouter(systemPrompt, userPromptText);
    finalPrompt = finalPrompt.replace(/^"/, "").replace(/"$/, "").trim();
  } catch (error) {
    console.error("Failed to generate prompt from LLM:", error);
    finalPrompt = `Professional ${type} logo design for "${businessName}", a ${businessArea} company. Style: ${style}. Clean vector design, minimal, high contrast, centered composition, solid background, no text artifacts, professional branding`;
  }

  const variations = [
    `${finalPrompt}, white background, sharp edges`,
    `${finalPrompt}, dark background, elegant`,
    `${finalPrompt}, gradient background, modern`,
    `${finalPrompt}, monochrome, sophisticated`,
  ];

  return variations.map((prompt, i) => {
    const encoded = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000) + i;
    return `/api/proxy/logo?prompt=${encoded}&seed=${seed}`;
  });
}
