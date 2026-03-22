// Step 12: Available Investment
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { icon: 'coins',       label: 'Menos de 500.000 Kz',           desc: 'Bootstrap, recursos próprios' },
  { icon: 'wallet',      label: '500.000 Kz – 2.500.000 Kz',    desc: 'Capital inicial modesto' },
  { icon: 'briefcase',   label: '2.500.000 Kz – 10.000.000 Kz', desc: 'Investimento sério' },
  { icon: 'landmark',    label: '10.000.000 Kz – 50.000.000 Kz', desc: 'Capital de crescimento' },
  { icon: 'trending-up', label: 'Mais de 50.000.000 Kz',         desc: 'Escala ambiciosa' },
  { icon: 'handshake',   label: 'A procurar investimento',        desc: 'Ainda sem capital definido' },
];

export function render() {
  const current = getAnswer(12) || '';
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
      <h2 class="step-question">Qual o investimento disponível?</h2>
      <p class="step-hint">Valor que tem ou pretende angariar para arrancar.</p>
      <div class="options-grid" id="step12-options">${rows}</div>
    </div>`;
}

export function bind(onUpdate) {
  if (window.lucide) window.lucide.createIcons();
  document.querySelectorAll('#step12-options .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      setAnswer(12, pill.dataset.value);
      onUpdate();
      document.querySelectorAll('#step12-options .option-pill').forEach(p => {
        const sel = p.dataset.value === pill.dataset.value;
        p.classList.toggle('selected', sel);
        const check = p.querySelector('.option-pill-check');
        if (check) { check.innerHTML = sel ? icon('check', 11) : ''; }
      });
      if (window.lucide) window.lucide.createIcons();
    });
  });
}
