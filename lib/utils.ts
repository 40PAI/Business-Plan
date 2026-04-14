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
  try {
    const parsed = JSON.parse(s);
    if (
      parsed &&
      typeof parsed === "object" &&
      "cover" in parsed &&
      Array.isArray((parsed as BusinessPlanData).sections)
    ) {
      return parsed as BusinessPlanData;
    }
  } catch { /* not valid JSON */ }
  return null;
}
