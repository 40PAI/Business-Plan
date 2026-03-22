// Step 4: Target Customer (multi-select)
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { icon: 'user',          label: 'Jovens 18–30' },
  { icon: 'user-check',    label: 'Adultos 30–50' },
  { icon: 'store',         label: 'Empresas pequenas' },
  { icon: 'building-2',    label: 'Grandes empresas' },
  { icon: 'landmark',      label: 'Governo / Instituições' },
  { icon: 'users',         label: 'Famílias' },
];

const MORE = [
  { icon: 'user-cog',      label: 'Seniores 50+' },
  { icon: 'graduation-cap',label: 'Estudantes' },
  { icon: 'laptop',        label: 'Freelancers' },
  { icon: 'globe',         label: 'Mercado internacional' },
  { icon: 'heart-pulse',   label: 'Profissionais de saúde' },
];

function pillHtml(opt, current) {
  const sel = current.includes(opt.label) ? 'selected' : '';
  return `
    <div class="option-pill ${sel}" data-value="${opt.label}">
      <span class="option-pill-icon">${icon(opt.icon, 16)}</span>
      <span class="option-pill-text">${opt.label}</span>
      <span class="option-pill-check">${sel ? icon('check', 11) : ''}</span>
    </div>
  `;
}

export function render() {
  const current = getAnswer(4) || [];
  const allStd = [...OPTIONS, ...MORE];
  const hasOutro = current.some(c => !allStd.some(o => o.label === c));
  const outroVal = hasOutro ? current.find(c => !allStd.some(o => o.label === c)) : '';

  return `
    <div class="step-content">
      <h2 class="step-question">Quem é o seu cliente principal?</h2>
      <p class="step-hint">Pode escolher mais de um.</p>
      <div class="options-grid" id="step4-options">
        ${OPTIONS.map(o => pillHtml(o, current)).join('')}
        <div class="option-pill more-options" id="show-more-4">
          <span class="option-pill-icon">${icon('grid-3x3', 16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>
      <div id="more-options-4" style="display:none;">
        <div class="options-grid">
          ${MORE.map(o => pillHtml(o, current)).join('')}
          <div class="option-pill ${hasOutro ? 'selected' : ''}" data-value="__outro__">
            <span class="option-pill-icon">${icon('pen-line', 16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${hasOutro ? icon('check', 11) : ''}</span>
          </div>
        </div>
      </div>
      ${hasOutro ? `
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-4"
            placeholder="Descreva o seu cliente..." value="${outroVal}">
        </div>
      ` : ''}
    </div>
  `;
}

export function bind(onUpdate) {
  const allStd = [...OPTIONS, ...MORE];
  const showMore = document.getElementById('show-more-4');
  const moreC = document.getElementById('more-options-4');
  if (showMore && moreC) {
    const cur = getAnswer(4) || [];
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

  document.querySelectorAll('#step4-options .option-pill:not(.more-options), #more-options-4 .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const v = pill.dataset.value;
      let current = [...(getAnswer(4) || [])];

      if (v === '__outro__') {
        if (current.some(c => !allStd.some(o => o.label === c))) {
          current = current.filter(c => allStd.some(o => o.label === c));
        }
        setAnswer(4, current);
        onUpdate();
        document.getElementById('step-content-wrapper').innerHTML = render();
        bind(onUpdate);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => document.getElementById('outro-4')?.focus(), 100);
        return;
      }

      if (current.includes(v)) {
        current = current.filter(c => c !== v);
      } else {
        current.push(v);
      }
      setAnswer(4, current);
      onUpdate();

      pill.classList.toggle('selected');
      const check = pill.querySelector('.option-pill-check');
      if (check) {
        check.innerHTML = pill.classList.contains('selected') ? icon('check', 11) : '';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  });

  const outroInput = document.getElementById('outro-4');
  if (outroInput) {
    outroInput.addEventListener('input', e => {
      let current = (getAnswer(4) || []).filter(c => allStd.some(o => o.label === c));
      if (e.target.value.trim()) current.push(e.target.value.trim());
      setAnswer(4, current);
      onUpdate();
    });
  }
}
