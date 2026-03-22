// Step 5: Revenue Model
import { getAnswer, setAnswer } from '../formEngine.js';
import { icon } from '../icons.js';

const OPTIONS = [
  { id: 'subscription', icon: 'calendar',       label: 'Subscrição mensal / anual' },
  { id: 'one-time',     icon: 'shopping-cart',  label: 'Venda única por produto' },
  { id: 'commission',   icon: 'percent',        label: 'Comissão por transacção' },
  { id: 'ads',          icon: 'megaphone',      label: 'Publicidade' },
  { id: 'freemium',     icon: 'gift',           label: 'Freemium (gratuito + pago)' },
  { id: 'projects',     icon: 'clipboard-list', label: 'Projectos / Consultoria' },
];

const MORE = [
  { id: 'licensing',    icon: 'file-badge',     label: 'Licenciamento' },
  { id: 'marketplace',  icon: 'store',          label: 'Marketplace / Intermediação' },
  { id: 'saas',         icon: 'cloud',          label: 'SaaS (Software as a Service)' },
  { id: 'courses',      icon: 'graduation-cap', label: 'Formação / Cursos' },
  { id: 'rental',       icon: 'key',            label: 'Aluguer / Arrendamento' },
  { id: 'wholesale',    icon: 'package',        label: 'Venda por grosso' },
];

const ALL_STD = [...OPTIONS, ...MORE];

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
  const current = getAnswer(5) || '';
  const outroSel = current === '__OUTRO__' || (current && !ALL_STD.some(o => o.label === current));
  const outroVal = (outroSel && current !== '__OUTRO__') ? current : '';

  let html = `
    <div class="step-content">
      <h2 class="step-question">Como vai ganhar dinheiro?</h2>
      <p class="step-hint">Escolha o modelo principal.</p>
      <div class="options-grid" id="step5-options">
        ${OPTIONS.map(o => pillHtml(o, current)).join('')}
        <div class="option-pill more-options" id="show-more-5">
          <span class="option-pill-icon">${icon('grid-3x3', 16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>

      <div id="more-options-5" style="display:none;">
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
          <input type="text" class="outro-input" id="outro-5"
            placeholder="Descreva o seu modelo de receita..." value="${outroVal}">
        </div>
      ` : ''}
    </div>
  `;

  return html;
}

export function bind(onUpdate) {
  const showMore = document.getElementById('show-more-5');
  const moreC = document.getElementById('more-options-5');
  if (showMore && moreC) {
    const cur = getAnswer(5) || '';
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

  document.querySelectorAll('#step5-options .option-pill:not(.more-options), #more-options-5 .option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const v = pill.dataset.value;
      if (v === '__outro__') {
        setAnswer(5, '__OUTRO__');
        onUpdate();
        document.getElementById('step-content-wrapper').innerHTML = render();
        bind(onUpdate);
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => document.getElementById('outro-5')?.focus(), 100);
      } else {
        setAnswer(5, v);
        onUpdate();
        document.querySelectorAll('.option-pill').forEach(p => {
          p.classList.remove('selected');
          const c = p.querySelector('.option-pill-check');
          if (c) c.innerHTML = '';
        });
        pill.classList.add('selected');
        const c = pill.querySelector('.option-pill-check');
        if (c) { c.innerHTML = icon('check', 11); if (window.lucide) window.lucide.createIcons(); }
      }
    });
  });

  const outroInput = document.getElementById('outro-5');
  if (outroInput) {
    outroInput.addEventListener('input', e => {
      setAnswer(5, e.target.value.trim() || '__OUTRO__');
      onUpdate();
    });
  }
}
