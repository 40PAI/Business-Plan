// Step 1: Business Area
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { id: 'tech',        icon: 'monitor',      label: 'Tecnologia / Software' },
  { id: 'food',        icon: 'utensils',     label: 'Restauração / Alimentação' },
  { id: 'health',      icon: 'heart-pulse',  label: 'Saúde / Clínicas' },
  { id: 'education',   icon: 'book-open',    label: 'Educação / Formação' },
  { id: 'retail',      icon: 'shopping-bag', label: 'Retalho / Comércio' },
  { id: 'realestate',  icon: 'building-2',   label: 'Imobiliário' },
  { id: 'logistics',   icon: 'truck',        label: 'Logística / Transporte' },
  { id: 'finance',     icon: 'landmark',     label: 'Serviços Financeiros' },
];

const MORE_OPTIONS = [
  { id: 'tourism',       icon: 'plane',        label: 'Turismo / Hotelaria' },
  { id: 'beauty',        icon: 'sparkles',     label: 'Beleza / Estética' },
  { id: 'agriculture',   icon: 'leaf',         label: 'Agricultura / Agro' },
  { id: 'entertainment', icon: 'film',         label: 'Entretenimento / Média' },
  { id: 'construction',  icon: 'hard-hat',     label: 'Construção / Engenharia' },
  { id: 'consulting',    icon: 'bar-chart-2',  label: 'Consultoria' },
];

function pillHtml(opt, current) {
  const selected = current === opt.label ? 'selected' : '';
  return `
    <div class="option-pill ${selected}" data-value="${opt.label}">
      <span class="option-pill-icon">${icon(opt.icon, 16)}</span>
      <span class="option-pill-text">${opt.label}</span>
      <span class="option-pill-check">${selected ? icon('check', 11) : ''}</span>
    </div>
  `;
}

export function render() {
  const current = getAnswer(1) || '';
  const outroSelected = current && ![...OPTIONS, ...MORE_OPTIONS].some(o => o.label === current);

  let html = `
    <div class="step-content">
      <h2 class="step-question">Em que área actua o seu negócio?</h2>
      <p class="step-hint">Escolha a que mais se aproxima.</p>
      <div class="options-grid" id="step1-options">
        ${OPTIONS.map(o => pillHtml(o, current)).join('')}
        <div class="option-pill more-options" id="show-more-1">
          <span class="option-pill-icon">${icon('grid-3x3', 16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>

      <div id="more-options-1" style="display:none;">
        <div class="options-grid">
          ${MORE_OPTIONS.map(o => pillHtml(o, current)).join('')}
          <div class="option-pill ${outroSelected ? 'selected' : ''}" data-value="__outro__">
            <span class="option-pill-icon">${icon('pen-line', 16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${outroSelected ? icon('check', 11) : ''}</span>
          </div>
        </div>
      </div>

      ${outroSelected ? `
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-1"
            placeholder="Escreva a sua área de negócio..." value="${current}">
        </div>
      ` : ''}
    </div>
  `;

  return html;
}

export function bind(onUpdate) {
  const showMore = document.getElementById('show-more-1');
  const moreContainer = document.getElementById('more-options-1');

  if (showMore && moreContainer) {
    const current = getAnswer(1) || '';
    const isMoreOption = MORE_OPTIONS.some(o => o.label === current) ||
      (current && !OPTIONS.some(o => o.label === current) && current !== '__outro__');

    if (isMoreOption) {
      moreContainer.style.display = 'block';
      showMore.style.display = 'none';
    }

    showMore.addEventListener('click', () => {
      moreContainer.style.display = 'block';
      showMore.style.display = 'none';
      moreContainer.style.animation = 'fadeInUp 0.3s ease-out';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  document.querySelectorAll('#step1-options .option-pill:not(.more-options), #more-options-1 .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const value = pill.dataset.value;
      if (value === '__outro__') {
        setAnswer(1, '');
        onUpdate();
        document.getElementById('step-content-wrapper').innerHTML = render();
        bind(onUpdate);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => document.getElementById('outro-1')?.focus(), 100);
      } else {
        setAnswer(1, value);
        onUpdate();
        document.querySelectorAll('.option-pill').forEach(p => {
          p.classList.remove('selected');
          const check = p.querySelector('.option-pill-check');
          if (check) check.innerHTML = '';
        });
        pill.classList.add('selected');
        const check = pill.querySelector('.option-pill-check');
        if (check) { check.innerHTML = icon('check', 11); if (window.lucide) window.lucide.createIcons(); }
      }
    });
  });

  const outroInput = document.getElementById('outro-1');
  if (outroInput) {
    outroInput.addEventListener('input', e => { setAnswer(1, e.target.value); onUpdate(); });
  }
}
