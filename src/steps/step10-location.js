// Step 10: Market Location
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { icon: 'wifi',    label: 'Apenas online',         desc: 'Sem localizacao fisica' },
  { icon: 'map-pin', label: 'Local (cidade/bairro)', desc: 'Mercado concentrado' },
  { icon: 'map',     label: 'Regional',              desc: 'Varias cidades ou regioes' },
  { icon: 'flag',    label: 'Nacional',              desc: 'Todo o pais' },
  { icon: 'globe',   label: 'Internacional',         desc: 'Multiplos paises' },
];

export function render() {
  const current = getAnswer(10) || '';
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
      <h2 class="step-question">Onde vai operar o seu negocio?</h2>
      <p class="step-hint">Onde estao os seus clientes principais?</p>
      <div class="options-grid" id="step10-options">${rows}</div>
    </div>`;
}

export function bind(onUpdate) {
  if (window.lucide) window.lucide.createIcons();
  document.querySelectorAll('#step10-options .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      setAnswer(10, pill.dataset.value);
      onUpdate();
      document.querySelectorAll('#step10-options .option-pill').forEach(p => {
        const sel = p.dataset.value === pill.dataset.value;
        p.classList.toggle('selected', sel);
        const check = p.querySelector('.option-pill-check');
        if (check) { check.innerHTML = sel ? icon('check', 11) : ''; }
      });
      if (window.lucide) window.lucide.createIcons();
    });
  });
}