// Step 3: Problem Solved
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { icon: 'clock',       label: 'Poupa tempo' },
  { icon: 'wallet',      label: 'Poupa dinheiro' },
  { icon: 'repeat-2',   label: 'Substitui algo caro/difícil' },
  { icon: 'unlock',     label: 'Acesso a algo inexistente' },
  { icon: 'thumbs-up',  label: 'Melhora uma experiência má' },
];

const MORE = [
  { icon: 'users',       label: 'Conecta pessoas/negócios' },
  { icon: 'shield',      label: 'Aumenta segurança' },
  { icon: 'trending-up', label: 'Aumenta produtividade' },
  { icon: 'globe',       label: 'Resolve problema social/ambiental' },
];

function pillHtml(opt, current) {
  const sel = current === opt.label ? 'selected' : '';
  return `
    <div class="option-pill ${sel}" data-value="${opt.label}">
      <span class="option-pill-icon">${icon(opt.icon, 16)}</span>
      <span class="option-pill-text">${opt.label}</span>
      <span class="option-pill-check">${sel ? icon('check', 11) : ''}</span>
    </div>
  `;
}

export function render() {
  const current = getAnswer(3) || '';
  const outroSel = current && ![...OPTIONS, ...MORE].some(o => o.label === current);

  return `
    <div class="step-content">
      <h2 class="step-question">Qual é o principal problema que resolve?</h2>
      <p class="step-hint">Pense no cliente, não no produto.</p>
      <div class="options-grid" id="step3-options">
        ${OPTIONS.map(o => pillHtml(o, current)).join('')}
        <div class="option-pill more-options" id="show-more-3">
          <span class="option-pill-icon">${icon('grid-3x3', 16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>
      <div id="more-options-3" style="display:none;">
        <div class="options-grid">
          ${MORE.map(o => pillHtml(o, current)).join('')}
          <div class="option-pill ${outroSel ? 'selected' : ''}" data-value="__outro__">
            <span class="option-pill-icon">${icon('pen-line', 16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${outroSel ? icon('check', 11) : ''}</span>
          </div>
        </div>
      </div>
      ${outroSel ? `
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-3"
            placeholder="Descreva o problema que resolve..." value="${current}">
        </div>
      ` : ''}
    </div>
  `;
}

export function bind(onUpdate) {
  const showMore = document.getElementById('show-more-3');
  const moreC = document.getElementById('more-options-3');
  if (showMore && moreC) {
    const cur = getAnswer(3) || '';
    if (MORE.some(o => o.label === cur) || (cur && !OPTIONS.some(o => o.label === cur))) {
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

  document.querySelectorAll('#step3-options .option-pill:not(.more-options), #more-options-3 .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const v = pill.dataset.value;
      if (v === '__outro__') {
        setAnswer(3, '');
        onUpdate();
        document.getElementById('step-content-wrapper').innerHTML = render();
        bind(onUpdate);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => document.getElementById('outro-3')?.focus(), 100);
      } else {
        setAnswer(3, v);
        onUpdate();
        document.querySelectorAll('.option-pill').forEach(p => {
          p.classList.remove('selected');
          const c = p.querySelector('.option-pill-check'); if (c) c.innerHTML = '';
        });
        pill.classList.add('selected');
        const c = pill.querySelector('.option-pill-check');
        if (c) { c.innerHTML = icon('check', 11); if (window.lucide) window.lucide.createIcons(); }
      }
    });
  });

  const outroInput = document.getElementById('outro-3');
  if (outroInput) {
    outroInput.addEventListener('input', e => { setAnswer(3, e.target.value); onUpdate(); });
  }
}
