// Step 11: Team
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { icon: 'user',        label: 'Trabalho sozinho(a)',           desc: 'Fundador único, sem equipa' },
  { icon: 'users',       label: 'Co-fundadores (2-3 pessoas)',   desc: 'Parceiros de negócio' },
  { icon: 'users-round', label: 'Pequena equipa (até 10)',       desc: 'Equipa já formada' },
  { icon: 'building-2',  label: 'Equipa média (10-50)',          desc: 'Estrutura mais formal' },
  { icon: 'search',      label: 'Estou a recrutar',              desc: 'A construir a equipa' },
];

export function render() {
  const current = getAnswer(11) || '';
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
      <h2 class="step-question">Como é a sua equipa?</h2>
      <p class="step-hint">Quem está a trabalhar neste projecto?</p>
      <div class="options-grid" id="step11-options">${rows}</div>
    </div>`;
}

export function bind(onUpdate) {
  if (window.lucide) window.lucide.createIcons();
  document.querySelectorAll('#step11-options .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      setAnswer(11, pill.dataset.value);
      onUpdate();
      document.querySelectorAll('#step11-options .option-pill').forEach(p => {
        const sel = p.dataset.value === pill.dataset.value;
        p.classList.toggle('selected', sel);
        const check = p.querySelector('.option-pill-check');
        if (check) { check.innerHTML = sel ? icon('check', 11) : ''; }
      });
      if (window.lucide) window.lucide.createIcons();
    });
  });
}
