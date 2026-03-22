var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n=13,r={1:`Negócio`,2:`Negócio`,3:`Mercado`,4:`Mercado`,5:`Modelo`,6:`Modelo`,7:`Marca`,8:`Marca`,9:`Marca`,10:`Contexto`,11:`Contexto`,12:`Contexto`,13:`Contexto`},i=`planai_form_v1`;function a(){try{let e=localStorage.getItem(i);return e?JSON.parse(e):null}catch{return null}}function o(){let e=a();return e?{currentStep:e.currentStep||1,answers:e.answers||{},subAnswers:e.subAnswers||{},nameSuggestions:e.nameSuggestions||[]}:{currentStep:1,answers:{},subAnswers:{},nameSuggestions:[]}}var s=o();function c(){try{localStorage.setItem(i,JSON.stringify({currentStep:s.currentStep,answers:s.answers,subAnswers:s.subAnswers,nameSuggestions:s.nameSuggestions}))}catch{}}function ee(){localStorage.removeItem(i)}function l(){let e=a();return e?e.currentStep>1||Object.keys(e.answers||{}).length>0:!1}function u(e,t){s.answers[e]=t,c()}function d(e){return s.answers[e]}function te(e,t){s.subAnswers[e]=t,c()}function ne(e){return s.subAnswers[e]||``}function re(e){s.nameSuggestions=e,c()}function ie(){return s.nameSuggestions}function ae(){return s.currentStep}function f(e){s.currentStep=Math.max(1,Math.min(n,e)),c()}function oe(){return n}function se(e){return r[e]||``}function ce(){return s.currentStep/n*100}function p(e){let t=s.answers[e];return t?Array.isArray(t)?t.filter(e=>e!==`__OUTRO__`).length>0:typeof t==`string`?t.trim().length>0&&t!==`__OUTRO__`:!0:!1}function m(){let e={},t={1:`Área de negócio`,2:`Fase do negócio`,3:`Problema que resolve`,4:`Cliente principal`,5:`Modelo de receita`,6:`Diferenciais competitivos`,7:`Nome do negócio`,8:`Estilo de logo`,9:`Tipo de logo`,10:`Localização / mercado geográfico`,11:`Equipa actual`,12:`Investimento disponível`,13:`Objectivo principal`};for(let r=1;r<=n;r++){let n=s.answers[r];if(n)if(Array.isArray(n)){let i=n.filter(e=>e!==`__OUTRO__`);i.length>0&&(e[t[r]]=i.join(`, `))}else typeof n==`string`&&n!==`__OUTRO__`&&(e[t[r]]=n)}if(Object.keys(s.subAnswers).length>0){e[`Detalhes adicionais`]={};for(let[t,n]of Object.entries(s.subAnswers))n&&n.trim()&&(e[`Detalhes adicionais`][t]=n)}return e}function h(){return localStorage.getItem(`planai_api_key`)||``}function le(e){localStorage.setItem(`planai_api_key`,e)}function g(){return!!h()}var ue=`https://openrouter.ai/api/v1/chat/completions`,de=`google/gemini-2.0-flash-exp:free`;async function fe(e,t=4e3){let n=h();if(!n)throw Error(`API key não configurada. Clique em ⚙️ para configurar.`);let r=new AbortController,i=setTimeout(()=>r.abort(),12e4),a;try{a=await fetch(ue,{method:`POST`,signal:r.signal,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${n}`,"HTTP-Referer":window.location.origin,"X-Title":`PlanAI - Business Plan Generator`},body:JSON.stringify({model:de,messages:e,max_tokens:t,temperature:.7})})}catch(e){throw clearTimeout(i),e.name===`AbortError`?Error(`Tempo esgotado (>2 min). Tente novamente.`):Error(`Sem ligação à internet ou API inacessível.`)}if(clearTimeout(i),!a.ok){let e=(await a.json().catch(()=>({}))).error?.message||`Erro HTTP ${a.status}`;throw a.status===401?Error(`API key inválida. Verifique em ⚙️.`):a.status===429?Error(`Limite de pedidos atingido. Aguarde 30 segundos e tente novamente.`):Error(e)}let o=await a.json();return{content:o.choices?.[0]?.message?.content||``,finishReason:o.choices?.[0]?.finish_reason||``}}async function _(e,t=4e3){let{content:n,finishReason:r}=await fe(e,t),i=n,a=0;for(;r===`length`&&a<3;){a++;let n=await fe([...e,{role:`assistant`,content:i},{role:`user`,content:`O texto foi cortado. Continua EXACTAMENTE de onde paraste, sem repetir o que já escreveste. Não repitas títulos nem secções já escritas.`}],t);i+=n.content,r=n.finishReason}return i}function v(e,t=[]){return Object.entries(e).filter(([e])=>!t.includes(e)).map(([e,t])=>`- ${e}: ${typeof t==`object`?JSON.stringify(t):t}`).join(`
`)}async function pe(e){let t=await _([{role:`system`,content:`És um especialista em branding e naming de empresas. Responde APENAS com uma lista JSON de nomes, sem explicação adicional.`},{role:`user`,content:`Com base nas seguintes informações de negócio, sugere exactamente 10 nomes criativos, memoráveis e profissionais para a empresa.\n\nInformações:\n${v(e,[`Nome do negócio`,`Estilo de logo`,`Tipo de logo`])}\n\nResponde APENAS com um array JSON de strings, exemplo: ["Nome1", "Nome2", ...]\nNão incluas explicações, apenas o array JSON.`}],600);try{let e=t.match(/\[[\s\S]*\]/);return e?JSON.parse(e[0]):[]}catch{return t.split(`
`).filter(e=>e.trim()).slice(0,10)}}async function me(e){return await _([{role:`system`,content:`És um consultor de negócios sénior especializado em criar Business Plans completos para o mercado angolano, prontos para apresentar a investidores, bancos (BDA, BPC) ou parceiros.

CONHECIMENTO DO MERCADO ANGOLANO:
- Economia parcialmente dolarizada, forte dependência do sector petrolífero, mercado informal significativo
- Classe média crescente em Luanda, desafios de logística no interior do país
- WhatsApp é o canal digital mais importante para negócios B2C em Angola
- PMEs angolanas enfrentam dificuldades de acesso a crédito bancário — sê realista quanto a financiamento
- Considera SEMPRE o impacto da inflação e variação cambial (AKZ/USD) nas projecções financeiras
- Fontes de financiamento disponíveis: BDA, BPC Empreendedores, INAPEM, FDES, investimento privado
- Quadro legal: GUE (Guichet Único da Empresa), AGT (Administração Geral Tributária), INSS, IAPI
- Fiscalidade: IPU, IRT, IVA — com taxas aplicáveis ao sector

REGRAS:
- Usa SEMPRE Kwanzas (Kz) como moeda principal, com equivalente USD entre parênteses onde relevante
- Contexto geográfico por defeito: Luanda, Angola (salvo indicação diferente)
- Português de Portugal, formatação Markdown rica (cabeçalhos, listas, tabelas)
- NUNCA interrompas texto a meio — escreve COMPLETO do início ao fim
- Nunca geres um plano genérico — cada plano deve reflectir a realidade específica do negócio, sector e localização
- Onde não há dados suficientes, usa estimativas fundamentadas na realidade angolana com nota explícita`},{role:`user`,content:`Cria um Business Plan profissional e completo com 14 secções com base nestes dados do empreendedor:

${v(e)}

Gera o plano completo com TODAS as seguintes secções, cada uma bem desenvolvida e detalhada:

# 1. SUMÁRIO EXECUTIVO
Resumo de 1–2 páginas: o que é o negócio e que problema resolve, mercado-alvo e dimensão da oportunidade, proposta de valor única, modelo de negócio resumido, equipa fundadora, necessidades de financiamento, projecções de crescimento a 3 anos, próximos passos imediatos (90 dias). Este sumário deve poder ficar sozinho — se alguém só ler esta parte, deve perceber o negócio na íntegra.

# 2. DESCRIÇÃO DO NEGÓCIO
- Nome e forma jurídica recomendada (SU por quotas, Sociedade por quotas, SA — com explicação de qual faz mais sentido)
- Visão (5–10 anos), Missão, Valores (3–5 alinhados com contexto angolano)
- Localização e infraestrutura necessária
- Fase actual (ideia, MVP, operação inicial, expansão)
- Modelo de negócio detalhado (como o dinheiro entra)

# 3. ANÁLISE DE MERCADO
## 3.1 Contexto Macroeconómico Angolano
PIB sectorial, tendências, dados do BNA/INE Angola quando aplicável, contexto SADC/África.
## 3.2 Dimensão do Mercado (TAM / SAM / SOM)
Estimativas fundamentadas com raciocínio.
## 3.3 Análise da Concorrência
Concorrentes directos (mínimo 3) e indirectos. Tabela comparativa de posicionamento.
## 3.4 Análise SWOT
Tabela com Forças, Fraquezas, Oportunidades e Ameaças (mínimo 4 cada), contextualizadas ao mercado angolano.
## 3.5 Segmentação de Clientes
2–3 segmentos com perfil detalhado (idade, comportamento de compra no mercado angolano, motivação, poder de compra).

# 4. PRODUTOS E SERVIÇOS
Descrição detalhada, proposta de valor por segmento, tabela de preços em Kz com justificação comparativa ao mercado angolano, ciclo de vida, pipeline de inovação, propriedade intelectual (orientação para registo no IAPI Angola).

# 5. ESTRATÉGIA DE MARKETING E VENDAS
## 5.1 Posicionamento
Como a marca se diferencia no mercado angolano.
## 5.2 Mix de Marketing (4Ps)
Produto, Preço (política em Kz/USD, descontos, condições de pagamento), Praça (presença física, app, redes sociais, parceiros), Promoção.
## 5.3 Canais Digitais Prioritários
WhatsApp Business (canal crítico em Angola), Instagram, Facebook, TikTok — com estratégia por canal.
## 5.4 Processo de Vendas
Funil detalhado do primeiro contacto ao pós-venda.
## 5.5 Metas de Vendas (12 meses)
Tabela mensal com clientes, ticket médio e receita.
## 5.6 Estratégia de Fidelização
Programa de fidelidade e retenção.
## 5.7 Orçamento de Marketing estimado.

# 6. PLANO OPERACIONAL
Modelo operacional dia-a-dia, processos-chave (mínimo 5), fornecedores (alternativas locais vs. importação, critérios de selecção), logística e distribuição (desafios específicos de Angola: vias, alfândega, armazém), tecnologia e sistemas (POS, plataformas digitais), controlo de qualidade, localização física com custo estimado em Kz.

# 7. ESTRUTURA DA EQUIPA
Organograma (fase inicial e escala), perfis-chave com responsabilidades, plano de recrutamento com timeline, política de remuneração (benchmarks de salários em Angola por função), cultura organizacional, formação e capacitação, parceiros estratégicos externos (consultores, contabilistas, juristas).

# 8. PLANO FINANCEIRO
*(Estimativas em AKZ com equivalente USD entre parênteses)*
## 8.1 Investimento Inicial
Tabela detalhada por categoria.
## 8.2 Pressupostos Financeiros
Taxa de câmbio AKZ/USD, inflação estimada, sazonalidade angolana, margens.
## 8.3 Projecção de Receitas (3 cenários)
Pessimista, Realista e Optimista para 3 anos.
## 8.4 Projecção de Custos (Ano 1)
Tabela trimestral com fixos, variáveis e outros.
## 8.5 Demonstração de Resultados Previsional
Tabela Ano 1, 2 e 3.
## 8.6 Fluxo de Caixa (12 meses)
Tabela mês a mês.
## 8.7 Ponto de Equilíbrio
Break-even em unidades e receita.
## 8.8 KPIs Financeiros
ROI, margem bruta, margem líquida, payback period.
## 8.9 Necessidades de Financiamento
Défice, opções disponíveis em Angola: BDA, BPC Empreendedores, INAPEM, FDES, microcrédito, investimento privado.

# 9. CRONOGRAMA DE IMPLEMENTAÇÃO
Roadmap dos primeiros 18 meses em 3 fases:
- Fase de Preparação (registos, infraestrutura, equipa)
- Fase de Lançamento (MVP, primeiros clientes, ajustes)
- Fase de Crescimento (escala, expansão, novos produtos)
12–15 marcos com responsável, custo estimado e critério de sucesso.

# 10. ANÁLISE DE RISCOS
Tabela com 8–10 riscos cobrindo obrigatoriamente: mercado, financeiros (câmbio, inflação, liquidez), operacionais (energia, logística, fornecimento), regulatórios/legais, equipa, macroeconómicos específicos de Angola. Cada um com Probabilidade × Impacto × Estratégia de Mitigação.

# 11. LEGALIZAÇÃO EM ANGOLA
Guia prático para o tipo de negócio:
- Forma jurídica recomendada e justificação
- Passos para constituição: reserva de nome (GUE), estatutos, depósito capital social, registo GUE, publicação Diário da República, inscrição AGT (NIF), inscrição INSS, licença de funcionamento (município), licenças sectoriais
- Custos estimados de constituição em Kz/USD
- Tempo estimado do processo
- Fiscalidade aplicável: IPU, IRT, IVA com taxas actuais
- Nota: "Recomenda-se consulta a advogado ou contabilista certificado para confirmação."

# 12. BRANDING E IDENTIDADE
Análise do nome proposto (ressonância cultural, memorabilidade), posicionamento da marca, tom de voz, elementos visuais (paleta de cores com justificação cultural, tipografia), plataformas digitais prioritárias, guia de presença no WhatsApp Business, registo da marca no IAPI, estratégia de conteúdo inicial.

# 13. GUIA DE LANÇAMENTO (90 DIAS)
**Mês 1 — Preparação:** checklist pré-lançamento, configuração digital (redes sociais, WhatsApp Business, Google My Business), estratégia para conseguir primeiros 10 clientes.
**Mês 2 — Lançamento:** evento/acção de lançamento adaptado ao orçamento, relações públicas (media angolanos), promoção de lançamento, recolha de testemunhos.
**Mês 3 — Ajuste e Aceleração:** análise resultados vs. projecções, ajustes com base em feedback real, primeiras parcerias, plano para meses 4–6.

# 14. CONCLUSÃO E PRÓXIMOS PASSOS
Resumo dos 3 pontos mais fortes do negócio, lista de acções imediatas (30/60/90 dias), apelo ao investidor se aplicável, declaração de compromisso do fundador, e os 3 próximos passos concretos para esta semana.

---

IMPORTANTE: Escreve TODAS as 14 secções de forma COMPLETA. Não interrompas nenhuma secção a meio. Não omitas nenhuma subsecção. Usa Kwanzas (Kz) em todos os valores financeiros com equivalente USD entre parênteses. Contextualiza TUDO para Angola/Luanda (salvo mercado geográfico diferente). O plano deve ser ambicioso mas credível — evita projecções irrealistas. Sê extremamente detalhado. O plano deve ter entre 5.000 e 8.000 palavras e ser digno de apresentação a investidores profissionais, bancos angolanos e internacionais.`}],12e3)}async function he(e){return await _([{role:`system`,content:`És um director criativo especializado em identidade visual e branding para o mercado angolano. Considera a ressonância cultural das cores, tipografia e elementos visuais no contexto de Angola/Luanda. Inclui orientação para registo da marca no IAPI (Instituto Angolano da Propriedade Industrial). Escreves em Português de Portugal. Usas formatação Markdown clara.`},{role:`user`,content:`Com base nos seguintes dados do negócio, cria um briefing completo de identidade visual para ser entregue a um designer gráfico ou usado para geração via IA de imagem (Midjourney, DALL-E, etc.):

${v(e)}

O briefing deve incluir as seguintes secções:

# BRIEFING DE IDENTIDADE VISUAL

## 1. Resumo do Negócio (para o designer)
Contexto em 3–5 frases sobre o que é o negócio, a quem se dirige e qual o tom de comunicação.

## 2. Personalidade da Marca
Lista de 6–8 adjectivos que descrevem a marca (ex: moderno, confiável, vibrante…) e explicação de como esses adjectivos se traduzem visualmente.

## 3. Directrizes de Cor
- Cor primária: nome, HEX sugerido, significado psicológico
- Cor secundária: nome, HEX sugerido, uso
- Cor de destaque: nome, HEX sugerido, uso
- Combinações a evitar

## 4. Tipografia Recomendada
- Fonte principal (títulos): nome + categoria + razão da escolha
- Fonte secundária (corpo): nome + categoria + razão
- Alternativas gratuitas (Google Fonts)

## 5. Estilo Visual do Logo
Descrição detalhada do estilo visual pretendido com base nas preferências fornecidas. Elementos visuais a incluir, formas, ícones ou símbolos relevantes para o sector.

## 6. O Que Evitar
Lista de elementos, estilos, cores ou referências que NÃO devem ser usados.

## 7. Referências e Inspirações
3–4 marcas/logos conhecidos que têm o estilo visual aproximado (com justificação).

## 8. Prompt de IA para Geração de Logo
Prompt completo e optimizado para usar no Midjourney, DALL-E ou Leonardo.ai para gerar o logo. Em inglês (para maior compatibilidade com IA de imagem).

## 9. Aplicações da Marca
Como o logo deve aparecer em: cartão de visita, perfil de redes sociais, website, embalagem (se aplicável), merchandising.

## 10. Especificações Técnicas de Entrega
Formatos de ficheiro necessários, tamanhos, versões (positivo/negativo, horizontal/quadrado, com/sem tagline).`}],3e3)}async function ge(e,t){let n=``;if(t)for(let e of[/(?:Prompt de IA|AI Prompt|Prompt para IA|Image Prompt)[^\n]*\n+([\s\S]*?)(?=\n##|\n#|$)/i,/(?:prompt|sugestão de prompt)[^\n]*[:]\s*["`]([^"`]+)["`]/i,/(?:prompt)[^\n]*\n+[>\-\*\s]*([^\n]{20,})/i]){let r=t.match(e);if(r){if(n=r[1].replace(/^[`\-\*>\s]+|[`\s]+$/g,``).trim(),n.length>=20)break;n=``}}if(!n||n.length<20){let t=e[`Área de negócio`]||`business`,r=e[`Estilo de logo`]||`modern minimal`,i=e[`Nome do negócio`]||``,a=e[`Tipo de logo`]||`wordmark`;n=`Professional ${r} logo design for a ${t} company${i?` called "${i}"`:``}. ${a} style. Clean vector illustration, white background, suitable for branding. High quality, scalable graphic.`}n+=` clean white background, professional logo vector graphics, minimalist, no text, no words`;let r=`https://image.pollinations.ai/prompt/${encodeURIComponent(n.substring(0,1e3))}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random()*1e4)}`;try{let e=await fetch(r);if(!e.ok)throw Error(`Falha ao aceder ao servidor de imagens.`);let t=await e.blob();return new Promise((e,n)=>{let i=new FileReader;i.onloadend=()=>e(i.result),i.onerror=()=>e(r),i.readAsDataURL(t)})}catch(e){return console.warn(`Fallback to direct URL due to fetch error:`,e),r}}async function _e(e){let t=await _([{role:`system`,content:`És um especialista em pitch decks para startups e PMEs no mercado angolano. Crias apresentações concisas e impactantes. Usa Kwanzas (Kz) nos valores financeiros com equivalente USD entre parênteses. Contexto por defeito: Luanda, Angola. Respondes APENAS com um array JSON válido de slides, sem texto adicional antes ou depois.`},{role:`user`,content:`Com base nos seguintes dados do negócio, cria um pitch deck de 8 slides.

        ${v(e)}

Responde APENAS com um array JSON com exactamente 8 objectos, cada um com esta estrutura:
    {
        "slide": número(1 - 8),
            "title": "título do slide",
                "subtitle": "subtítulo ou tagline (opcional, pode ser vazio)",
                    "points": ["ponto 1", "ponto 2", "ponto 3"],
                        "highlight": "estatística ou frase de impacto (breve, máx 15 palavras)",
                            "icon": "emoji representativo"
    }

Os 8 slides devem ser:
    1. Capa / Visão Geral(nome, slogan, proposta de valor em 1 frase)
    2. O Problema(dor real do mercado angolano que o negócio resolve)
    3. A Nossa Solução(como resolve, diferencial competitivo)
    4. Mercado em Angola(TAM / SAM / SOM em Kz, tendências locais)
    5. Modelo de Negócio(como entra o dinheiro, preços em Kz, margens)
    6. Traction & Validação(progresso até agora, métricas, testemunhos)
    7. Equipa & Legalização(fundadores, forma jurídica, passos no GUE)
    8. O Pedido(financiamento necessário em Kz / USD, uso dos fundos, próximos passos 90 dias)

Todos os valores em Kwanzas(Kz) com USD entre parênteses.
Responde APENAS com o array JSON, começando com[e terminando com ]. Sem explicações.`}],2500);try{let e=t.match(/\[[\s\S]*\]/);return e?JSON.parse(e[0]):[]}catch{return[]}}var y=(e,t=18,n=``)=>`<i data-lucide="${e}" class="icon ${n}" style="width:${t}px;height:${t}px;flex-shrink:0;"></i>`,ve=t({bind:()=>xe,render:()=>be}),b=[{id:`tech`,icon:`monitor`,label:`Tecnologia / Software`},{id:`food`,icon:`utensils`,label:`Restauração / Alimentação`},{id:`health`,icon:`heart-pulse`,label:`Saúde / Clínicas`},{id:`education`,icon:`book-open`,label:`Educação / Formação`},{id:`retail`,icon:`shopping-bag`,label:`Retalho / Comércio`},{id:`realestate`,icon:`building-2`,label:`Imobiliário`},{id:`logistics`,icon:`truck`,label:`Logística / Transporte`},{id:`finance`,icon:`landmark`,label:`Serviços Financeiros`}],x=[{id:`tourism`,icon:`plane`,label:`Turismo / Hotelaria`},{id:`beauty`,icon:`sparkles`,label:`Beleza / Estética`},{id:`agriculture`,icon:`leaf`,label:`Agricultura / Agro`},{id:`entertainment`,icon:`film`,label:`Entretenimento / Média`},{id:`construction`,icon:`hard-hat`,label:`Construção / Engenharia`},{id:`consulting`,icon:`bar-chart-2`,label:`Consultoria`}];function ye(e,t){let n=t===e.label?`selected`:``;return`
    <div class="option-pill ${n}" data-value="${e.label}">
      <span class="option-pill-icon">${y(e.icon,16)}</span>
      <span class="option-pill-text">${e.label}</span>
      <span class="option-pill-check">${n?y(`check`,11):``}</span>
    </div>
  `}function be(){let e=d(1)||``,t=e&&![...b,...x].some(t=>t.label===e);return`
    <div class="step-content">
      <h2 class="step-question">Em que área actua o seu negócio?</h2>
      <p class="step-hint">Escolha a que mais se aproxima.</p>
      <div class="options-grid" id="step1-options">
        ${b.map(t=>ye(t,e)).join(``)}
        <div class="option-pill more-options" id="show-more-1">
          <span class="option-pill-icon">${y(`grid-3x3`,16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>

      <div id="more-options-1" style="display:none;">
        <div class="options-grid">
          ${x.map(t=>ye(t,e)).join(``)}
          <div class="option-pill ${t?`selected`:``}" data-value="__outro__">
            <span class="option-pill-icon">${y(`pen-line`,16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${t?y(`check`,11):``}</span>
          </div>
        </div>
      </div>

      ${t?`
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-1"
            placeholder="Escreva a sua área de negócio..." value="${e}">
        </div>
      `:``}
    </div>
  `}function xe(e){let t=document.getElementById(`show-more-1`),n=document.getElementById(`more-options-1`);if(t&&n){let e=d(1)||``;(x.some(t=>t.label===e)||e&&!b.some(t=>t.label===e)&&e!==`__outro__`)&&(n.style.display=`block`,t.style.display=`none`),t.addEventListener(`click`,()=>{n.style.display=`block`,t.style.display=`none`,n.style.animation=`fadeInUp 0.3s ease-out`,window.lucide&&window.lucide.createIcons()})}document.querySelectorAll(`#step1-options .option-pill:not(.more-options), #more-options-1 .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.value;if(n===`__outro__`)u(1,``),e(),document.getElementById(`step-content-wrapper`).innerHTML=be(),xe(e),window.lucide&&window.lucide.createIcons(),setTimeout(()=>document.getElementById(`outro-1`)?.focus(),100);else{u(1,n),e(),document.querySelectorAll(`.option-pill`).forEach(e=>{e.classList.remove(`selected`);let t=e.querySelector(`.option-pill-check`);t&&(t.innerHTML=``)}),t.classList.add(`selected`);let r=t.querySelector(`.option-pill-check`);r&&(r.innerHTML=y(`check`,11),window.lucide&&window.lucide.createIcons())}})});let r=document.getElementById(`outro-1`);r&&r.addEventListener(`input`,t=>{u(1,t.target.value),e()})}var Se=t({bind:()=>C,render:()=>S}),Ce=[{id:`no-idea`,label:`Não tenho nenhuma ideia como tal`,icon:`brain`},{id:`idea-only`,label:`Só tenho a ideia`,icon:`lightbulb`},{id:`tested`,label:`Já testei com alguns clientes`,icon:`flask-conical`},{id:`revenue`,label:`Já gero receita`,icon:`trending-up`},{id:`scale`,label:`Quero escalar o que já existe`,icon:`rocket`}],we={"no-idea":[{key:`interest`,label:`Que temas ou áreas te interessam mais?`,placeholder:`Ex: tecnologia, alimentação saudável, moda…`},{key:`skills`,label:`Que competências ou experiência tens?`,placeholder:`Ex: programação, cozinha, vendas, design…`}],"idea-only":[{key:`idea-desc`,label:`Descreve a tua ideia em poucas palavras`,placeholder:`Ex: Uma app que conecta personal trainers a clientes…`},{key:`motivation`,label:`O que te motivou a pensar nesta ideia?`,placeholder:`Ex: Vi uma necessidade no mercado, experiência pessoal…`}],tested:[{key:`feedback`,label:`Qual foi o feedback dos primeiros clientes?`,placeholder:`Ex: Gostaram do conceito mas pediram mais funcionalidades…`},{key:`test-size`,label:`Com quantas pessoas já testaste?`,placeholder:`Ex: 5 amigos, 20 clientes, 100 utilizadores beta…`}],revenue:[{key:`monthly-rev`,label:`Qual é a receita mensal aproximada?`,placeholder:`Ex: 500€, 2000€, 10 000€…`},{key:`main-product`,label:`Que produto/serviço gera mais receita?`,placeholder:`Ex: Consultoria, venda de produto X, subscrições…`}],scale:[{key:`bottleneck`,label:`Qual é o principal obstáculo ao crescimento?`,placeholder:`Ex: Falta de capital, equipa pequena, marketing…`},{key:`scale-goal`,label:`Que objectivo queres atingir nos próximos 12 meses?`,placeholder:`Ex: Duplicar receita, entrar em novo mercado, 1000 clientes…`}]};function S(){let e=d(2)||``,t=Ce.find(t=>t.label===e),n=`
    <div class="step-content">
      <h2 class="step-question">Em que fase está o seu negócio?</h2>
      <p class="step-hint">Seja honesto — não há resposta errada.</p>
      <div class="options-grid" id="step2-options">
        ${Ce.map(t=>{let n=e===t.label?`selected`:``;return`
            <div class="option-pill ${n}" data-value="${t.label}" data-phase="${t.id}">
              <span class="option-pill-icon">${y(t.icon,16)}</span>
              <span class="option-pill-text">${t.label}</span>
              <span class="option-pill-check">${n?y(`check`,11):``}</span>
            </div>
          `}).join(``)}
      </div>
  `;return t&&we[t.id]&&(n+=`<div class="sub-questions" id="sub-questions-2">`,we[t.id].forEach(e=>{let t=ne(e.key)||``;n+=`
        <label class="sub-question-label">${e.label}</label>
        <input type="text" class="sub-question-input" data-key="${e.key}"
          placeholder="${e.placeholder}" value="${t}">
      `}),n+=`</div>`),n+=`</div>`,n}function C(e){document.querySelectorAll(`#step2-options .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{u(2,t.dataset.value),e(),document.getElementById(`step-content-wrapper`).innerHTML=S(),C(e),window.lucide&&window.lucide.createIcons()})}),document.querySelectorAll(`.sub-question-input`).forEach(e=>{e.addEventListener(`input`,e=>te(e.target.dataset.key,e.target.value))})}var Te=t({bind:()=>O,render:()=>D}),w=[{icon:`clock`,label:`Poupa tempo`},{icon:`wallet`,label:`Poupa dinheiro`},{icon:`repeat-2`,label:`Substitui algo caro/difícil`},{icon:`unlock`,label:`Acesso a algo inexistente`},{icon:`thumbs-up`,label:`Melhora uma experiência má`}],T=[{icon:`users`,label:`Conecta pessoas/negócios`},{icon:`shield`,label:`Aumenta segurança`},{icon:`trending-up`,label:`Aumenta produtividade`},{icon:`globe`,label:`Resolve problema social/ambiental`}];function E(e,t){let n=t===e.label?`selected`:``;return`
    <div class="option-pill ${n}" data-value="${e.label}">
      <span class="option-pill-icon">${y(e.icon,16)}</span>
      <span class="option-pill-text">${e.label}</span>
      <span class="option-pill-check">${n?y(`check`,11):``}</span>
    </div>
  `}function D(){let e=d(3)||``,t=e&&![...w,...T].some(t=>t.label===e);return`
    <div class="step-content">
      <h2 class="step-question">Qual é o principal problema que resolve?</h2>
      <p class="step-hint">Pense no cliente, não no produto.</p>
      <div class="options-grid" id="step3-options">
        ${w.map(t=>E(t,e)).join(``)}
        <div class="option-pill more-options" id="show-more-3">
          <span class="option-pill-icon">${y(`grid-3x3`,16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>
      <div id="more-options-3" style="display:none;">
        <div class="options-grid">
          ${T.map(t=>E(t,e)).join(``)}
          <div class="option-pill ${t?`selected`:``}" data-value="__outro__">
            <span class="option-pill-icon">${y(`pen-line`,16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${t?y(`check`,11):``}</span>
          </div>
        </div>
      </div>
      ${t?`
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-3"
            placeholder="Descreva o problema que resolve..." value="${e}">
        </div>
      `:``}
    </div>
  `}function O(e){let t=document.getElementById(`show-more-3`),n=document.getElementById(`more-options-3`);if(t&&n){let e=d(3)||``;(T.some(t=>t.label===e)||e&&!w.some(t=>t.label===e))&&(n.style.display=`block`,t.style.display=`none`),t.addEventListener(`click`,()=>{n.style.display=`block`,t.style.display=`none`,n.style.animation=`fadeInUp 0.3s ease-out`,window.lucide&&window.lucide.createIcons()})}document.querySelectorAll(`#step3-options .option-pill:not(.more-options), #more-options-3 .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.value;if(n===`__outro__`)u(3,``),e(),document.getElementById(`step-content-wrapper`).innerHTML=D(),O(e),window.lucide&&window.lucide.createIcons(),setTimeout(()=>document.getElementById(`outro-3`)?.focus(),100);else{u(3,n),e(),document.querySelectorAll(`.option-pill`).forEach(e=>{e.classList.remove(`selected`);let t=e.querySelector(`.option-pill-check`);t&&(t.innerHTML=``)}),t.classList.add(`selected`);let r=t.querySelector(`.option-pill-check`);r&&(r.innerHTML=y(`check`,11),window.lucide&&window.lucide.createIcons())}})});let r=document.getElementById(`outro-3`);r&&r.addEventListener(`input`,t=>{u(3,t.target.value),e()})}var Ee=t({bind:()=>De,render:()=>M}),k=[{icon:`user`,label:`Jovens 18–30`},{icon:`user-check`,label:`Adultos 30–50`},{icon:`store`,label:`Empresas pequenas`},{icon:`building-2`,label:`Grandes empresas`},{icon:`landmark`,label:`Governo / Instituições`},{icon:`users`,label:`Famílias`}],A=[{icon:`user-cog`,label:`Seniores 50+`},{icon:`graduation-cap`,label:`Estudantes`},{icon:`laptop`,label:`Freelancers`},{icon:`globe`,label:`Mercado internacional`},{icon:`heart-pulse`,label:`Profissionais de saúde`}];function j(e,t){let n=t.includes(e.label)?`selected`:``;return`
    <div class="option-pill ${n}" data-value="${e.label}">
      <span class="option-pill-icon">${y(e.icon,16)}</span>
      <span class="option-pill-text">${e.label}</span>
      <span class="option-pill-check">${n?y(`check`,11):``}</span>
    </div>
  `}function M(){let e=d(4)||[],t=[...k,...A],n=e.some(e=>!t.some(t=>t.label===e)),r=n?e.find(e=>!t.some(t=>t.label===e)):``;return`
    <div class="step-content">
      <h2 class="step-question">Quem é o seu cliente principal?</h2>
      <p class="step-hint">Pode escolher mais de um.</p>
      <div class="options-grid" id="step4-options">
        ${k.map(t=>j(t,e)).join(``)}
        <div class="option-pill more-options" id="show-more-4">
          <span class="option-pill-icon">${y(`grid-3x3`,16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>
      <div id="more-options-4" style="display:none;">
        <div class="options-grid">
          ${A.map(t=>j(t,e)).join(``)}
          <div class="option-pill ${n?`selected`:``}" data-value="__outro__">
            <span class="option-pill-icon">${y(`pen-line`,16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${n?y(`check`,11):``}</span>
          </div>
        </div>
      </div>
      ${n?`
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-4"
            placeholder="Descreva o seu cliente..." value="${r}">
        </div>
      `:``}
    </div>
  `}function De(e){let t=[...k,...A],n=document.getElementById(`show-more-4`),r=document.getElementById(`more-options-4`);if(n&&r){let e=d(4)||[];(A.some(t=>e.includes(t.label))||e.some(e=>!k.some(t=>t.label===e)))&&(r.style.display=`block`,n.style.display=`none`),n.addEventListener(`click`,()=>{r.style.display=`block`,n.style.display=`none`,r.style.animation=`fadeInUp 0.3s ease-out`,window.lucide&&window.lucide.createIcons()})}document.querySelectorAll(`#step4-options .option-pill:not(.more-options), #more-options-4 .option-pill`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.value,i=[...d(4)||[]];if(r===`__outro__`){i.some(e=>!t.some(t=>t.label===e))&&(i=i.filter(e=>t.some(t=>t.label===e))),u(4,i),e(),document.getElementById(`step-content-wrapper`).innerHTML=M(),De(e),window.lucide&&window.lucide.createIcons(),setTimeout(()=>document.getElementById(`outro-4`)?.focus(),100);return}i.includes(r)?i=i.filter(e=>e!==r):i.push(r),u(4,i),e(),n.classList.toggle(`selected`);let a=n.querySelector(`.option-pill-check`);a&&(a.innerHTML=n.classList.contains(`selected`)?y(`check`,11):``,window.lucide&&window.lucide.createIcons())})});let i=document.getElementById(`outro-4`);i&&i.addEventListener(`input`,n=>{let r=(d(4)||[]).filter(e=>t.some(t=>t.label===e));n.target.value.trim()&&r.push(n.target.value.trim()),u(4,r),e()})}var Oe=t({bind:()=>Me,render:()=>je}),N=[{id:`subscription`,icon:`calendar`,label:`Subscrição mensal / anual`},{id:`one-time`,icon:`shopping-cart`,label:`Venda única por produto`},{id:`commission`,icon:`percent`,label:`Comissão por transacção`},{id:`ads`,icon:`megaphone`,label:`Publicidade`},{id:`freemium`,icon:`gift`,label:`Freemium (gratuito + pago)`},{id:`projects`,icon:`clipboard-list`,label:`Projectos / Consultoria`}],P=[{id:`licensing`,icon:`file-badge`,label:`Licenciamento`},{id:`marketplace`,icon:`store`,label:`Marketplace / Intermediação`},{id:`saas`,icon:`cloud`,label:`SaaS (Software as a Service)`},{id:`courses`,icon:`graduation-cap`,label:`Formação / Cursos`},{id:`rental`,icon:`key`,label:`Aluguer / Arrendamento`},{id:`wholesale`,icon:`package`,label:`Venda por grosso`}],ke=[...N,...P];function Ae(e,t){let n=t===e.label?`selected`:``;return`
    <div class="option-pill ${n}" data-value="${e.label}">
      <span class="option-pill-icon">${y(e.icon,16)}</span>
      <span class="option-pill-text">${e.label}</span>
      <span class="option-pill-check">${n?y(`check`,11):``}</span>
    </div>
  `}function je(){let e=d(5)||``,t=e===`__OUTRO__`||e&&!ke.some(t=>t.label===e),n=t&&e!==`__OUTRO__`?e:``;return`
    <div class="step-content">
      <h2 class="step-question">Como vai ganhar dinheiro?</h2>
      <p class="step-hint">Escolha o modelo principal.</p>
      <div class="options-grid" id="step5-options">
        ${N.map(t=>Ae(t,e)).join(``)}
        <div class="option-pill more-options" id="show-more-5">
          <span class="option-pill-icon">${y(`grid-3x3`,16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>

      <div id="more-options-5" style="display:none;">
        <div class="options-grid">
          ${P.map(t=>Ae(t,e)).join(``)}
          <div class="option-pill ${t?`selected`:``}" data-value="__outro__">
            <span class="option-pill-icon">${y(`pen-line`,16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${t?y(`check`,11):``}</span>
          </div>
        </div>
      </div>

      ${t?`
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-5"
            placeholder="Descreva o seu modelo de receita..." value="${n}">
        </div>
      `:``}
    </div>
  `}function Me(e){let t=document.getElementById(`show-more-5`),n=document.getElementById(`more-options-5`);if(t&&n){let e=d(5)||``;(P.some(t=>t.label===e)||e&&!N.some(t=>t.label===e))&&(n.style.display=`block`,t.style.display=`none`),t.addEventListener(`click`,()=>{n.style.display=`block`,t.style.display=`none`,n.style.animation=`fadeInUp 0.3s ease-out`,window.lucide&&window.lucide.createIcons()})}document.querySelectorAll(`#step5-options .option-pill:not(.more-options), #more-options-5 .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.value;if(n===`__outro__`)u(5,`__OUTRO__`),e(),document.getElementById(`step-content-wrapper`).innerHTML=je(),Me(e),window.lucide&&window.lucide.createIcons(),setTimeout(()=>document.getElementById(`outro-5`)?.focus(),100);else{u(5,n),e(),document.querySelectorAll(`.option-pill`).forEach(e=>{e.classList.remove(`selected`);let t=e.querySelector(`.option-pill-check`);t&&(t.innerHTML=``)}),t.classList.add(`selected`);let r=t.querySelector(`.option-pill-check`);r&&(r.innerHTML=y(`check`,11),window.lucide&&window.lucide.createIcons())}})});let r=document.getElementById(`outro-5`);r&&r.addEventListener(`input`,t=>{u(5,t.target.value.trim()||`__OUTRO__`),e()})}var Ne=t({bind:()=>V,render:()=>B}),F=[{id:`price`,icon:`badge-dollar-sign`,label:`Preço mais acessível`},{id:`speed`,icon:`zap`,label:`Mais rápido`},{id:`simplicity`,icon:`target`,label:`Mais simples de usar`},{id:`local`,icon:`map-pin`,label:`Focado no mercado local`},{id:`support`,icon:`headphones`,label:`Melhor suporte`},{id:`tech`,icon:`cpu`,label:`Tecnologia exclusiva`},{id:`custom`,icon:`sliders`,label:`Personalização`}],I=[{id:`quality`,icon:`award`,label:`Qualidade superior`},{id:`sustainability`,icon:`leaf`,label:`Sustentabilidade`},{id:`security`,icon:`shield`,label:`Maior segurança`},{id:`mobile`,icon:`smartphone`,label:`Experiência mobile`},{id:`ai`,icon:`bot`,label:`Inteligência artificial`},{id:`delivery`,icon:`truck`,label:`Entrega rápida / ao domicílio`},{id:`trust`,icon:`handshake`,label:`Confiança / reputação local`}],L=3,R=[...F,...I];function z(e){return e!==`__OUTRO__`&&!R.some(t=>t.label===e)}function Pe(e,t){let n=t.includes(e.label)?`selected`:``;return`
    <div class="option-pill ${n} ${!n&&t.filter(e=>e!==`__OUTRO__`).length>=L?`disabled`:``}" data-value="${e.label}">
      <span class="option-pill-icon">${y(e.icon,16)}</span>
      <span class="option-pill-text">${e.label}</span>
      <span class="option-pill-check">${n?y(`check`,11):``}</span>
    </div>
  `}function B(){let e=d(6)||[],t=e.includes(`__OUTRO__`)||e.some(z),n=e.find(z)||``,r=e.filter(e=>!z(e)||e!==`__OUTRO__`).length;return`
    <div class="step-content">
      <h2 class="step-question">O que torna a sua oferta diferente?</h2>
      <p class="step-hint">Escolha até ${L}. (${e.filter(e=>e!==`__OUTRO__`).length}/${L} selecionados)</p>
      <div class="options-grid" id="step6-options">
        ${F.map(t=>Pe(t,e)).join(``)}
        <div class="option-pill more-options" id="show-more-6">
          <span class="option-pill-icon">${y(`grid-3x3`,16)}</span>
          <span class="option-pill-text">Mais opções</span>
        </div>
      </div>

      <div id="more-options-6" style="display:none;">
        <div class="options-grid">
          ${I.map(t=>Pe(t,e)).join(``)}
          <div class="option-pill ${t?`selected`:``} ${!t&&r>=L?`disabled`:``}" data-value="__outro__">
            <span class="option-pill-icon">${y(`pen-line`,16)}</span>
            <span class="option-pill-text">Outro</span>
            <span class="option-pill-check">${t?y(`check`,11):``}</span>
          </div>
        </div>
      </div>

      ${t?`
        <div class="outro-input-wrapper">
          <input type="text" class="outro-input" id="outro-6"
            placeholder="Descreva o seu diferencial..." value="${n}">
        </div>
      `:``}
    </div>
  `}function V(e){let t=document.getElementById(`show-more-6`),n=document.getElementById(`more-options-6`);if(t&&n){let e=d(6)||[];(I.some(t=>e.includes(t.label))||e.some(e=>!F.some(t=>t.label===e)))&&(n.style.display=`block`,t.style.display=`none`),t.addEventListener(`click`,()=>{n.style.display=`block`,t.style.display=`none`,n.style.animation=`fadeInUp 0.3s ease-out`,window.lucide&&window.lucide.createIcons()})}document.querySelectorAll(`#step6-options .option-pill:not(.more-options), #more-options-6 .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{if(t.classList.contains(`disabled`))return;let n=t.dataset.value,r=[...d(6)||[]];if(n===`__outro__`){r.includes(`__OUTRO__`)||r.some(z)?r=r.filter(e=>e!==`__OUTRO__`&&!z(e)):r.push(`__OUTRO__`),u(6,r),e(),document.getElementById(`step-content-wrapper`).innerHTML=B(),V(e),window.lucide&&window.lucide.createIcons(),setTimeout(()=>document.getElementById(`outro-6`)?.focus(),100);return}r.includes(n)?r=r.filter(e=>e!==n):r.filter(e=>e!==`__OUTRO__`).length<L&&r.push(n),u(6,r),e(),document.getElementById(`step-content-wrapper`).innerHTML=B(),V(e),window.lucide&&window.lucide.createIcons()})});let r=document.getElementById(`outro-6`);r&&r.addEventListener(`input`,t=>{let n=(d(6)||[]).filter(e=>R.some(t=>t.label===e)),r=t.target.value.trim();n.push(r||`__OUTRO__`),u(6,n),e()})}var Fe=t({bind:()=>W,render:()=>U}),H=!1;function U(){let e=d(7)||``,t=ie(),n=`
    <div class="step-content">
      <h2 class="step-question">Tem nome para o negócio?</h2>
      <p class="step-hint">Escreva o nome ou peça sugestões à IA.</p>

      <div class="name-input-section">
        <input type="text" class="name-large-input" id="name-input"
          placeholder="O nome do seu negócio..." value="${e}" autocomplete="off">
      </div>

      <div class="name-divider">ou peça sugestões à IA</div>

      <div class="name-suggestions-container" id="suggestions-container">
  `;return H?n+=`
      <div style="text-align:center; padding: var(--space-xl);">
        <div class="loading-spinner">A gerar sugestões...</div>
      </div>
    `:t.length>0?(n+=`<div class="name-suggestions-grid">`,t.forEach(t=>{n+=`<div class="name-suggestion ${e===t?`selected`:``}" data-name="${t}">${t}</div>`}),n+=`</div>`,n+=`
      <div style="text-align:center; margin-top: var(--space-md);">
        <button class="btn btn-secondary btn-sm" id="generate-more-btn">
          ${y(`rotate-ccw`,13)} Gerar mais sugestões
        </button>
      </div>
    `):n+=`
      <div style="text-align:center;">
        <button class="btn btn-secondary" id="generate-names-btn" ${g()?``:`disabled title="Configure a API key primeiro"`}>
          ${y(`sparkles`,15)} Gerar 10 sugestões de nome
        </button>
        ${g()?``:`<p style="color:var(--text-muted);font-size:var(--text-xs);margin-top:var(--space-sm);">Configure a API key nas definições</p>`}
      </div>
    `,n+=`</div></div>`,n}function W(e){window.lucide&&window.lucide.createIcons();let t=document.getElementById(`name-input`);t&&t.addEventListener(`input`,t=>{u(7,t.target.value),e(),document.querySelectorAll(`.name-suggestion`).forEach(e=>e.classList.remove(`selected`))});let n=async()=>{H=!0;let t=document.getElementById(`step-content-wrapper`);t&&(t.innerHTML=U(),W(e));try{re(await pe(m()))}catch(e){console.error(`Error generating names:`,e),re([]),alert(`Erro ao gerar sugestões: `+e.message)}H=!1;let n=document.getElementById(`step-content-wrapper`);n&&(n.innerHTML=U(),W(e)),window.lucide&&window.lucide.createIcons()},r=document.getElementById(`generate-names-btn`),i=document.getElementById(`generate-more-btn`);r&&r.addEventListener(`click`,n),i&&i.addEventListener(`click`,n),document.querySelectorAll(`.name-suggestion`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.name;u(7,n),e();let r=document.getElementById(`name-input`);r&&(r.value=n),document.querySelectorAll(`.name-suggestion`).forEach(e=>e.classList.remove(`selected`)),t.classList.add(`selected`)})})}var Ie=t({bind:()=>ze,render:()=>Re}),Le=[{id:`modern`,icon:`minimize-2`,label:`Moderno e minimalista`,desc:`Clean, espaço em branco, linhas simples`},{id:`corporate`,icon:`briefcase`,label:`Corporativo e sério`,desc:`Profissional, confiança, elegância`},{id:`creative`,icon:`brush`,label:`Criativo e colorido`,desc:`Vibrante, divertido, expressivo`},{id:`tech`,icon:`cpu`,label:`Tecnológico / Futurista`,desc:`Inovador, digital, vanguarda`},{id:`traditional`,icon:`shield`,label:`Tradicional e confiável`,desc:`Clássico, estabelecido, atemporal`}];function Re(){let e=d(8)||``;return`
    <div class="step-content">
      <h2 class="step-question">Que estilo de logo prefere?</h2>
      <p class="step-hint">Pense na impressão que quer causar.</p>
      <div class="visual-cards-grid" id="step8-options">
        ${Le.map(t=>`
            <div class="visual-card ${e===t.label?`selected`:``}" data-value="${t.label}">
              <div class="visual-card-icon">${y(t.icon,20)}</div>
              <div class="visual-card-title">${t.label}</div>
              <div class="visual-card-desc">${t.desc}</div>
            </div>
          `).join(``)}
      </div>
    </div>
  `}function ze(e){document.querySelectorAll(`#step8-options .visual-card`).forEach(t=>{t.addEventListener(`click`,()=>{u(8,t.dataset.value),e(),document.querySelectorAll(`.visual-card`).forEach(e=>e.classList.remove(`selected`)),t.classList.add(`selected`)})})}var Be=t({bind:()=>Ue,render:()=>He}),Ve=[{id:`wordmark`,icon:`type`,label:`Logótipo (Wordmark)`,desc:`O nome da marca estilizado`,examples:`Coca-Cola, Google, Samsung`},{id:`lettermark`,icon:`a-large-small`,label:`Monograma (Lettermark)`,desc:`Iniciais ou abreviação`,examples:`IBM, NASA, HBO`},{id:`brandmark`,icon:`pentagon`,label:`Símbolo / Ícone (Brandmark)`,desc:`Um ícone ou símbolo isolado`,examples:`Apple, Nike, Twitter`},{id:`combination`,icon:`layout-template`,label:`Logo Combinado`,desc:`Ícone + texto juntos`,examples:`Adidas, Burger King`},{id:`emblem`,icon:`shield`,label:`Emblema`,desc:`Texto dentro de um símbolo`,examples:`Starbucks, Harley-Davidson`},{id:`mascot`,icon:`user-round`,label:`Mascote`,desc:`Um personagem ilustrado`,examples:`KFC, Michelin`},{id:`abstract`,icon:`hexagon`,label:`Logo Abstrato`,desc:`Forma geométrica abstracta`,examples:`Pepsi, Airbnb`}];function He(){let e=d(9)||``;return`
    <div class="step-content">
      <h2 class="step-question">Que elementos quer na logo?</h2>
      <p class="step-hint">Escolher apenas um.</p>
      <div class="visual-cards-grid" id="step9-options">
        ${Ve.map(t=>`
            <div class="visual-card ${e===t.label?`selected`:``}" data-value="${t.label}">
              <div class="visual-card-icon">${y(t.icon,20)}</div>
              <div class="visual-card-title">${t.label}</div>
              <div class="visual-card-desc">${t.desc}</div>
              <div class="visual-card-desc" style="margin-top:4px;color:var(--text-accent);font-weight:500;">Ex: ${t.examples}</div>
            </div>
          `).join(``)}
      </div>
    </div>
  `}function Ue(e){document.querySelectorAll(`#step9-options .visual-card`).forEach(t=>{t.addEventListener(`click`,()=>{u(9,t.dataset.value),e(),document.querySelectorAll(`.visual-card`).forEach(e=>e.classList.remove(`selected`)),t.classList.add(`selected`)})})}var We=t({bind:()=>qe,render:()=>Ke}),Ge=[{icon:`wifi`,label:`Apenas online`,desc:`Sem localizacao fisica`},{icon:`map-pin`,label:`Local (cidade/bairro)`,desc:`Mercado concentrado`},{icon:`map`,label:`Regional`,desc:`Varias cidades ou regioes`},{icon:`flag`,label:`Nacional`,desc:`Todo o pais`},{icon:`globe`,label:`Internacional`,desc:`Multiplos paises`}];function Ke(){let e=d(10)||``;return`
    <div class="step-content">
      <h2 class="step-question">Onde vai operar o seu negocio?</h2>
      <p class="step-hint">Onde estao os seus clientes principais?</p>
      <div class="options-grid" id="step10-options">${Ge.map(t=>{let n=e===t.label?`selected`:``;return`
      <div class="option-pill ${n}" data-value="${t.label}">
        <span class="option-pill-icon">${y(t.icon,16)}</span>
        <div class="option-pill-body">
          <span class="option-pill-text">${t.label}</span>
          <span class="option-pill-desc">${t.desc}</span>
        </div>
        <span class="option-pill-check">${n?y(`check`,11):``}</span>
      </div>`}).join(``)}</div>
    </div>`}function qe(e){window.lucide&&window.lucide.createIcons(),document.querySelectorAll(`#step10-options .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{u(10,t.dataset.value),e(),document.querySelectorAll(`#step10-options .option-pill`).forEach(e=>{let n=e.dataset.value===t.dataset.value;e.classList.toggle(`selected`,n);let r=e.querySelector(`.option-pill-check`);r&&(r.innerHTML=n?y(`check`,11):``)}),window.lucide&&window.lucide.createIcons()})})}var Je=t({bind:()=>Ze,render:()=>Xe}),Ye=[{icon:`user`,label:`Trabalho sozinho(a)`,desc:`Fundador único, sem equipa`},{icon:`users`,label:`Co-fundadores (2-3 pessoas)`,desc:`Parceiros de negócio`},{icon:`users-round`,label:`Pequena equipa (até 10)`,desc:`Equipa já formada`},{icon:`building-2`,label:`Equipa média (10-50)`,desc:`Estrutura mais formal`},{icon:`search`,label:`Estou a recrutar`,desc:`A construir a equipa`}];function Xe(){let e=d(11)||``;return`
    <div class="step-content">
      <h2 class="step-question">Como é a sua equipa?</h2>
      <p class="step-hint">Quem está a trabalhar neste projecto?</p>
      <div class="options-grid" id="step11-options">${Ye.map(t=>{let n=e===t.label?`selected`:``;return`
      <div class="option-pill ${n}" data-value="${t.label}">
        <span class="option-pill-icon">${y(t.icon,16)}</span>
        <div class="option-pill-body">
          <span class="option-pill-text">${t.label}</span>
          <span class="option-pill-desc">${t.desc}</span>
        </div>
        <span class="option-pill-check">${n?y(`check`,11):``}</span>
      </div>`}).join(``)}</div>
    </div>`}function Ze(e){window.lucide&&window.lucide.createIcons(),document.querySelectorAll(`#step11-options .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{u(11,t.dataset.value),e(),document.querySelectorAll(`#step11-options .option-pill`).forEach(e=>{let n=e.dataset.value===t.dataset.value;e.classList.toggle(`selected`,n);let r=e.querySelector(`.option-pill-check`);r&&(r.innerHTML=n?y(`check`,11):``)}),window.lucide&&window.lucide.createIcons()})})}var Qe=t({bind:()=>tt,render:()=>et}),$e=[{icon:`coins`,label:`Menos de 500.000 Kz`,desc:`Bootstrap, recursos próprios`},{icon:`wallet`,label:`500.000 Kz – 2.500.000 Kz`,desc:`Capital inicial modesto`},{icon:`briefcase`,label:`2.500.000 Kz – 10.000.000 Kz`,desc:`Investimento sério`},{icon:`landmark`,label:`10.000.000 Kz – 50.000.000 Kz`,desc:`Capital de crescimento`},{icon:`trending-up`,label:`Mais de 50.000.000 Kz`,desc:`Escala ambiciosa`},{icon:`handshake`,label:`A procurar investimento`,desc:`Ainda sem capital definido`}];function et(){let e=d(12)||``;return`
    <div class="step-content">
      <h2 class="step-question">Qual o investimento disponível?</h2>
      <p class="step-hint">Valor que tem ou pretende angariar para arrancar.</p>
      <div class="options-grid" id="step12-options">${$e.map(t=>{let n=e===t.label?`selected`:``;return`
      <div class="option-pill ${n}" data-value="${t.label}">
        <span class="option-pill-icon">${y(t.icon,16)}</span>
        <div class="option-pill-body">
          <span class="option-pill-text">${t.label}</span>
          <span class="option-pill-desc">${t.desc}</span>
        </div>
        <span class="option-pill-check">${n?y(`check`,11):``}</span>
      </div>`}).join(``)}</div>
    </div>`}function tt(e){window.lucide&&window.lucide.createIcons(),document.querySelectorAll(`#step12-options .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{u(12,t.dataset.value),e(),document.querySelectorAll(`#step12-options .option-pill`).forEach(e=>{let n=e.dataset.value===t.dataset.value;e.classList.toggle(`selected`,n);let r=e.querySelector(`.option-pill-check`);r&&(r.innerHTML=n?y(`check`,11):``)}),window.lucide&&window.lucide.createIcons()})})}var nt=t({bind:()=>at,render:()=>it}),rt=[{icon:`bar-chart-2`,label:`Gerar rendimento estável`,desc:`Negócio sólido e sustentável`},{icon:`trending-up`,label:`Crescer rapidamente e escalar`,desc:`Crescimento acelerado`},{icon:`lightbulb`,label:`Atrair investidores externos`,desc:`Fundraising e venture capital`},{icon:`target`,label:`Vender o negócio em 3-5 anos`,desc:`Exit strategy planeada`},{icon:`leaf`,label:`Impacto social ou ambiental`,desc:`Missão acima do lucro`},{icon:`globe`,label:`Criar um produto global`,desc:`Alcance mundial desde o início`}];function it(){let e=d(13)||``;return`
    <div class="step-content">
      <h2 class="step-question">Qual o seu objectivo principal?</h2>
      <p class="step-hint">O que pretende alcançar com este negócio?</p>
      <div class="options-grid" id="step13-options">${rt.map(t=>{let n=e===t.label?`selected`:``;return`
      <div class="option-pill ${n}" data-value="${t.label}">
        <span class="option-pill-icon">${y(t.icon,16)}</span>
        <div class="option-pill-body">
          <span class="option-pill-text">${t.label}</span>
          <span class="option-pill-desc">${t.desc}</span>
        </div>
        <span class="option-pill-check">${n?y(`check`,11):``}</span>
      </div>`}).join(``)}</div>
    </div>`}function at(e){window.lucide&&window.lucide.createIcons(),document.querySelectorAll(`#step13-options .option-pill`).forEach(t=>{t.addEventListener(`click`,()=>{u(13,t.dataset.value),e(),document.querySelectorAll(`#step13-options .option-pill`).forEach(e=>{let n=e.dataset.value===t.dataset.value;e.classList.toggle(`selected`,n);let r=e.querySelector(`.option-pill-check`);r&&(r.innerHTML=n?y(`check`,11):``)}),window.lucide&&window.lucide.createIcons()})})}var ot={1:ve,2:Se,3:Te,4:Ee,5:Oe,6:Ne,7:Fe,8:Ie,9:Be,10:We,11:Je,12:Qe,13:nt},G=document.getElementById(`app`),K={businessPlan:``,logoBriefing:``,logoImage:``,pitchDeck:[],names:[]},q=`plan`;function J(){window.lucide&&window.lucide.createIcons()}function st(){document.querySelectorAll(`.option-pill`).forEach(e=>{e.hasAttribute(`tabindex`)||(e.setAttribute(`tabindex`,`0`),e.setAttribute(`role`,`button`),e.addEventListener(`keydown`,t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),e.click())}))})}function Y(){G.innerHTML=`
    <div class="landing-screen">

      <!-- Top navigation bar -->
      <header class="app-header">
        <div class="app-header-brand">
          <div class="brand-icon">${y(`zap`,18)}</div>
          <span class="brand-name">PlanAI</span>
        </div>
        <div class="app-header-actions">
          ${g()?`
            <button class="btn btn-ghost btn-sm api-link-btn" id="header-api-btn" title="Configurar API Key">
              ${y(`key`,14)} Configurada
            </button>
          `:`
            <button class="btn btn-ghost btn-sm api-link-btn" id="header-api-btn">
              ${y(`key`,14)} API Key
            </button>
          `}
        </div>
      </header>

      <!-- Hero section -->
      <div class="hero-section">
        <div class="hero-badge">
          ${y(`sparkles`,13)} Powered by AI — Contexto Angola / Luanda
        </div>

        <h1 class="landing-title">
          O seu Business Plan,<br>gerado em minutos.
        </h1>

        <p class="landing-subtitle">
          Responda a 13 perguntas e a nossa IA gera um plano de negócio
          completo de 14 secções, pronto para apresentar a investidores.
        </p>

        ${l()?`
          <div class="persist-banner" id="resume-btn">
            ${y(`rotate-ccw`,13)} Tem um formulário por concluir — continuar donde parou?
          </div>
        `:``}

        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
          <button class="btn btn-primary btn-lg" id="start-btn">
            ${l()?`Começar de novo ${y(`plus`,16)}`:`Começar agora ${y(`arrow-right`,16)}`}
          </button>
          ${l()?`
            <button class="btn btn-secondary btn-lg" id="continue-btn">
              ${y(`play`,16)} Continuar
            </button>
          `:``}
        </div>
      </div>

      <!-- How it works -->
      <div class="how-it-works">
        <p class="how-it-works-title">Como funciona</p>
        <div class="how-steps">
          <div class="how-step">
            <div class="how-step-number">1</div>
            <div class="how-step-icon">${y(`file-pen`,24)}</div>
            <span class="how-step-label">Responda a 13 perguntas</span>
            <span class="how-step-desc">Simples e rápidas — menos de 5 minutos</span>
          </div>
          <div class="how-step-arrow">${y(`arrow-right`,16)}</div>
          <div class="how-step">
            <div class="how-step-number">2</div>
            <div class="how-step-icon">${y(`bot`,24)}</div>
            <span class="how-step-label">A IA gera tudo</span>
            <span class="how-step-desc">Plano, nomes, logo e pitch deck em paralelo</span>
          </div>
          <div class="how-step-arrow">${y(`arrow-right`,16)}</div>
          <div class="how-step">
            <div class="how-step-number">3</div>
            <div class="how-step-icon">${y(`download`,24)}</div>
            <span class="how-step-label">Descarregue o PDF</span>
            <span class="how-step-desc">Pronto para investidores ou bancos</span>
          </div>
        </div>
      </div>

      <!-- Feature cards -->
      <div class="landing-features">
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${y(`file-text`,20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Plano de Negócio</span>
            <span class="landing-feature-desc">14 secções completas</span>
          </div>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${y(`tag`,20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Sugestões de Nome</span>
            <span class="landing-feature-desc">10 opções com IA</span>
          </div>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${y(`palette`,20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Briefing de Logo</span>
            <span class="landing-feature-desc">+ Imagem gerada por IA</span>
          </div>
        </div>
        <div class="landing-feature-card">
          <div class="landing-feature-icon-wrap">
            ${y(`layout-template`,20)}
          </div>
          <div class="landing-feature-body">
            <span class="landing-feature-title">Pitch Deck</span>
            <span class="landing-feature-desc">8 slides estruturados</span>
          </div>
        </div>
      </div>

    </div>
  `,J(),document.getElementById(`start-btn`).addEventListener(`click`,()=>{if(l()){ee();for(let e=1;e<=13;e++)u(e,void 0);f(1)}g()?X():$(()=>{X()})}),document.getElementById(`continue-btn`)?.addEventListener(`click`,()=>{g()?X():$(()=>{X()})}),document.getElementById(`resume-btn`)?.addEventListener(`click`,()=>{g()?X():$(()=>{X()})}),document.getElementById(`header-api-btn`)?.addEventListener(`click`,()=>$())}var ct={Negócio:[1,2],Mercado:[3,4],Modelo:[5,6],Marca:[7,8,9],Contexto:[10,11,12,13]},lt=Object.keys(ct);function ut(e){return lt.findIndex(t=>ct[t].includes(e))}function X(){let e=ae(),t=oe(),n=se(e),r=ce(),i=ot[e],a=ut(e);G.innerHTML=`
    <div class="form-shell" id="form-shell">

      <!-- App header -->
      <header class="app-header app-header--form">
        <div class="app-header-brand">
          <div class="brand-icon">${y(`zap`,16)}</div>
          <span class="brand-name">PlanAI</span>
        </div>
        <button class="settings-btn" id="settings-btn" title="Definições">
          ${y(`settings`,16)}
        </button>
      </header>

      <!-- Category breadcrumb -->
      <div class="category-breadcrumb">
        ${lt.map((e,t)=>`
          <div class="cat-crumb ${t===a?`active`:``} ${t<a?`done`:``}">
            ${t<a?y(`check`,11):``}
            <span>${e}</span>
          </div>
        `).join(`<div class="cat-crumb-sep"></div>`)}
      </div>

      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-header">
          <span class="progress-category">${n}</span>
          <span class="progress-count">Passo ${e} de ${t}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${r}%"></div>
        </div>
      </div>

      <!-- Step content -->
      <div class="step-container">
        <div class="step-content-wrapper" id="step-content-wrapper">
          ${i.render()}
        </div>

        <div class="nav-bar">
          <button class="btn btn-ghost nav-back" id="back-btn" ${e===1?`style="visibility:hidden"`:``}>
            ${y(`arrow-left`,16)} Voltar
          </button>
          ${e<t?`
            <button class="btn btn-primary" id="next-btn" ${p(e)?``:`disabled`}>
              Continuar ${y(`arrow-right`,16)}
            </button>
          `:`
            <button class="btn btn-primary btn-generate" id="submit-btn" ${p(e)?``:`disabled`}>
              ${y(`wand-2`,16)} Gerar Business Plan
            </button>
          `}
        </div>
      </div>
    </div>
  `,J(),i.bind(dt),st(),document.getElementById(`form-shell`).addEventListener(`click`,t=>{let n=t.target.closest(`#back-btn`),r=t.target.closest(`#next-btn`),i=t.target.closest(`#submit-btn`);n&&(e===1?Y():(f(e-1),X())),r&&!r.disabled&&p(e)&&(f(e+1),X()),i&&!i.disabled&&p(e)&&ft()}),document.getElementById(`settings-btn`)?.addEventListener(`click`,()=>$())}function dt(){let e=ae(),t=document.getElementById(`next-btn`),n=document.getElementById(`submit-btn`);t&&(t.disabled=!p(e)),n&&(n.disabled=!p(e))}function Z(e,t=!1){let n=[`gen-step-1`,`gen-step-2`,`gen-step-3`,`gen-step-4`],r=document.getElementById(n[e]);if(!r)return;r.classList.remove(`active`),t&&r.classList.add(`done`);let i=document.getElementById(n[e+1]);i&&i.classList.add(`active`)}function Q(e){let t=document.getElementById(`gen-status`);t&&(t.textContent=e)}async function ft(){pt();let e=m();K.names=ie(),Q(`A criar as 14 secções do plano de negócio…`);try{K.businessPlan=await me(e)}catch(e){console.error(`Erro no plano:`,e),K.businessPlan=`> Erro ao gerar o plano de negócio: ${e.message}\n\nVerifique a sua API key e tente novamente.`}Z(0,!0),Q(`A gerar briefing de identidade visual…`);try{K.logoBriefing=await he(e)}catch(e){console.error(`Erro no logo briefing:`,e),K.logoBriefing=`> Erro ao gerar o briefing de logo: ${e.message}`}Z(1,!0),Q(`A gerar imagem de logo com IA…`);try{K.logoImage=await ge(e,K.logoBriefing)}catch(e){console.error(`Erro na imagem do logo:`,e),K.logoImage=``}Q(`A estruturar os slides do pitch deck…`);try{K.pitchDeck=await _e(e)}catch(e){console.error(`Erro no pitch deck:`,e),K.pitchDeck=[]}Z(2,!0),Q(`A compilar todos os documentos…`),Z(3,!0),q=`plan`,mt()}function pt(){G.innerHTML=`
    <div class="generating-screen">
      <div class="generating-orb">
        <div class="generating-orb-inner">
          ${y(`wand-2`,32)}
        </div>
      </div>
      <h2 class="generating-title">A gerar os seus documentos…</h2>
      <p class="generating-subtitle" id="gen-status">A analisar as suas respostas…</p>
      <div class="generating-steps">
        <div class="generating-step active" id="gen-step-1">
          <div class="generating-step-icon">${y(`file-text`,15)}</div>
          <span>Plano de Negócio <em>(14 secções)</em></span>
          <div class="generating-step-check">${y(`check`,12)}</div>
        </div>
        <div class="generating-step" id="gen-step-2">
          <div class="generating-step-icon">${y(`palette`,15)}</div>
          <span>Briefing de Identidade Visual</span>
          <div class="generating-step-check">${y(`check`,12)}</div>
        </div>
        <div class="generating-step" id="gen-step-3">
          <div class="generating-step-icon">${y(`layout-template`,15)}</div>
          <span>Pitch Deck <em>(8 slides)</em></span>
          <div class="generating-step-check">${y(`check`,12)}</div>
        </div>
        <div class="generating-step" id="gen-step-4">
          <div class="generating-step-icon">${y(`package`,15)}</div>
          <span>Compilação final</span>
          <div class="generating-step-check">${y(`check`,12)}</div>
        </div>
      </div>
    </div>
  `,J()}function mt(){let e=[{id:`plan`,label:`Plano de Negócio`,iconName:`file-text`,count:`14 secções`},{id:`logo`,label:`Logo Briefing`,iconName:`palette`,count:`Para designers`},{id:`deck`,label:`Pitch Deck`,iconName:`layout-template`,count:`${K.pitchDeck.length||8} slides`}];G.innerHTML=`
    <div class="result-screen">

      <!-- App header -->
      <header class="app-header app-header--result">
        <div class="app-header-brand">
          <div class="brand-icon">${y(`zap`,16)}</div>
          <span class="brand-name">PlanAI</span>
        </div>
        <button class="settings-btn" id="settings-btn" title="Definições">
          ${y(`settings`,16)}
        </button>
      </header>

      <!-- Result header -->
      <div class="result-header">
        <div class="result-badge">
          ${y(`check-circle`,13)} Gerado com sucesso
        </div>
        <h1 class="result-title">O seu Business Plan</h1>
        <p class="result-subtitle">4 documentos profissionais prontos a usar</p>
      </div>

      <!-- Tabs -->
      <div class="result-tabs" id="result-tabs">
        ${e.map(e=>`
          <button class="result-tab ${e.id===q?`active`:``}" data-tab="${e.id}">
            <span class="result-tab-icon">${y(e.iconName,16)}</span>
            <span class="result-tab-label">${e.label}</span>
            <span class="result-tab-count">${e.count}</span>
          </button>
        `).join(``)}
      </div>

      <!-- Tab content -->
      <div class="result-tab-content" id="tab-content">
        ${ht(q)}
      </div>

      <!-- Bottom actions -->
      <div class="result-bottom-actions">
        <button class="btn btn-primary" id="download-pdf-btn">
          ${y(`download`,14)} Descarregar PDF completo
        </button>
        <button class="btn btn-ghost" id="edit-btn">
          ${y(`pencil`,14)} Editar e regenerar
        </button>
        <button class="btn btn-ghost" id="restart-btn">
          ${y(`rotate-ccw`,14)} Recomeçar
        </button>
      </div>

    </div>
  `,J(),document.getElementById(`result-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`[data-tab]`);t&&(q=t.dataset.tab,document.querySelectorAll(`.result-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.tab===q)),document.getElementById(`tab-content`).innerHTML=ht(q),J(),bt(q))}),bt(q),document.getElementById(`edit-btn`).addEventListener(`click`,()=>{X()}),document.getElementById(`restart-btn`).addEventListener(`click`,()=>{if(confirm(`Tem a certeza que quer recomeçar? Todas as respostas serão perdidas.`)){ee();for(let e=1;e<=13;e++)u(e,void 0);f(1),K={businessPlan:``,logoBriefing:``,logoImage:``,pitchDeck:[],names:[]},Y()}}),document.getElementById(`download-pdf-btn`)?.addEventListener(`click`,xt),document.getElementById(`settings-btn`)?.addEventListener(`click`,()=>$())}function ht(e){return e===`plan`?gt():e===`names`?_t():e===`logo`?vt():e===`deck`?yt():``}function gt(){return`
    <div class="tab-actions">
      <button class="btn btn-secondary btn-sm" id="copy-plan-btn">
        ${y(`copy`,13)} Copiar texto
      </button>
      <button class="btn btn-secondary btn-sm" id="print-plan-btn">
        ${y(`printer`,13)} Imprimir / PDF
      </button>
    </div>
    <div class="result-body" id="plan-content">
      ${Ct(K.businessPlan)}
    </div>
  `}function _t(){let e=K.names;return!e||e.length===0?`
      <div class="names-empty">
        <div class="names-empty-icon">${y(`tag`,32)}</div>
        <p>Nenhuma sugestão de nome foi gerada.</p>
        <p class="names-empty-hint">Use o botão de gerar nomes no passo 7 do formulário.</p>
      </div>
    `:`
    <div class="names-grid">
      ${e.map((e,t)=>`
        <div class="name-card" data-name="${e}">
          <span class="name-number">${String(t+1).padStart(2,`0`)}</span>
          <span class="name-text">${e}</span>
          <button class="name-copy-btn" data-name="${e}" title="Copiar nome">
            ${y(`copy`,14)}
          </button>
        </div>
      `).join(``)}
    </div>
    <p class="names-hint">Clique em ${y(`copy`,12)} para copiar qualquer nome. Volte ao passo 7 para regenerar.</p>
  `}function vt(){return`
    ${K.logoImage?`
      <div class="logo-image-section">
        <h3 class="logo-image-title">
          ${y(`image`,16)} Pré-visualização do Logo
        </h3>
        <div class="logo-image-wrap">
          <img src="${K.logoImage}" alt="Logo gerado por IA" class="logo-image" />
        </div>
        <div class="logo-image-actions">
          <a href="${K.logoImage}" download="logo-planai.png" class="btn btn-secondary btn-sm">
            ${y(`download`,13)} Descarregar PNG
          </a>
        </div>
      </div>
    `:`
      <div class="logo-image-missing">
        ${y(`image-off`,16)} Imagem não gerada — verifique a sua ligação à internet e tente novamente.
      </div>
    `}
    <div class="tab-actions">
      <button class="btn btn-secondary btn-sm" id="copy-logo-btn">
        ${y(`copy`,13)} Copiar briefing
      </button>
      <button class="btn btn-secondary btn-sm" id="print-logo-btn">
        ${y(`printer`,13)} Imprimir
      </button>
    </div>
    <div class="result-body">
      ${Ct(K.logoBriefing)}
    </div>
  `}function yt(){let e=K.pitchDeck;return!e||e.length===0?`<div class="names-empty"><p>Pitch deck não disponível.</p></div>`:`
    <div class="deck-container">
      ${e.map((e,t)=>`
        <div class="deck-slide" data-slide="${e.slide||t+1}">
          <div class="deck-slide-number">Slide ${e.slide||t+1}</div>
          <div class="deck-slide-icon">${y(`bar-chart-2`,28)}</div>
          <h2 class="deck-slide-title">${e.title||``}</h2>
          ${e.subtitle?`<p class="deck-slide-subtitle">${e.subtitle}</p>`:``}
          ${e.highlight?`<div class="deck-slide-highlight">${e.highlight}</div>`:``}
          ${e.points&&e.points.length?`
            <ul class="deck-slide-points">
              ${e.points.map(e=>`
                <li>
                  <span class="deck-point-bullet">${y(`chevron-right`,12)}</span>
                  <span>${e}</span>
                </li>
              `).join(``)}
            </ul>
          `:``}
        </div>
      `).join(``)}
    </div>
    <div class="tab-actions" style="margin-top: var(--space-xl);">
      <button class="btn btn-secondary btn-sm" id="print-deck-btn">
        ${y(`printer`,13)} Imprimir slides
      </button>
    </div>
  `}function bt(e){J(),e===`plan`&&(document.getElementById(`copy-plan-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(K.businessPlan).then(()=>{let e=document.getElementById(`copy-plan-btn`);e&&(e.innerHTML=`${y(`check`,13)} Copiado!`,J(),setTimeout(()=>{e.innerHTML=`${y(`copy`,13)} Copiar texto`,J()},2e3))})}),document.getElementById(`print-plan-btn`)?.addEventListener(`click`,()=>window.print())),e===`names`&&document.querySelectorAll(`.name-copy-btn`).forEach(e=>{e.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.dataset.name).then(()=>{e.innerHTML=y(`check`,14),J(),setTimeout(()=>{e.innerHTML=y(`copy`,14),J()},1500)})})}),e===`logo`&&(document.getElementById(`copy-logo-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(K.logoBriefing).then(()=>{let e=document.getElementById(`copy-logo-btn`);e&&(e.innerHTML=`${y(`check`,13)} Copiado!`,J(),setTimeout(()=>{e.innerHTML=`${y(`copy`,13)} Copiar briefing`,J()},2e3))})}),document.getElementById(`print-logo-btn`)?.addEventListener(`click`,()=>window.print())),e===`deck`&&document.getElementById(`print-deck-btn`)?.addEventListener(`click`,()=>window.print())}async function xt(){let e=document.getElementById(`download-pdf-btn`);e&&(e.disabled=!0,e.textContent=`A gerar PDF…`),K.businessPlan.match(/\*\*([^*]{3,60})\*\*/)?.[1];let t=K.pitchDeck.length?K.pitchDeck.map(e=>`
        <div style="page-break-inside:avoid; border:1px solid #e2e8f0; border-radius:8px; padding:20px; margin-bottom:16px;">
          <div style="font-size:11px; color:#94a3b8; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Slide ${e.slide||``}</div>
          <div style="font-size:20px; margin-bottom:8px;">${e.icon||``}</div>
          <h3 style="font-size:16px; margin:0 0 6px; color:#1e293b;">${e.title||``}</h3>
          ${e.subtitle?`<p style="color:#64748b; font-style:italic; margin:0 0 10px; font-size:13px;">${e.subtitle}</p>`:``}
          ${e.highlight?`<div style="background:#ede9fe; color:#6d28d9; border-radius:4px; padding:6px 10px; font-weight:700; font-size:12px; margin-bottom:10px; display:inline-block;">${e.highlight}</div>`:``}
          ${e.points?.length?`<ul style="margin:0; padding-left:16px;">${e.points.map(e=>`<li style="color:#475569; font-size:13px; margin-bottom:4px;">${e}</li>`).join(``)}</ul>`:``}
        </div>`).join(``):`<p style="color:#94a3b8;">Pitch deck não disponível.</p>`,n=K.logoImage?`<div style="text-align:center; margin:20px 0;"><img src="${K.logoImage}" style="max-width:300px; max-height:200px; background:white; padding:12px; border-radius:8px; border:1px solid #e2e8f0;" alt="Logo"/></div>`:``,r=document.createElement(`div`);r.style.cssText=`font-family: Arial, sans-serif; color: #1e293b; font-size: 14px; line-height: 1.6; max-width: 800px; padding: 0;`,r.innerHTML=`
    <!-- COVER -->
    <div style="page-break-after:always; text-align:center; padding:60px 40px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; border-radius:8px; margin-bottom:32px;">
      <div style="font-size:48px; margin-bottom:16px;">🚀</div>
      <h1 style="font-size:32px; margin:0 0 8px; font-weight:800;">Business Plan</h1>
      <p style="font-size:16px; opacity:.85; margin:0;">Gerado por PlanAI • ${new Date().toLocaleDateString(`pt-PT`)}</p>
    </div>

    <!-- PLANO DE NEGÓCIO -->
    <div style="page-break-after:always;">
      <h1 style="font-size:22px; color:#6366f1; border-bottom:2px solid #6366f1; padding-bottom:8px; margin-bottom:24px;">📄 Plano de Negócio</h1>
      ${St(K.businessPlan)}
    </div>

    <!-- BRIEFING DE LOGO -->
    <div style="page-break-after:always;">
      <h1 style="font-size:22px; color:#6366f1; border-bottom:2px solid #6366f1; padding-bottom:8px; margin-bottom:24px;">🎨 Briefing de Identidade Visual</h1>
      ${n}
      ${St(K.logoBriefing)}
    </div>

    <!-- PITCH DECK -->
    <div>
      <h1 style="font-size:22px; color:#6366f1; border-bottom:2px solid #6366f1; padding-bottom:8px; margin-bottom:24px;">🎤 Pitch Deck</h1>
      ${t}
    </div>
  `;let i={margin:[15,15,15,15],filename:`business-plan-${Date.now()}.pdf`,image:{type:`jpeg`,quality:.92},html2canvas:{scale:2,useCORS:!0,logging:!1},jsPDF:{unit:`mm`,format:`a4`,orientation:`portrait`}};try{await window.html2pdf().set(i).from(r).save()}catch(e){console.error(`PDF error:`,e),alert(`Erro ao gerar PDF: `+e.message)}e&&(e.disabled=!1,e.innerHTML=`${y(`download`,14)} Descarregar PDF completo`,J())}function St(e){return e?e.replace(/```[\s\S]*?```/g,``).replace(/^### (.+)$/gm,`<h3 style="font-size:14px;color:#374151;margin:16px 0 6px;">$1</h3>`).replace(/^## (.+)$/gm,`<h2 style="font-size:16px;color:#1e293b;margin:20px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">$1</h2>`).replace(/^# (.+)$/gm,`<h1 style="font-size:18px;color:#6366f1;margin:24px 0 10px;">$1</h1>`).replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`).replace(/\*(.+?)\*/g,`<em>$1</em>`).replace(/^[\-\*] (.+)$/gm,`<li style="margin:3px 0;color:#475569;">$1</li>`).replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g,`<ul style="padding-left:20px;margin:8px 0;">$1</ul>`).replace(/^(?!<[hulo])((?!<).+)$/gm,`<p style="margin:6px 0;color:#374151;">$1</p>`).replace(/\n{2,}/g,`
`):`<p style="color:#94a3b8;">Sem conteúdo.</p>`}function $(e){let t=document.createElement(`div`);t.className=`api-modal-overlay`,t.innerHTML=`
    <div class="api-modal">
      <div class="api-modal-header">
        <div class="api-modal-icon">${y(`key`,20)}</div>
        <div>
          <h2>API Key</h2>
          <p>Introduza a sua chave do <a href="https://openrouter.ai/keys" target="_blank" class="api-modal-link">OpenRouter</a>.<br>
          A chave é guardada apenas no seu navegador.</p>
        </div>
      </div>
      <input type="password" class="api-modal-input" id="api-key-input"
        placeholder="sk-or-..." value="${h()}">
      <div class="api-modal-actions">
        <button class="btn btn-primary" id="save-api-btn">
          ${y(`save`,14)} Guardar
        </button>
        <button class="btn btn-ghost" id="cancel-api-btn">Cancelar</button>
      </div>
    </div>
  `,document.body.appendChild(t),J(),document.getElementById(`save-api-btn`).addEventListener(`click`,()=>{let n=document.getElementById(`api-key-input`).value.trim();n&&(le(n),t.remove(),e&&e())}),document.getElementById(`cancel-api-btn`).addEventListener(`click`,()=>t.remove()),t.addEventListener(`click`,e=>{e.target===t&&t.remove()}),setTimeout(()=>document.getElementById(`api-key-input`)?.focus(),100)}function Ct(e){return e?e.replace(/```(\w*)\n([\s\S]*?)```/g,`<pre><code>$2</code></pre>`).replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g,(e,t,n)=>{let r=t.split(`|`).map(e=>e.trim()).filter(Boolean),i=n.trim().split(`
`).map(e=>e.split(`|`).map(e=>e.trim()).filter(Boolean)),a=`<table><thead><tr>`;return r.forEach(e=>{a+=`<th>${e}</th>`}),a+=`</tr></thead><tbody>`,i.forEach(e=>{a+=`<tr>`,e.forEach(e=>{a+=`<td>${e}</td>`}),a+=`</tr>`}),a+=`</tbody></table>`,a}).replace(/^### (.+)$/gm,`<h3>$1</h3>`).replace(/^## (.+)$/gm,`<h2>$1</h2>`).replace(/^# (.+)$/gm,`<h1>$1</h1>`).replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`).replace(/\*(.+?)\*/g,`<em>$1</em>`).replace(/^[\-\*] (.+)$/gm,`<li>$1</li>`).replace(/^\d+\. (.+)$/gm,`<li>$1</li>`).replace(/((?:<li>.*<\/li>\n?)+)/g,`<ul>$1</ul>`).replace(/^---$/gm,`<hr>`).replace(/^(?!<[hultdpro])((?!<).+)$/gm,`<p>$1</p>`).replace(/\n{2,}/g,`
`):`<p>Nenhum conteúdo gerado.</p>`}Y();