import { supabase } from "./supabase";
import { nanoid } from "nanoid";

/**
 * Uploads a logo buffer to Supabase Storage and returns the public URL.
 * @param projectId The ID of the project
 * @param buffer The image data (Buffer or ArrayBuffer)
 * @param contentType The MIME type (image/png, etc.)
 */
export async function uploadLogo(
  projectId: string,
  buffer: Buffer | ArrayBuffer,
  contentType: string = "image/png"
): Promise<string> {
  const fileExt = contentType.split("/")[1] || "png";
  // Keep history by adding a timestamp or random string
  const fileName = `${nanoid(8)}.${fileExt}`;
  const filePath = `${projectId}/${fileName}`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(filePath, buffer, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("logos")
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Uploads a document to Supabase Storage and returns the public URL.
 */
export async function uploadDocument(
  projectId: string,
  fileName: string,
  buffer: Buffer | ArrayBuffer,
  contentType: string = "application/pdf"
): Promise<string> {
  const filePath = `${projectId}/${fileName}`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(filePath, buffer, {
      contentType,
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Document upload error:", error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  return publicUrl;
}
