import { NextRequest } from "next/server";
import { generateLogoUrls } from "@/lib/pollinations";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessArea, logoStyle, logoType } = await req.json();

    const urls = await generateLogoUrls(
      businessName || "Brand",
      businessArea || "Business",
      logoStyle || "Modern and minimalist",
      logoType || "Combined logo"
    );

    return Response.json({ urls });
  } catch (error) {
    console.error("Logo generation error:", error);
    return Response.json(
      { error: "Erro ao gerar o logo. Tente novamente." },
      { status: 500 }
    );
  }
}
