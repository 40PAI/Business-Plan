import type { Project, ArtifactState } from "./types";

const STORAGE_KEY = "planai_projects";
const MAX_PROJECTS = 10;

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
    if (projects.length > MAX_PROJECTS) {
      projects.pop();
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function updateArtifact(
  projectId: string,
  artifact: "plan" | "logo" | "pitch",
  state: Partial<ArtifactState>
): Project | null {
  const project = getProject(projectId);
  if (!project) return null;

  project.artifacts[artifact] = {
    ...project.artifacts[artifact],
    ...state,
  };

  saveProject(project);
  return project;
}

export function getProjectStats() {
  const projects = getProjects();
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
    if (typeof ans === 'string') {
      record[ans] = (record[ans] || 0) + 1;
    } else if (Array.isArray(ans)) {
      ans.forEach(a => { if (typeof a === 'string') record[a] = (record[a] || 0) + 1; });
    } else if (typeof ans === 'object' && ans.selected) {
      if (typeof ans.selected === 'string') {
        record[ans.selected] = (record[ans.selected] || 0) + 1;
      } else if (Array.isArray(ans.selected)) {
        ans.selected.forEach((a: string) => { record[a] = (record[a] || 0) + 1; });
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

    // Answer 1: Sector
    processExtract(p.answers[1], sectors);
    // Answer 2: Region (Location / Província)
    processExtract(p.answers[2], regions);
    // Answer 4: Clients (Target audience)
    processExtract(p.answers[4], clients);
    // Answer 6: Sales Channels / Revenue model
    processExtract(p.answers[6], channels);
  }

  const getTop = (record: Record<string, number>, limit: number = 5) => {
    return Object.entries(record)
      .sort((a, b) => b[1] - a[1]) // sort descending
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
    topChannels: getTop(channels)
  };
}
