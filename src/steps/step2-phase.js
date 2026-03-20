// Step 2: Business Phase
import { getAnswer, setAnswer, getSubAnswer, setSubAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const PHASES = [
  { id: 'no-idea',   label: 'Não tenho nenhuma ideia como tal', icon: 'brain' },
  { id: 'idea-only', label: 'Só tenho a ideia',                  icon: 'lightbulb' },
  { id: 'tested',    label: 'Já testei com alguns clientes',     icon: 'flask-conical' },
  { id: 'revenue',   label: 'Já gero receita',                   icon: 'trending-up' },
  { id: 'scale',     label: 'Quero escalar o que já existe',     icon: 'rocket' },
];

const SUB_QUESTIONS = {
  'no-idea': [
    { key: 'interest', label: 'Que temas ou áreas te interessam mais?',    placeholder: 'Ex: tecnologia, alimentação saudável, moda…' },
    { key: 'skills',   label: 'Que competências ou experiência tens?',      placeholder: 'Ex: programação, cozinha, vendas, design…' },
  ],
  'idea-only': [
    { key: 'idea-desc',   label: 'Descreve a tua ideia em poucas palavras', placeholder: 'Ex: Uma app que conecta personal trainers a clientes…' },
    { key: 'motivation',  label: 'O que te motivou a pensar nesta ideia?',  placeholder: 'Ex: Vi uma necessidade no mercado, experiência pessoal…' },
  ],
  'tested': [
    { key: 'feedback',  label: 'Qual foi o feedback dos primeiros clientes?', placeholder: 'Ex: Gostaram do conceito mas pediram mais funcionalidades…' },
    { key: 'test-size', label: 'Com quantas pessoas já testaste?',            placeholder: 'Ex: 5 amigos, 20 clientes, 100 utilizadores beta…' },
  ],
  'revenue': [
    { key: 'monthly-rev',  label: 'Qual é a receita mensal aproximada?',      placeholder: 'Ex: 500€, 2000€, 10 000€…' },
    { key: 'main-product', label: 'Que produto/serviço gera mais receita?',   placeholder: 'Ex: Consultoria, venda de produto X, subscrições…' },
  ],
  'scale': [
    { key: 'bottleneck', label: 'Qual é o principal obstáculo ao crescimento?',                placeholder: 'Ex: Falta de capital, equipa pequena, marketing…' },
    { key: 'scale-goal', label: 'Que objectivo queres atingir nos próximos 12 meses?',        placeholder: 'Ex: Duplicar receita, entrar em novo mercado, 1000 clientes…' },
  ],
};

export function render() {
  const current = getAnswer(2) || '';
  const selectedPhase = PHASES.find(p => p.label === current);

  let html = `
    <div class="step-content">
      <h2 class="step-question">Em que fase está o seu negócio?</h2>
      <p class="step-hint">Seja honesto — não há resposta errada.</p>
      <div class="options-grid" id="step2-options">
        ${PHASES.map(phase => {
          const selected = current === phase.label ? 'selected' : '';
          return `
            <div class="option-pill ${selected}" data-value="${phase.label}" data-phase="${phase.id}">
              <span class="option-pill-icon">${icon(phase.icon, 16)}</span>
              <span class="option-pill-text">${phase.label}</span>
              <span class="option-pill-check">${selected ? icon('check', 11) : ''}</span>
            </div>
          `;
        }).join('')}
      </div>
  `;

  if (selectedPhase && SUB_QUESTIONS[selectedPhase.id]) {
    html += `<div class="sub-questions" id="sub-questions-2">`;
    SUB_QUESTIONS[selectedPhase.id].forEach(sq => {
      const val = getSubAnswer(sq.key) || '';
      html += `
        <label class="sub-question-label">${sq.label}</label>
        <input type="text" class="sub-question-input" data-key="${sq.key}"
          placeholder="${sq.placeholder}" value="${val}">
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

export function bind(onUpdate) {
  document.querySelectorAll('#step2-options .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      setAnswer(2, pill.dataset.value);
      onUpdate();
      document.getElementById('step-content-wrapper').innerHTML = render();
      bind(onUpdate);
      if (window.lucide) window.lucide.createIcons();
    });
  });

  document.querySelectorAll('.sub-question-input').forEach(input => {
    input.addEventListener('input', e => setSubAnswer(e.target.dataset.key, e.target.value));
  });
}
