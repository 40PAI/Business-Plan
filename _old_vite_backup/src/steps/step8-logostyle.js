// Step 8: Logo Style
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const STYLES = [
  { id: 'modern',      icon: 'minimize-2', label: 'Moderno e minimalista', desc: 'Clean, espaço em branco, linhas simples' },
  { id: 'corporate',   icon: 'briefcase',  label: 'Corporativo e sério',   desc: 'Profissional, confiança, elegância' },
  { id: 'creative',    icon: 'brush',      label: 'Criativo e colorido',   desc: 'Vibrante, divertido, expressivo' },
  { id: 'tech',        icon: 'cpu',        label: 'Tecnológico / Futurista', desc: 'Inovador, digital, vanguarda' },
  { id: 'traditional', icon: 'shield',     label: 'Tradicional e confiável', desc: 'Clássico, estabelecido, atemporal' },
];

export function render() {
  const current = getAnswer(8) || '';

  let html = `
    <div class="step-content">
      <h2 class="step-question">Que estilo de logo prefere?</h2>
      <p class="step-hint">Pense na impressão que quer causar.</p>
      <div class="visual-cards-grid" id="step8-options">
        ${STYLES.map(s => {
          const sel = current === s.label ? 'selected' : '';
          return `
            <div class="visual-card ${sel}" data-value="${s.label}">
              <div class="visual-card-icon">${icon(s.icon, 20)}</div>
              <div class="visual-card-title">${s.label}</div>
              <div class="visual-card-desc">${s.desc}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  return html;
}

export function bind(onUpdate) {
  document.querySelectorAll('#step8-options .visual-card').forEach(card => {
    card.addEventListener('click', () => {
      setAnswer(8, card.dataset.value);
      onUpdate();
      document.querySelectorAll('.visual-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}
