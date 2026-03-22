// ============================================
// PlanAI — Form Engine (State & Navigation)
// ============================================

const TOTAL_STEPS = 13;

const CATEGORIES = {
  1: 'Negócio',
  2: 'Negócio',
  3: 'Mercado',
  4: 'Mercado',
  5: 'Modelo',
  6: 'Modelo',
  7: 'Marca',
  8: 'Marca',
  9: 'Marca',
  10: 'Contexto',
  11: 'Contexto',
  12: 'Contexto',
  13: 'Contexto',
};

const STORAGE_KEY = 'planai_form_v1';

// Load persisted state from localStorage
function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildInitialState() {
  const saved = loadPersistedState();
  if (saved) {
    return {
      currentStep: saved.currentStep || 1,
      answers: saved.answers || {},
      subAnswers: saved.subAnswers || {},
      nameSuggestions: saved.nameSuggestions || [],
    };
  }
  return { currentStep: 1, answers: {}, subAnswers: {}, nameSuggestions: [] };
}

// Central form state
const formState = buildInitialState();

export function getState() {
  return formState;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep: formState.currentStep,
      answers: formState.answers,
      subAnswers: formState.subAnswers,
      nameSuggestions: formState.nameSuggestions,
    }));
  } catch { /* storage full or disabled */ }
}

export function clearPersistedState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasSavedProgress() {
  const saved = loadPersistedState();
  if (!saved) return false;
  return saved.currentStep > 1 || Object.keys(saved.answers || {}).length > 0;
}

export function setAnswer(step, value) {
  formState.answers[step] = value;
  persist();
}

export function getAnswer(step) {
  return formState.answers[step];
}

export function setSubAnswer(key, value) {
  formState.subAnswers[key] = value;
  persist();
}

export function getSubAnswer(key) {
  return formState.subAnswers[key] || '';
}

export function setNameSuggestions(names) {
  formState.nameSuggestions = names;
  persist();
}

export function getNameSuggestions() {
  return formState.nameSuggestions;
}

export function getCurrentStep() {
  return formState.currentStep;
}

export function setCurrentStep(step) {
  formState.currentStep = Math.max(1, Math.min(TOTAL_STEPS, step));
  persist();
}

export function getTotalSteps() {
  return TOTAL_STEPS;
}

export function getCategory(step) {
  return CATEGORIES[step] || '';
}

export function getProgress() {
  return (formState.currentStep / TOTAL_STEPS) * 100;
}

export function canProceed(step) {
  const answer = formState.answers[step];
  if (!answer) return false;
  if (Array.isArray(answer)) {
    // Exclude __OUTRO__ sentinel — need at least one real selection or typed value
    const real = answer.filter(a => a !== '__OUTRO__');
    return real.length > 0;
  }
  if (typeof answer === 'string') return answer.trim().length > 0 && answer !== '__OUTRO__';
  return true;
}

// Collect all data for AI prompt
export function collectFormData() {
  const data = {};

  const labels = {
    1: 'Área de negócio',
    2: 'Fase do negócio',
    3: 'Problema que resolve',
    4: 'Cliente principal',
    5: 'Modelo de receita',
    6: 'Diferenciais competitivos',
    7: 'Nome do negócio',
    8: 'Estilo de logo',
    9: 'Tipo de logo',
    10: 'Localização / mercado geográfico',
    11: 'Equipa actual',
    12: 'Investimento disponível',
    13: 'Objectivo principal',
  };

  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const answer = formState.answers[i];
    if (answer) {
      if (Array.isArray(answer)) {
        // Strip __OUTRO__ sentinel before sending to AI
        const clean = answer.filter(a => a !== '__OUTRO__');
        if (clean.length > 0) data[labels[i]] = clean.join(', ');
      } else if (typeof answer === 'string' && answer !== '__OUTRO__') {
        data[labels[i]] = answer;
      }
    }
  }

  // Add sub-answers
  if (Object.keys(formState.subAnswers).length > 0) {
    data['Detalhes adicionais'] = {};
    for (const [key, val] of Object.entries(formState.subAnswers)) {
      if (val && val.trim()) {
        data['Detalhes adicionais'][key] = val;
      }
    }
  }

  return data;
}

// API Key management
export function getApiKey() {
  return localStorage.getItem('planai_api_key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('planai_api_key', key);
}

export function hasApiKey() {
  return !!getApiKey();
}

// Pollinations API Key management (for logo image generation)
export function getPollinationsKey() {
  return localStorage.getItem('planai_pollinations_key') || '';
}

export function setPollinationsKey(key) {
  localStorage.setItem('planai_pollinations_key', key);
}

export function hasPollinationsKey() {
  return !!getPollinationsKey();
}
