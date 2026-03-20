// Step 13: Main Goal
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { icon: 'bar-chart-2', label: 'Gerar rendimento estável',       desc: 'Negócio sólido e sustentável' },
  { icon: 'trending-up', label: 'Crescer rapidamente e escalar',  desc: 'Crescimento acelerado' },
  { icon: 'lightbulb',   label: 'Atrair investidores externos',    desc: 'Fundraising e venture capital' },
  { icon: 'target',      label: 'Vender o negócio em 3-5 anos',   desc: 'Exit strategy planeada' },
  { icon: 'leaf',        label: 'Impacto social ou ambiental',     desc: 'Missão acima do lucro' },
  { icon: 'globe',       label: 'Criar um produto global',         desc: 'Alcance mundial desde o início' },
];

export function render() {
  const current = getAnswer(13) || '';
  const rows = OPTIONS.map(opt => {
    const sel = current === opt.label ? 'selected' : '';
    return `
      <div class="option-pill ${sel}" data-value="${opt.label}">
        <span class="option-pill-icon">${icon(opt.icon, 16)}</span>
        <div class="option-pill-body">
          <span class="option-pill-text">${opt.label}</span>
          <span class="option-pill-desc">${opt.desc}</span>
        </div>
        <span class="option-pill-check">${sel ? icon('check', 11) : ''}</span>
      </div>`;
  }).join('');

  return `
    <div class="step-content">
      <h2 class="step-question">Qual o seu objectivo principal?</h2>
      <p class="step-hint">O que pretende alcançar com este negócio?</p>
      <div class="options-grid" id="step13-options">${rows}</div>
    </div>`;
}

export function bind(onUpdate) {
  if (window.lucide) window.lucide.createIcons();
  document.querySelectorAll('#step13-options .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      setAnswer(13, pill.dataset.value);
      onUpdate();
      document.querySelectorAll('#step13-options .option-pill').forEach(p => {
        const sel = p.dataset.value === pill.dataset.value;
        p.classList.toggle('selected', sel);
        const check = p.querySelector('.option-pill-check');
        if (check) { check.innerHTML = sel ? icon('check', 11) : ''; }
      });
      if (window.lucide) window.lucide.createIcons();
    });
  });
}
