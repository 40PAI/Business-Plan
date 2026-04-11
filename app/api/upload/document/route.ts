export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { uploadDocument } from "@/lib/storage-upload";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    if (!projectId || !file) {
      return Response.json({ error: "projectId e ficheiro são necessários" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const publicUrl = await uploadDocument(projectId, file.name, buffer, file.type);

    return Response.json({ publicUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Document upload error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
