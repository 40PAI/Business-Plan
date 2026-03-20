// Step 7: Business Name (free text + AI suggestions)
import { getAnswer, setAnswer, getNameSuggestions, setNameSuggestions, collectFormData, hasApiKey } from '../formEngine.js';
import { generateNameSuggestions } from '../ai.js';
import { icon } from '../icons.js';

let isLoading = false;

export function render() {
  const current = getAnswer(7) || '';
  const suggestions = getNameSuggestions();

  let html = `
    <div class="step-content">
      <h2 class="step-question">Tem nome para o negócio?</h2>
      <p class="step-hint">Escreva o nome ou peça sugestões à IA.</p>

      <div class="name-input-section">
        <input type="text" class="name-large-input" id="name-input"
          placeholder="O nome do seu negócio..." value="${current}" autocomplete="off">
      </div>

      <div class="name-divider">ou peça sugestões à IA</div>

      <div class="name-suggestions-container" id="suggestions-container">
  `;

  if (isLoading) {
    html += `
      <div style="text-align:center; padding: var(--space-xl);">
        <div class="loading-spinner">A gerar sugestões...</div>
      </div>
    `;
  } else if (suggestions.length > 0) {
    html += `<div class="name-suggestions-grid">`;
    suggestions.forEach(name => {
      const sel = current === name ? 'selected' : '';
      html += `<div class="name-suggestion ${sel}" data-name="${name}">${name}</div>`;
    });
    html += `</div>`;
    html += `
      <div style="text-align:center; margin-top: var(--space-md);">
        <button class="btn btn-secondary btn-sm" id="generate-more-btn">
          ${icon('rotate-ccw', 13)} Gerar mais sugestões
        </button>
      </div>
    `;
  } else {
    html += `
      <div style="text-align:center;">
        <button class="btn btn-secondary" id="generate-names-btn" ${!hasApiKey() ? 'disabled title="Configure a API key primeiro"' : ''}>
          ${icon('sparkles', 15)} Gerar 10 sugestões de nome
        </button>
        ${!hasApiKey() ? `<p style="color:var(--text-muted);font-size:var(--text-xs);margin-top:var(--space-sm);">Configure a API key nas definições</p>` : ''}
      </div>
    `;
  }

  html += `</div></div>`;
  return html;
}

export function bind(onUpdate) {
  if (window.lucide) window.lucide.createIcons();

  const nameInput = document.getElementById('name-input');
  if (nameInput) {
    nameInput.addEventListener('input', e => {
      setAnswer(7, e.target.value);
      onUpdate();
      document.querySelectorAll('.name-suggestion').forEach(s => s.classList.remove('selected'));
    });
  }

  const handleGenerate = async () => {
    isLoading = true;
    const wrapper = document.getElementById('step-content-wrapper');
    if (wrapper) { wrapper.innerHTML = render(); bind(onUpdate); }

    try {
      const formData = collectFormData();
      const names = await generateNameSuggestions(formData);
      setNameSuggestions(names);
    } catch (error) {
      console.error('Error generating names:', error);
      setNameSuggestions([]);
      alert('Erro ao gerar sugestões: ' + error.message);
    }

    isLoading = false;
    const wrapper2 = document.getElementById('step-content-wrapper');
    if (wrapper2) { wrapper2.innerHTML = render(); bind(onUpdate); }
    if (window.lucide) window.lucide.createIcons();
  };

  const genBtn     = document.getElementById('generate-names-btn');
  const genMoreBtn = document.getElementById('generate-more-btn');
  if (genBtn)     genBtn.addEventListener('click', handleGenerate);
  if (genMoreBtn) genMoreBtn.addEventListener('click', handleGenerate);

  document.querySelectorAll('.name-suggestion').forEach(s => {
    s.addEventListener('click', () => {
      const name = s.dataset.name;
      setAnswer(7, name);
      onUpdate();
      const input = document.getElementById('name-input');
      if (input) input.value = name;
      document.querySelectorAll('.name-suggestion').forEach(el => el.classList.remove('selected'));
      s.classList.add('selected');
    });
  });
}
