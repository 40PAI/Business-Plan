export type StepType =
  | "single-select"
  | "multi-select"
  | "text-input"
  | "numeric-fields"
  | "dual-select"
  | "contact-input"
  | "logo-type-select";

export interface SelectOption {
  label: string;
  icon?: string;
  conditionalFields?: { label: string; placeholder: string }[];
}

export interface NumericField {
  key: string;
  label: string;
  placeholder: string;
}

export interface DualSelectGroup {
  title: string;
  description: string;
  options: SelectOption[];
}

export interface Step {
  id: number;
  block: string;
  blockIndex: number;
  title: string;
  description: string;
  type: StepType;
  options?: SelectOption[];
  maxSelect?: number;
  numericFields?: NumericField[];
  subSelect?: {
    label: string;
    options: SelectOption[];
    maxSelect: number;
  };
  dualGroups?: DualSelectGroup[];
  hasAiGenerate?: boolean;
  placeholder?: string;
  /**
   * If set, this step only appears when the sector chosen in step 1
   * starts with one of these strings (case-insensitive prefix match).
   * Steps without this field are always shown.
   */
  sectorCondition?: string[];
}

export type StepAnswer =
  | string
  | string[]
  | {
      selected: string | string[];
      conditionalValues?: Record<string, string>;
    }
  | {
      numericValues: Record<string, string>;
      currency: string;
      channels: string[];
    }
  | {
      dualA: string;
      dualB: string;
    }
  | {
      textValue: string;
      aiGenerated?: string[];
      selectedName?: string;
    }
  | {
      countryCode: string;
      whatsapp: string;
      email: string;
    };

export interface ArtifactState {
  status: "pending" | "generating" | "done" | "error";
  content?: string;
  urls?: string[];
  error?: string;
}

export interface ProjectContact {
  countryCode: string;
  whatsapp: string;
  email: string;
}

export interface Project {
  id: string;
  createdAt: string;
  businessName: string;
  businessArea: string;
  businessPhase: string;
  businessGoal: string;
  contact?: ProjectContact;
  answers: Record<number, StepAnswer>;
  artifacts: {
    plan: ArtifactState;
    logo: ArtifactState;
    pitch: ArtifactState;
  };
  webhookSent?: boolean;
}
