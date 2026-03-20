// Step 6: Differentiators (multi-select, max 3)
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { id: 'price',         icon: 'badge-dollar-sign', label: 'Preço mais acessível' },
  { id: 'speed',         icon: 'zap',               label: 'Mais rápido' },
  { id: 'simplicity',    icon: 'target',            label: 'Mais simples de usar' },
  { id: 'local',         icon: 'map-pin',           label: 'Focado no mercado local' },
  { id: 'support',       icon: 'headphones',        label: 'Melhor suporte' },
  { id: 'tech',          icon: 'cpu',               label: 'Tecnologia exclusiva' },
  { id: 'custom',        icon: 'sliders',           label: 'Personalização' },
];

const MORE = [
  { id: 'quality',        icon: 'award',       label: 'Qualidade superior' },
  { id: 'sustainability', icon: 'leaf',        label: 'Sustentabilidade' },
  { id: 'security',       icon: 'shield',      label: 'Maior segurança' },
  { id: 'mobile',         icon: 'smartphone',  label: 'Experiência mobile' },
  { id: 'ai',             icon: 'bot',         label: 'Inteligência artificial' },
  { id: 'delivery',       icon: 'truck',       label: 'Entrega rápida / ao domicílio' },
  { id: 'trust',          icon: 'handshake',   label: 'Confiança / reputação local' },
];

const MAX_SELECT = 3;
const ALL_STD = [...OPTIONS, ...MORE];
function isCustom(c) { return c !== '__OUTRO__' && !ALL_STD.some(o => o.label === c); }

function pillHtml(opt, current) {
  const sel = current.includes(opt.label) ? 'selected' : '';
  const dis = !sel && current.filter(c => c !== '__OUTRO__').length >= MAX_SELECT ? 'disabled' : '';
  return `
    <div class="option-pill ${sel} ${dis}" data-value="${opt.label}">
      <span class="option-pill-icon">${icon(opt.icon, 16)}</span>
      <span class="option-pill-text">${opt.label}</span>
      <span class="option-pill-check">${sel ? icon('check', 11) : ''}</span>
    </div>
  `;
}

export function render() {
  const current = getAnswer(6) || [];
  const hasOutro = current.includes('__OUTRO__') || current.some(isCustom);
  const outroVal = current.find(isCustom) || '';
  const realCount = current.filter(c => !isCustom(c) || c !== '__OUTRO__').length;

  let html = `
    <div class="step-content">
      <h2 class="step-question">O que torna a sua oferta diferente?</h2>
      <p class="step-hint">Escolha até ${MAX_SELECT}. (${current.filter(c => c !== '__OUTRO__').length}/${MAX_SELECT} selecionados)</p>
      <div class="options-grid" id="step6-options">
        ${OPTIONS.map(o => pillHtml(o, current)).join('')}
        <div class="option-pill more-options" id="show-more-6">
          <span class="option-pill-icon">${icon('grid-3x3', 16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>

      <div id="more-options-6" style="display:none;">
        <div class="options-grid">
          ${MORE.map(o => pillHtml(o, current)).join('')}
          <div class="option-pill ${hasOutro ? 'selected' : ''} ${!hasOutro && realCount >= MAX_SELECT ? 'disabled' : ''}" data-value="__outro__">
            <span class="option-pill-icon">${icon('pen-line', 16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${hasOutro ? icon('check', 11) : ''}</span>
          </div>
        </div>
      </div>

      ${hasOutro ? `
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-6"
            placeholder="Descreva o seu diferencial..." value="${outroVal}">
        </div>
      ` : ''}
    </div>
  `;

  return html;
}

export function bind(onUpdate) {
  const showMore = document.getElementById('show-more-6');
  const moreC = document.getElementById('more-options-6');

  if (showMore && moreC) {
    const cur = getAnswer(6) || [];
    if (MORE.some(o => cur.includes(o.label)) || cur.some(c => !OPTIONS.some(o => o.label === c))) {
      moreC.style.display = 'block';
      showMore.style.display = 'none';
    }
    showMore.addEventListener('click', () => {
      moreC.style.display = 'block';
      showMore.style.display = 'none';
      moreC.style.animation = 'fadeInUp 0.3s ease-out';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  document.querySelectorAll('#step6-options .option-pill:not(.more-options), #more-options-6 .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('disabled')) return;
      const v = pill.dataset.value;
      let current = [...(getAnswer(6) || [])];

      if (v === '__outro__') {
        const alreadyHas = current.includes('__OUTRO__') || current.some(isCustom);
        if (alreadyHas) {
          current = current.filter(c => c !== '__OUTRO__' && !isCustom(c));
        } else {
          current.push('__OUTRO__');
        }
        setAnswer(6, current);
        onUpdate();
        document.getElementById('step-content-wrapper').innerHTML = render();
        bind(onUpdate);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => document.getElementById('outro-6')?.focus(), 100);
        return;
      }

      if (current.includes(v)) {
        current = current.filter(c => c !== v);
      } else if (current.filter(c => c !== '__OUTRO__').length < MAX_SELECT) {
        current.push(v);
      }
      setAnswer(6, current);
      onUpdate();

      document.getElementById('step-content-wrapper').innerHTML = render();
      bind(onUpdate);
      if (window.lucide) window.lucide.createIcons();
    });
  });

  const outroInput = document.getElementById('outro-6');
  if (outroInput) {
    outroInput.addEventListener('input', e => {
      let current = (getAnswer(6) || []).filter(c => ALL_STD.some(o => o.label === c));
      const val = e.target.value.trim();
      current.push(val || '__OUTRO__');
      setAnswer(6, current);
      onUpdate();
    });
  }
}
