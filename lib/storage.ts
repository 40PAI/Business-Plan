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
  for (const p of projects) {
    if (p.artifacts.plan.status === "done") totalArtifacts++;
    if (p.artifacts.logo.status === "done") totalArtifacts++;
    if (p.artifacts.pitch.status === "done") totalArtifacts++;
  }

  return { totalProjects, lastGenerated, totalArtifacts };
}
