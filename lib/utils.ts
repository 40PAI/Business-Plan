import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BusinessPlanData } from "./plan-schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tries every known escape hatch to extract a BusinessPlanData object from a
 * raw string that may be:
 *   - Pure JSON
 *   - JSON wrapped in ```json ... ``` fences
 *   - JSON prefixed with __MARKDOWN__\n (stored that way if parse failed at save time)
 *   - JSON preceded by explanatory prose from the model
 *
 * Returns null if the string cannot be parsed or doesn't match the expected shape.
 */
/**
 * Repairs JSON that contains literal newline / carriage-return characters inside
 * string values — a common mistake made by LLM output.  A raw \n inside a JSON
 * string is invalid and causes JSON.parse to throw; we convert it to \\n so the
 * string is preserved verbatim after parsing.
 */
function repairJSON(s: string): string {
  let inString = false;
  let escaped = false;
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escaped) {
      escaped = false;
      out += ch;
    } else if (ch === "\\") {
      escaped = true;
      out += ch;
    } else if (ch === '"') {
      inString = !inString;
      out += ch;
    } else if (inString && ch === "\n") {
      out += "\\n";
    } else if (inString && ch === "\r") {
      out += "\\r";
    } else {
      out += ch;
    }
  }
  return out;
}

export function parseBusinessPlan(raw: string): BusinessPlanData | null {
  if (!raw) return null;
  let s = raw.trim();
  // Strip __MARKDOWN__ prefix that the save flow may have added
  if (s.startsWith("__MARKDOWN__\n")) s = s.slice("__MARKDOWN__\n".length).trim();
  // Strip markdown code fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  // If there's prose before the JSON object, skip it
  if (!s.startsWith("{")) {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) s = m[0];
  }
  // First attempt: parse as-is
  // Second attempt: repair literal newlines inside strings (LLM often emits these)
  for (const candidate of [s, repairJSON(s)]) {
    try {
      const parsed = JSON.parse(candidate);
      if (
        parsed &&
        typeof parsed === "object" &&
        "cover" in parsed &&
        Array.isArray((parsed as BusinessPlanData).sections)
      ) {
        return parsed as BusinessPlanData;
      }
    } catch { /* try next candidate */ }
  }
  return null;
}

/**
 * Returns a filename safe for Supabase Storage (no accented characters, no special chars).
 * "Kambanza Câmbios" → "Kambanza_Cambios"
 */
export function sanitizeStorageKey(name: string): string {
  return name
    .normalize("NFD")                   // decompose é → e + combining accent
    .replace(/[\u0300-\u036f]/g, "")    // strip combining marks
    .replace(/[^\w\s.-]/g, "")          // keep word chars, spaces, dots, dashes
    .trim()
    .replace(/\s+/g, "_");              // spaces → underscores
}
