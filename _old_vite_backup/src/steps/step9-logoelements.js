// Step 9: Logo Element Type
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const TYPES = [
  { id: 'wordmark',    icon: 'type',        label: 'Logótipo (Wordmark)',        desc: 'O nome da marca estilizado',      examples: 'Coca-Cola, Google, Samsung' },
  { id: 'lettermark',  icon: 'a-large-small', label: 'Monograma (Lettermark)',   desc: 'Iniciais ou abreviação',          examples: 'IBM, NASA, HBO' },
  { id: 'brandmark',   icon: 'pentagon',    label: 'Símbolo / Ícone (Brandmark)', desc: 'Um ícone ou símbolo isolado',    examples: 'Apple, Nike, Twitter' },
  { id: 'combination', icon: 'layout-template', label: 'Logo Combinado',         desc: 'Ícone + texto juntos',            examples: 'Adidas, Burger King' },
  { id: 'emblem',      icon: 'shield',      label: 'Emblema',                    desc: 'Texto dentro de um símbolo',     examples: 'Starbucks, Harley-Davidson' },
  { id: 'mascot',      icon: 'user-round',  label: 'Mascote',                    desc: 'Um personagem ilustrado',        examples: 'KFC, Michelin' },
  { id: 'abstract',    icon: 'hexagon',     label: 'Logo Abstrato',              desc: 'Forma geométrica abstracta',     examples: 'Pepsi, Airbnb' },
];

export function render() {
  const current = getAnswer(9) || '';

  let html = `
    <div class="step-content">
      <h2 class="step-question">Que elementos quer na logo?</h2>
      <p class="step-hint">Escolher apenas um.</p>
      <div class="visual-cards-grid" id="step9-options">
        ${TYPES.map(t => {
          const sel = current === t.label ? 'selected' : '';
          return `
            <div class="visual-card ${sel}" data-value="${t.label}">
              <div class="visual-card-icon">${icon(t.icon, 20)}</div>
              <div class="visual-card-title">${t.label}</div>
              <div class="visual-card-desc">${t.desc}</div>
              <div class="visual-card-desc" style="margin-top:4px;color:var(--text-accent);font-weight:500;">Ex: ${t.examples}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  return html;
}

export function bind(onUpdate) {
  document.querySelectorAll('#step9-options .visual-card').forEach(card => {
    card.addEventListener('click', () => {
      setAnswer(9, card.dataset.value);
      onUpdate();
      document.querySelectorAll('.visual-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}
