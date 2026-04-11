// --- Block types ---

export interface TextBlock {
  type: "text";
  content: string;
}

export interface BulletsBlock {
  type: "bullets";
  items: string[];
}

export interface NumberedBlock {
  type: "numbered";
  items: string[];
}

export interface TableBlock {
  type: "table";
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface SWOTBlock {
  type: "swot";
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface OrgNode {
  title: string;
  subtitle?: string;
  children?: OrgNode[];
}

export interface OrgBlock {
  type: "organogram";
  root: OrgNode;
}

export interface MetricItem {
  label: string;
  value: string;
  unit?: string;
  desc?: string;
}

export interface MetricsBlock {
  type: "metrics";
  items: MetricItem[];
}

export interface HighlightBlock {
  type: "highlight";
  label: string;
  value: string;
  sublabel?: string;
  color?: "blue" | "green" | "amber" | "red" | "slate";
}

export interface TimelinePhase {
  period: string;
  title: string;
  tasks: string[];
}

export interface TimelineBlock {
  type: "timeline";
  phases: TimelinePhase[];
}

export type PlanBlock =
  | TextBlock
  | BulletsBlock
  | NumberedBlock
  | TableBlock
  | SWOTBlock
  | OrgBlock
  | MetricsBlock
  | HighlightBlock
  | TimelineBlock;

// --- Structure ---

export interface PlanSubsection {
  title: string;
  blocks: PlanBlock[];
}

export interface PlanSection {
  id: string;
  number: string;
  title: string;
  blocks?: PlanBlock[];
  subsections?: PlanSubsection[];
}

export interface PlanCover {
  businessName: string;
  tagline: string;
  sector: string;
  province: string;
  country: string;
  date: string;
  version: string;
  contact?: string;
  legalForm?: string;
  confidential?: string;
}

export interface BusinessPlanData {
  cover: PlanCover;
  sections: PlanSection[];
}

// --- Type guards ---

export function isBusinessPlanData(obj: unknown): obj is BusinessPlanData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "cover" in obj &&
    "sections" in obj &&
    Array.isArray((obj as BusinessPlanData).sections)
  );
}
