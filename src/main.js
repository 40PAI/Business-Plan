// ============================================
// PlanAI — Main Application
// ============================================

import './style.css';
import {
  getCurrentStep, setCurrentStep, getTotalSteps, getCategory,
  getProgress, canProceed, setApiKey, getApiKey, hasApiKey,
  collectFormData, setAnswer, getNameSuggestions,
  clearPersistedState, hasSavedProgress,
} from './formEngine.js';
import { generateBusinessPlan, generateLogoBriefing, generatePitchDeck, generateLogoImage } from './ai.js';
import { icon } from './icons.js';

// Import steps
import * as step1  from './steps/step1-area.js';
import * as step2  from './steps/step2-phase.js';
import * as step3  from './steps/step3-problem.js';
import * as step4  from './steps/step4-customer.js';
import * as step5  from './steps/step5-revenue.js';
import * as step6  from './steps/step6-differentiators.js';
import * as step7  from './steps/step7-name.js';
import * as step8  from './steps/step8-logostyle.js';
import * as step9  from './steps/step9-logoelements.js';
import * as step10 from './steps/step10-location.js';
import * as step11 from './steps/step11-team.js';
import * as step12 from './steps/step12-investment.js';
import * as step13 from './steps/step13-goals.js';

const steps = {
  1: step1, 2: step2, 3: step3, 4: step4, 5: step5, 6: step6,
  7: step7, 8: step8, 9: step9, 10: step10, 11: step11, 12: step12, 13: step13,
};

const app = document.getElementById('app');
let currentView = 'landing'; // eslint-disable-line -- used for logical state tracking

// Generated outputs
let outputs = {
  businessPlan: '',
  logoBriefing: '',
  logoImage: '',
  pitchDeck: [],
  names: [],
};

// Active result tab
let activeTab = 'plan';

// ====== ICON REFRESH ======
// Must be called after every innerHTML update so Lucide renders SVGs
function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// ====== ACCESSIBILITY ======
// Make option pills keyboard-navigable after any render
function patchPillAccessibility() {
  document.querySelectorAll('.option-pill').forEach(pill => {
    if (!pill.hasAttribute('tabindex')) {
      pill.setAttribute('tabindex', '0');
      pill.setAttribute('role', 'button');
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pill.click();
        }
      });
    }
  });
}

// ====== LANDING ======

function renderLanding() {
  app.innerHTML = `
    <div class="landing-screen">

      <!-- Top navigation bar -->
      <header class="app-header">
        <div class="app-header-brand">
          <div class="brand-icon">${icon('zap', 18)}</div>
          <span class="brand-name">PlanAI</span>
        </div>
        <div class="app-header-actions">
          ${!hasApiKey() ? `
            <button class="btn btn-ghost btn-sm api-link-btn" id="header-api-btn">
              ${icon('key', 14)} API Key
            </button>
          ` : `
            <button class="btn btn-ghost btn-sm api-link-btn" id="header-api-btn" title="Configurar API Key">
              ${icon('key', 14)} Configurada
            </button>
          `}
        </div>
      </header>

      <!-- Hero section -->
      <div class="hero-section">
        <div class="hero-badge">
          ${icon('sparkles', 13)} Powered by AI — Contexto Angola / Luanda
        </div>

        <h1 class="landing-title">
          O seu Business Plan,<br>gerado em minutos.
        </h1>

        <p class="landing-subtitle">
          Responda a 13 perguntas e a nossa IA gera um plano de negócio
          completo de 14 secções, pronto para apresentar a investidores.
        </p>

        ${hasSavedProgress() ? `
          <div class="persist-banner" id="resume-btn">
            ${icon('rotate-ccw', 13)} Tem um formulário por concluir — continuar donde parou?
          </div>
        ` : ''}

        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
          <button class="btn btn-primary btn-lg" id="start-btn">
            ${hasSavedProgress() ? `Começar de novo ${icon('plus', 16)}` : `Começar agora ${icon('arrow-right', 16)}`}
          </button>
          ${hasSavedProgress() ? `
            <button class="btn btn-secondary btn-lg" id="continue-btn">
              ${icon('play', 16)} Continuar
            </button>
          ` : ''}
        </div>
      </div>

      <!-- How it works -->
      <div class="how-it-works">
        <p class="how-it-works-title">Como funciona</p>
        <div class="how-steps">
          <div class="how-step">
            <div class="how-step-number">1</div>
            <div class="how-step-icon">${icon('file-pen', 24)}</div>
            <span class="how-step-label">Responda a 13 perguntas</span>
            <span class="how-step-desc">Simples e rápidas — menos de 5 minutos</span>
          </div>
          <div class="how-step-arrow">${icon('arrow-right', 16)}</div>
          <div class="how-step">
            <div class="how-step-number">2</div>
            <div class="how-step-icon">${icon('bot', 24)}</div>
            <span class="how-step-label">A IA gera tudo</span>
            <span class="how-step-desc">Plano, nomes, logo e pitch deck em paralelo</span>
          </div>
          <div class="how-step-arrow">${icon('arrow-right', 16)}</div>
          <div class="how-step">
            <div class="how-step-number">3</div>
            <div class="how-step-icon">${icon('download', 24)}</div>
            <span class="how-step-label">Descarregue o PDF</span>
            <span class="how-step-desc">Pronto para investidores ou bancos</span>
          </div>
        </div>
      </div>

      <!-- Feature cards -->
      <div class="landing-features">
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${icon('file-text', 20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Plano de Negócio</span>
            <span class="landing-feature-desc">14 secções completas</span>
          </div>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${icon('tag', 20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Sugestões de Nome</span>
            <span class="landing-feature-desc">10 opções com IA</span>
          </div>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${icon('palette', 20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Briefing de Logo</span>
            <span class="landing-feature-desc">+ Imagem gerada por IA</span>
          </div>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${icon('layout-template', 20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Pitch Deck</span>
            <span class="landing-feature-desc">8 slides estruturados</span>
          </div>
        </div>
      </div>

    </div>
  `;

  refreshIcons();

  document.getElementById('start-btn').addEventListener('click', () => {
    if (hasSavedProgress()) {
      // Reset and start fresh
      clearPersistedState();
      for (let i = 1; i <= 13; i++) setAnswer(i, undefined);
      setCurrentStep(1);
    }
    if (!hasApiKey()) {
      showApiModal(() => { currentView = 'form'; renderForm(); });
    } else {
      currentView = 'form';
      renderForm();
    }
  });

  document.getElementById('continue-btn')?.addEventListener('click', () => {
    if (!hasApiKey()) {
      showApiModal(() => { currentView = 'form'; renderForm(); });
    } else {
      currentView = 'form';
      renderForm();
    }
  });

  document.getElementById('resume-btn')?.addEventListener('click', () => {
    if (!hasApiKey()) {
      showApiModal(() => { currentView = 'form'; renderForm(); });
    } else {
      currentView = 'form';
      renderForm();
    }
  });

  document.getElementById('header-api-btn')?.addEventListener('click', () => showApiModal());
}

// ====== FORM ======

const CATEGORY_STEPS = {
  'Negócio':  [1, 2],
  'Mercado':  [3, 4],
  'Modelo':   [5, 6],
  'Marca':    [7, 8, 9],
  'Contexto': [10, 11, 12, 13],
};

const ALL_CATEGORIES = Object.keys(CATEGORY_STEPS);

function getCategoryIndex(step) {
  return ALL_CATEGORIES.findIndex(cat => CATEGORY_STEPS[cat].includes(step));
}

function renderForm() {
  const step = getCurrentStep();
  const total = getTotalSteps();
  const category = getCategory(step);
  const progress = getProgress();
  const stepModule = steps[step];
  const catIdx = getCategoryIndex(step);

  app.innerHTML = `
    <div class="form-shell" id="form-shell">

      <!-- App header -->
      <header class="app-header app-header--form">
        <div class="app-header-brand">
          <div class="brand-icon">${icon('zap', 16)}</div>
          <span class="brand-name">PlanAI</span>
        </div>
        <button class="settings-btn" id="settings-btn" title="Definições">
          ${icon('settings', 16)}
        </button>
      </header>

      <!-- Category breadcrumb -->
      <div class="category-breadcrumb">
        ${ALL_CATEGORIES.map((cat, i) => `
          <div class="cat-crumb ${i === catIdx ? 'active' : ''} ${i < catIdx ? 'done' : ''}">
            ${i < catIdx ? icon('check', 11) : ''}
            <span>${cat}</span>
          </div>
        `).join('<div class="cat-crumb-sep"></div>')}
      </div>

      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-header">
          <span class="progress-category">${category}</span>
          <span class="progress-count">Passo ${step} de ${total}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>

      <!-- Step content -->
      <div class="step-container">
        <div class="step-content-wrapper" id="step-content-wrapper">
          ${stepModule.render()}
        </div>

        <div class="nav-bar">
          <button class="btn btn-ghost nav-back" id="back-btn" ${step === 1 ? 'style="visibility:hidden"' : ''}>
            ${icon('arrow-left', 16)} Voltar
          </button>
          ${step < total ? `
            <button class="btn btn-primary" id="next-btn" ${!canProceed(step) ? 'disabled' : ''}>
              Continuar ${icon('arrow-right', 16)}
            </button>
          ` : `
            <button class="btn btn-primary btn-generate" id="submit-btn" ${!canProceed(step) ? 'disabled' : ''}>
              ${icon('wand-2', 16)} Gerar Business Plan
            </button>
          `}
        </div>
      </div>
    </div>
  `;

  refreshIcons();
  stepModule.bind(updateNavState);
  patchPillAccessibility();

  const formShell = document.getElementById('form-shell');
  formShell.addEventListener('click', (e) => {
    const backBtn   = e.target.closest('#back-btn');
    const nextBtn   = e.target.closest('#next-btn');
    const submitBtn = e.target.closest('#submit-btn');

    if (backBtn) {
      if (step === 1) { currentView = 'landing'; renderLanding(); }
      else { setCurrentStep(step - 1); renderForm(); }
    }

    if (nextBtn && !nextBtn.disabled && canProceed(step)) {
      setCurrentStep(step + 1);
      renderForm();
    }

    if (submitBtn && !submitBtn.disabled && canProceed(step)) {
      handleSubmit();
    }
  });

  document.getElementById('settings-btn')?.addEventListener('click', () => showApiModal());
}

function updateNavState() {
  const step = getCurrentStep();
  const nextBtn   = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  if (nextBtn)   nextBtn.disabled   = !canProceed(step);
  if (submitBtn) submitBtn.disabled = !canProceed(step);
}

// ====== GENERATING ======

function setGenStep(idx, done = false) {
  const ids = ['gen-step-1', 'gen-step-2', 'gen-step-3', 'gen-step-4'];
  const el = document.getElementById(ids[idx]);
  if (!el) return;
  el.classList.remove('active');
  if (done) el.classList.add('done');
  const next = document.getElementById(ids[idx + 1]);
  if (next) next.classList.add('active');
}

function setGenStatus(text) {
  const el = document.getElementById('gen-status');
  if (el) el.textContent = text;
}

async function handleSubmit() {
  currentView = 'generating';
  renderGenerating();

  const formData = collectFormData();
  outputs.names = getNameSuggestions();

  setGenStatus('A criar as 14 secções do plano de negócio…');
  try {
    outputs.businessPlan = await generateBusinessPlan(formData);
  } catch (e) {
    console.error('Erro no plano:', e);
    outputs.businessPlan = `> Erro ao gerar o plano de negócio: ${e.message}\n\nVerifique a sua API key e tente novamente.`;
  }
  setGenStep(0, true);

  setGenStatus('A gerar briefing de identidade visual…');
  try {
    outputs.logoBriefing = await generateLogoBriefing(formData);
  } catch (e) {
    console.error('Erro no logo briefing:', e);
    outputs.logoBriefing = `> Erro ao gerar o briefing de logo: ${e.message}`;
  }
  setGenStep(1, true);

  setGenStatus('A gerar imagem de logo com IA…');
  try {
    outputs.logoImage = await generateLogoImage(formData, outputs.logoBriefing);
  } catch (e) {
    console.error('Erro na imagem do logo:', e);
    outputs.logoImage = '';
  }

  setGenStatus('A estruturar os slides do pitch deck…');
  try {
    outputs.pitchDeck = await generatePitchDeck(formData);
  } catch (e) {
    console.error('Erro no pitch deck:', e);
    outputs.pitchDeck = [];
  }
  setGenStep(2, true);

  setGenStatus('A compilar todos os documentos…');
  setGenStep(3, true);

  currentView = 'result';
  activeTab = 'plan';
  renderResult();
}

function renderGenerating() {
  app.innerHTML = `
    <div class="generating-screen">
      <div class="generating-orb">
        <div class="generating-orb-inner">
          ${icon('wand-2', 32)}
        </div>
      </div>
      <h2 class="generating-title">A gerar os seus documentos…</h2>
      <p class="generating-subtitle" id="gen-status">A analisar as suas respostas…</p>
      <div class="generating-steps">
        <div class="generating-step active" id="gen-step-1">
          <div class="generating-step-icon">${icon('file-text', 15)}</div>
          <span>Plano de Negócio <em>(14 secções)</em></span>
          <div class="generating-step-check">${icon('check', 12)}</div>
        </div>
        <div class="generating-step" id="gen-step-2">
          <div class="generating-step-icon">${icon('palette', 15)}</div>
          <span>Briefing de Identidade Visual</span>
          <div class="generating-step-check">${icon('check', 12)}</div>
        </div>
        <div class="generating-step" id="gen-step-3">
          <div class="generating-step-icon">${icon('layout-template', 15)}</div>
          <span>Pitch Deck <em>(8 slides)</em></span>
          <div class="generating-step-check">${icon('check', 12)}</div>
        </div>
        <div class="generating-step" id="gen-step-4">
          <div class="generating-step-icon">${icon('package', 15)}</div>
          <span>Compilação final</span>
          <div class="generating-step-check">${icon('check', 12)}</div>
        </div>
      </div>
    </div>
  `;
  refreshIcons();
}

// ====== RESULT ======

function renderResult() {
  const tabs = [
    { id: 'plan',  label: 'Plano de Negócio', iconName: 'file-text',      count: '14 secções' },
    { id: 'logo',  label: 'Logo Briefing',     iconName: 'palette',        count: 'Para designers' },
    { id: 'deck',  label: 'Pitch Deck',        iconName: 'layout-template', count: `${outputs.pitchDeck.length || 8} slides` },
  ];

  app.innerHTML = `
    <div class="result-screen">

      <!-- App header -->
      <header class="app-header app-header--result">
        <div class="app-header-brand">
          <div class="brand-icon">${icon('zap', 16)}</div>
          <span class="brand-name">PlanAI</span>
        </div>
        <button class="settings-btn" id="settings-btn" title="Definições">
          ${icon('settings', 16)}
        </button>
      </header>

      <!-- Result header -->
      <div class="result-header">
        <div class="result-badge">
          ${icon('check-circle', 13)} Gerado com sucesso
        </div>
        <h1 class="result-title">O seu Business Plan</h1>
        <p class="result-subtitle">4 documentos profissionais prontos a usar</p>
      </div>

      <!-- Tabs -->
      <div class="result-tabs" id="result-tabs">
        ${tabs.map(t => `
          <button class="result-tab ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">
            <span class="result-tab-icon">${icon(t.iconName, 16)}</span>
            <span class="result-tab-label">${t.label}</span>
            <span class="result-tab-count">${t.count}</span>
          </button>
        `).join('')}
      </div>

      <!-- Tab content -->
      <div class="result-tab-content" id="tab-content">
        ${renderTabContent(activeTab)}
      </div>

      <!-- Bottom actions -->
      <div class="result-bottom-actions">
        <button class="btn btn-primary" id="download-pdf-btn">
          ${icon('download', 14)} Descarregar PDF completo
        </button>
        <button class="btn btn-ghost" id="edit-btn">
          ${icon('pencil', 14)} Editar e regenerar
        </button>
        <button class="btn btn-ghost" id="restart-btn">
          ${icon('rotate-ccw', 14)} Recomeçar
        </button>
      </div>

    </div>
  `;

  refreshIcons();

  document.getElementById('result-tabs').addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (!tabBtn) return;
    activeTab = tabBtn.dataset.tab;
    document.querySelectorAll('.result-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
    document.getElementById('tab-content').innerHTML = renderTabContent(activeTab);
    refreshIcons();
    bindTabActions(activeTab);
  });

  bindTabActions(activeTab);

  document.getElementById('edit-btn').addEventListener('click', () => {
    currentView = 'form';
    renderForm();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    if (confirm('Tem a certeza que quer recomeçar? Todas as respostas serão perdidas.')) {
      clearPersistedState();
      for (let i = 1; i <= 13; i++) setAnswer(i, undefined);
      setCurrentStep(1);
      outputs = { businessPlan: '', logoBriefing: '', logoImage: '', pitchDeck: [], names: [] };
      currentView = 'landing';
      renderLanding();
    }
  });

  document.getElementById('download-pdf-btn')?.addEventListener('click', downloadAllPDF);

  document.getElementById('settings-btn')?.addEventListener('click', () => showApiModal());
}

function renderTabContent(tab) {
  if (tab === 'plan')  return renderPlanTab();
  if (tab === 'names') return renderNamesTab();
  if (tab === 'logo')  return renderLogoTab();
  if (tab === 'deck')  return renderDeckTab();
  return '';
}

// ── Plan tab ──────────────────────────────────────────────────────────────────
function renderPlanTab() {
  return `
    <div class="tab-actions">
      <button class="btn btn-secondary btn-sm" id="copy-plan-btn">
        ${icon('copy', 13)} Copiar texto
      </button>
      <button class="btn btn-secondary btn-sm" id="print-plan-btn">
        ${icon('printer', 13)} Imprimir / PDF
      </button>
    </div>
    <div class="result-body" id="plan-content">
      ${markdownToHtml(outputs.businessPlan)}
    </div>
  `;
}

// ── Names tab ─────────────────────────────────────────────────────────────────
function renderNamesTab() {
  const names = outputs.names;
  if (!names || names.length === 0) {
    return `
      <div class="names-empty">
        <div class="names-empty-icon">${icon('tag', 32)}</div>
        <p>Nenhuma sugestão de nome foi gerada.</p>
        <p class="names-empty-hint">Use o botão de gerar nomes no passo 7 do formulário.</p>
      </div>
    `;
  }
  return `
    <div class="names-grid">
      ${names.map((name, i) => `
        <div class="name-card" data-name="${name}">
          <span class="name-number">${String(i + 1).padStart(2, '0')}</span>
          <span class="name-text">${name}</span>
          <button class="name-copy-btn" data-name="${name}" title="Copiar nome">
            ${icon('copy', 14)}
          </button>
        </div>
      `).join('')}
    </div>
    <p class="names-hint">Clique em ${icon('copy', 12)} para copiar qualquer nome. Volte ao passo 7 para regenerar.</p>
  `;
}

// ── Logo tab ──────────────────────────────────────────────────────────────────
function renderLogoTab() {
  const imageSection = outputs.logoImage
    ? `
      <div class="logo-image-section">
        <h3 class="logo-image-title">
          ${icon('image', 16)} Pré-visualização do Logo
        </h3>
        <div class="logo-image-wrap">
          <img src="${outputs.logoImage}" alt="Logo gerado por IA" class="logo-image" />
        </div>
        <div class="logo-image-actions">
          <a href="${outputs.logoImage}" download="logo-planai.png" class="btn btn-secondary btn-sm">
            ${icon('download', 13)} Descarregar PNG
          </a>
        </div>
      </div>
    `
    : `
      <div class="logo-image-missing">
        ${icon('image-off', 16)} Imagem não gerada — verifique a sua ligação à internet e tente novamente.
      </div>
    `;

  return `
    ${imageSection}
    <div class="tab-actions">
      <button class="btn btn-secondary btn-sm" id="copy-logo-btn">
        ${icon('copy', 13)} Copiar briefing
      </button>
      <button class="btn btn-secondary btn-sm" id="print-logo-btn">
        ${icon('printer', 13)} Imprimir
      </button>
    </div>
    <div class="result-body">
      ${markdownToHtml(outputs.logoBriefing)}
    </div>
  `;
}

// ── Pitch Deck tab ────────────────────────────────────────────────────────────
function renderDeckTab() {
  const slides = outputs.pitchDeck;

  if (!slides || slides.length === 0) {
    return `<div class="names-empty"><p>Pitch deck não disponível.</p></div>`;
  }

  return `
    <div class="deck-container">
      ${slides.map((slide, i) => `
        <div class="deck-slide" data-slide="${slide.slide || i + 1}">
          <div class="deck-slide-number">Slide ${slide.slide || i + 1}</div>
          <div class="deck-slide-icon">${icon('bar-chart-2', 28)}</div>
          <h2 class="deck-slide-title">${slide.title || ''}</h2>
          ${slide.subtitle ? `<p class="deck-slide-subtitle">${slide.subtitle}</p>` : ''}
          ${slide.highlight ? `<div class="deck-slide-highlight">${slide.highlight}</div>` : ''}
          ${slide.points && slide.points.length ? `
            <ul class="deck-slide-points">
              ${slide.points.map(p => `
                <li>
                  <span class="deck-point-bullet">${icon('chevron-right', 12)}</span>
                  <span>${p}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
    <div class="tab-actions" style="margin-top: var(--space-xl);">
      <button class="btn btn-secondary btn-sm" id="print-deck-btn">
        ${icon('printer', 13)} Imprimir slides
      </button>
    </div>
  `;
}

function bindTabActions(tab) {
  refreshIcons();

  if (tab === 'plan') {
    document.getElementById('copy-plan-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(outputs.businessPlan).then(() => {
        const btn = document.getElementById('copy-plan-btn');
        if (btn) {
          btn.innerHTML = `${icon('check', 13)} Copiado!`;
          refreshIcons();
          setTimeout(() => {
            btn.innerHTML = `${icon('copy', 13)} Copiar texto`;
            refreshIcons();
          }, 2000);
        }
      });
    });
    document.getElementById('print-plan-btn')?.addEventListener('click', () => window.print());
  }

  if (tab === 'names') {
    document.querySelectorAll('.name-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.name).then(() => {
          btn.innerHTML = icon('check', 14);
          refreshIcons();
          setTimeout(() => { btn.innerHTML = icon('copy', 14); refreshIcons(); }, 1500);
        });
      });
    });
  }

  if (tab === 'logo') {
    document.getElementById('copy-logo-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(outputs.logoBriefing).then(() => {
        const btn = document.getElementById('copy-logo-btn');
        if (btn) {
          btn.innerHTML = `${icon('check', 13)} Copiado!`;
          refreshIcons();
          setTimeout(() => {
            btn.innerHTML = `${icon('copy', 13)} Copiar briefing`;
            refreshIcons();
          }, 2000);
        }
      });
    });
    document.getElementById('print-logo-btn')?.addEventListener('click', () => window.print());
  }

  if (tab === 'deck') {
    document.getElementById('print-deck-btn')?.addEventListener('click', () => window.print());
  }
}

// ====== PDF DOWNLOAD ======

async function downloadAllPDF() {
  const btn = document.getElementById('download-pdf-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'A gerar PDF…'; }

  const businessName = outputs.businessPlan.match(/\*\*([^*]{3,60})\*\*/)?.[1] || 'Business Plan';

  // Build the full HTML content for the PDF
  const pitchHtml = outputs.pitchDeck.length
    ? outputs.pitchDeck.map(s => `
        <div style="page-break-inside:avoid; border:1px solid #e2e8f0; border-radius:8px; padding:20px; margin-bottom:16px;">
          <div style="font-size:11px; color:#94a3b8; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Slide ${s.slide || ''}</div>
          <div style="font-size:20px; margin-bottom:8px;">${s.icon || ''}</div>
          <h3 style="font-size:16px; margin:0 0 6px; color:#1e293b;">${s.title || ''}</h3>
          ${s.subtitle ? `<p style="color:#64748b; font-style:italic; margin:0 0 10px; font-size:13px;">${s.subtitle}</p>` : ''}
          ${s.highlight ? `<div style="background:#ede9fe; color:#6d28d9; border-radius:4px; padding:6px 10px; font-weight:700; font-size:12px; margin-bottom:10px; display:inline-block;">${s.highlight}</div>` : ''}
          ${s.points?.length ? `<ul style="margin:0; padding-left:16px;">${s.points.map(p => `<li style="color:#475569; font-size:13px; margin-bottom:4px;">${p}</li>`).join('')}</ul>` : ''}
        </div>`).join('')
    : '<p style="color:#94a3b8;">Pitch deck não disponível.</p>';

  const logoImageHtml = outputs.logoImage
    ? `<div style="text-align:center; margin:20px 0;"><img src="${outputs.logoImage}" style="max-width:300px; max-height:200px; background:white; padding:12px; border-radius:8px; border:1px solid #e2e8f0;" alt="Logo"/></div>`
    : '';

  const container = document.createElement('div');
  container.style.cssText = 'font-family: Arial, sans-serif; color: #1e293b; font-size: 14px; line-height: 1.6; max-width: 800px; padding: 0;';
  container.innerHTML = `
    <!-- COVER -->
    <div style="page-break-after:always; text-align:center; padding:60px 40px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; border-radius:8px; margin-bottom:32px;">
      <div style="font-size:48px; margin-bottom:16px;">🚀</div>
      <h1 style="font-size:32px; margin:0 0 8px; font-weight:800;">Business Plan</h1>
      <p style="font-size:16px; opacity:.85; margin:0;">Gerado por PlanAI • ${new Date().toLocaleDateString('pt-PT')}</p>
    </div>

    <!-- PLANO DE NEGÓCIO -->
    <div style="page-break-after:always;">
      <h1 style="font-size:22px; color:#6366f1; border-bottom:2px solid #6366f1; padding-bottom:8px; margin-bottom:24px;">📄 Plano de Negócio</h1>
      ${markdownToHtmlPdf(outputs.businessPlan)}
    </div>

    <!-- BRIEFING DE LOGO -->
    <div style="page-break-after:always;">
      <h1 style="font-size:22px; color:#6366f1; border-bottom:2px solid #6366f1; padding-bottom:8px; margin-bottom:24px;">🎨 Briefing de Identidade Visual</h1>
      ${logoImageHtml}
      ${markdownToHtmlPdf(outputs.logoBriefing)}
    </div>

    <!-- PITCH DECK -->
    <div>
      <h1 style="font-size:22px; color:#6366f1; border-bottom:2px solid #6366f1; padding-bottom:8px; margin-bottom:24px;">🎤 Pitch Deck</h1>
      ${pitchHtml}
    </div>
  `;

  const opt = {
    margin: [15, 15, 15, 15],
    filename: `business-plan-${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  try {
    await window.html2pdf().set(opt).from(container).save();
  } catch (e) {
    console.error('PDF error:', e);
    alert('Erro ao gerar PDF: ' + e.message);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `${icon('download', 14)} Descarregar PDF completo`;
    refreshIcons();
  }
}

// Simplified markdown→HTML for PDF (no dark-theme classes)
function markdownToHtmlPdf(md) {
  if (!md) return '<p style="color:#94a3b8;">Sem conteúdo.</p>';
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;color:#374151;margin:16px 0 6px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;color:#1e293b;margin:20px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;color:#6366f1;margin:24px 0 10px;">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[\-\*] (.+)$/gm, '<li style="margin:3px 0;color:#475569;">$1</li>')
    .replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul style="padding-left:20px;margin:8px 0;">$1</ul>')
    .replace(/^(?!<[hulo])((?!<).+)$/gm, '<p style="margin:6px 0;color:#374151;">$1</p>')
    .replace(/\n{2,}/g, '\n');
}

// ====== API KEY MODAL ======

function showApiModal(onSave) {
  const overlay = document.createElement('div');
  overlay.className = 'api-modal-overlay';
  overlay.innerHTML = `
    <div class="api-modal">
      <div class="api-modal-header">
        <div class="api-modal-icon">${icon('key', 20)}</div>
        <div>
          <h2>API Key</h2>
          <p>Introduza a sua chave do <a href="https://openrouter.ai/keys" target="_blank" class="api-modal-link">OpenRouter</a>.<br>
          A chave é guardada apenas no seu navegador.</p>
        </div>
      </div>
      <input type="password" class="api-modal-input" id="api-key-input"
        placeholder="sk-or-..." value="${getApiKey()}">
      <div class="api-modal-actions">
        <button class="btn btn-primary" id="save-api-btn">
          ${icon('save', 14)} Guardar
        </button>
        <button class="btn btn-ghost" id="cancel-api-btn">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  refreshIcons();

  document.getElementById('save-api-btn').addEventListener('click', () => {
    const key = document.getElementById('api-key-input').value.trim();
    if (key) { setApiKey(key); overlay.remove(); if (onSave) onSave(); }
  });

  document.getElementById('cancel-api-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // Focus input
  setTimeout(() => document.getElementById('api-key-input')?.focus(), 100);
}

// ====== MARKDOWN TO HTML ======

function markdownToHtml(md) {
  if (!md) return '<p>Nenhum conteúdo gerado.</p>';

  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_match, header, body) => {
      const headers = header.split('|').map(h => h.trim()).filter(Boolean);
      const rows = body.trim().split('\n').map(row =>
        row.split('|').map(c => c.trim()).filter(Boolean)
      );
      let table = '<table><thead><tr>';
      headers.forEach(h => { table += `<th>${h}</th>`; });
      table += '</tr></thead><tbody>';
      rows.forEach(row => {
        table += '<tr>';
        row.forEach(cell => { table += `<td>${cell}</td>`; });
        table += '</tr>';
      });
      table += '</tbody></table>';
      return table;
    })
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^(?!<[hultdpro])((?!<).+)$/gm, '<p>$1</p>')
    .replace(/\n{2,}/g, '\n');

  return html;
}

// ====== INIT ======

renderLanding();
