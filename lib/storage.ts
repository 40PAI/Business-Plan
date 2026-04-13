import { supabase } from "./supabase";
import type { Project, ArtifactState } from "./types";

function mapFromDB(row: any): Project {
  const artifacts = row.artifacts ?? { plan: { status: "pending" }, logo: { status: "pending" }, pitch: { status: "pending" } };

  // Restore dedicated URL columns into artifact state (source of truth for display)
  if (row.logo_url && !artifacts.logo?.urls?.includes(row.logo_url)) {
    artifacts.logo = { ...artifacts.logo, urls: [row.logo_url, ...(artifacts.logo?.urls ?? [])].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i) };
  }
  if (row.plan_doc_url) {
    artifacts.plan = { ...artifacts.plan, fileUrl: row.plan_doc_url };
  }
  if (row.plan_html_url) {
    artifacts.plan = { ...artifacts.plan, htmlUrl: row.plan_html_url };
  }
  if (row.pitch_url) {
    artifacts.pitch = { ...artifacts.pitch, fileUrl: row.pitch_url };
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    businessName: row.business_name,
    businessArea: row.business_area,
    businessPhase: row.business_phase,
    businessGoal: row.business_goal,
    contact: row.contact,
    answers: row.answers,
    artifacts,
    webhookSent: row.webhook_sent,
  };
}

function mapToDB(p: Project) {
  return {
    id: p.id,
    business_name: p.businessName,
    business_area: p.businessArea,
    business_phase: p.businessPhase,
    business_goal: p.businessGoal,
    contact: p.contact,
    answers: p.answers,
    artifacts: p.artifacts,
    webhook_sent: p.webhookSent,
    created_at: p.createdAt,
    // Dedicated URL columns — visible as plain columns in the Supabase table
    logo_url: p.artifacts.logo.urls?.[0] ?? null,
    plan_doc_url: p.artifacts.plan.fileUrl ?? null,
    plan_html_url: p.artifacts.plan.htmlUrl ?? null,
    pitch_url: p.artifacts.pitch.fileUrl ?? null,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data.map(mapFromDB);
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }

  return mapFromDB(data);
}

export async function saveProject(project: Project): Promise<void> {
  const dbData = mapToDB(project);
  const { error } = await supabase.from("projects").upsert(dbData);

  if (error) {
    console.error("Error saving project:", error.message, error.details, error.hint, error.code);
    throw new Error(`saveProject failed: ${error.message} (code: ${error.code})`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Error deleting project:", error.message, error.code);
    throw error;
  }
}

export async function updateArtifact(
  projectId: string,
  artifact: "plan" | "logo" | "pitch",
  state: Partial<ArtifactState>
): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  project.artifacts[artifact] = {
    ...project.artifacts[artifact],
    ...state,
  };

  await saveProject(project);
  return project;
}

export async function getProjectStats() {
  const projects = await getProjects();
  const totalProjects = projects.length;
  const lastGenerated = projects[0]?.createdAt || null;

  let totalArtifacts = 0;
  let today = 0;
  let thisWeek = 0;
  let thisMonth = 0;
  let thisYear = 0;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - (now.getDay() === 0 ? 6 : now.getDay() - 1) * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  const regions: Record<string, number> = {};
  const sectors: Record<string, number> = {};
  const clients: Record<string, number> = {};
  const channels: Record<string, number> = {};

  const processExtract = (ans: any, record: Record<string, number>) => {
    if (!ans) return;
    if (typeof ans === "string") {
      record[ans] = (record[ans] || 0) + 1;
    } else if (Array.isArray(ans)) {
      ans.forEach((a) => {
        if (typeof a === "string") record[a] = (record[a] || 0) + 1;
      });
    } else if (typeof ans === "object" && ans.selected) {
      if (typeof ans.selected === "string") {
        record[ans.selected] = (record[ans.selected] || 0) + 1;
      } else if (Array.isArray(ans.selected)) {
        ans.selected.forEach((a: string) => {
          record[a] = (record[a] || 0) + 1;
        });
      }
    }
  };

  for (const p of projects) {
    if (p.artifacts.plan.status === "done") totalArtifacts++;
    if (p.artifacts.logo.status === "done") totalArtifacts++;
    if (p.artifacts.pitch.status === "done") totalArtifacts++;

    const t = new Date(p.createdAt).getTime();
    if (t >= startOfDay) today++;
    if (t >= startOfWeek) thisWeek++;
    if (t >= startOfMonth) thisMonth++;
    if (t >= startOfYear) thisYear++;

    processExtract(p.answers[1], sectors);
    processExtract(p.answers[2], regions);
    processExtract(p.answers[4], clients);
    processExtract(p.answers[6], channels);
  }

  const getTop = (record: Record<string, number>, limit: number = 5) => {
    return Object.entries(record)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  };

  return {
    totalProjects,
    lastGenerated,
    totalArtifacts,
    temporal: { today, thisWeek, thisMonth, thisYear },
    topRegions: getTop(regions),
    topSectors: getTop(sectors),
    topClients: getTop(clients),
    topChannels: getTop(channels),
  };
}
