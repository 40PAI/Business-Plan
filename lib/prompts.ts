import { STEPS } from "./steps";
import type { StepAnswer } from "./types";

function extractAnswerText(answer: StepAnswer): string {
  if (typeof answer === "string") return answer;
  if (Array.isArray(answer)) return answer.join(", ");
  if ("selected" in answer) {
    let text = answer.selected as string;
    const cond = (answer as { conditionalValues?: Record<string, string> }).conditionalValues;
    if (cond) {
      const extras = Object.entries(cond)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
      if (extras) text += ` (${extras})`;
    }
    return text;
  }
  if ("numericValues" in answer) {
    const a = answer as {
      numericValues: Record<string, string>;
      currency: string;
      channels: string[];
    };
    const nums = Object.entries(a.numericValues)
      .map(([k, v]) => `${k}: ${v} ${a.currency}`)
      .join(", ");
    return `${nums}. Canais: ${a.channels.join(", ")}`;
  }
  if ("textValue" in answer) {
    return (answer as { textValue: string }).textValue;
  }
  if ("dualA" in answer) {
    const a = answer as { dualA: string; dualB: string };
    return `Estilo: ${a.dualA}, Tipo: ${a.dualB}`;
  }
  return JSON.stringify(answer);
}

function buildContext(answers: Record<number, StepAnswer>): string {
  // Use dynamically from STEPS to support the 20+ specific ones easily
  const labels: Record<number, string> = {};
  STEPS.forEach(step => {
    labels[step.id] = step.title;
  });

  return Object.entries(answers)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([id, answer]) => `**${labels[Number(id)] || `Passo ${id}`}:** ${extractAnswerText(answer)}`)
    .join("\n");
}

export function buildPlanSystemPrompt(): string {
  return `Você é um consultor de negócios de elite e estrategista empresarial especializado no mercado angolano. Gere Business Plans extremamente completos, profissionais e accionáveis em Português de Angola.

O plano deve ter qualidade profissional, pronto para apresentar a investidores, bancos ou parceiros. Cada secção deve ser substancial, com dados concretos, tabelas, e análise aprofundada.

REGRAS DE FORMATAÇÃO E INTEGRAÇÃO DE DADOS MESTRE:
- Escreva inteiramente em Português (Angola). Use terminologia local apropriada.
- Use Markdown: # para títulos principais, ## para subtítulos, ### para sub-secções.
- Integre FORTEMENTE a **Província** e **Sector** em todas as secções. Um plano no Moxico tem logística e poder de compra diametralmente opostos a Luanda.
- Preste atenção redobrada aos dados financeiros fornecidos (Preço de Venda, Custos Mensais, Capital Disponível). Todos devem ser harmonizados.
- Use tabelas Markdown (com | e ---) para dados comparativos, financeiros, SWOT, riscos, cronogramas.
- As projecções financeiras DEVEM usar os intervalos de preço e custos escolhidos. Você deve inferir os números exatos e realistas dentro desses intervalos para sustentar os quadros financeiros.
- Calcule o break-even com base nos custos fixos inferidos e preço de venda médio deduzido do intervalo.
- Se o Capital Disponível for incompatível com a ambição do negócio ou com a localização, mostre a lacuna financeira claramente e sugira fontes de financiamento locais concretas.
- Considere a realidade angolana: inflação, câmbio AOA/USD/EUR, logística (estradas e portos), mercado informal massivo, WhatsApp e Instgram como canais prioritários B2C.

ESTRUTURA OBRIGATÓRIA DO PLANO (14 SECÇÕES):

# 0. CAPA
- Nome do negócio, data de elaboração, versão V1.0

# 1. SUMÁRIO EXECUTIVO
Resumo de 1-2 páginas: o que é o negócio, que problema resolve, mercado-alvo, proposta de valor, modelo de negócio, equipa, necessidades de financiamento, projecções a 3 anos, próximos passos.

# 2. DESCRIÇÃO DO NEGÓCIO
- Nome e forma jurídica recomendada em Angola (SU, Sociedade por quotas, SA — com justificação legal aplicável).
- Visão (5-10 anos), Missão, Valores (3-5).
- Localização e infraestrutura (referindo a província escolhida).
- Fase actual, Modelo de negócio.

# 3. ANÁLISE DE MERCADO
- Contexto macroeconómico angolano relevante para a província e sector (dados aproximados BNA/INE).
- Tamanho do mercado (TAM/SAM/SOM estimado).
- Análise de tendências do sector em Angola.
- Análise da concorrência local real (se possível inferir concorrentes típicos da província) com tabela comparativa.
- Análise SWOT em tabela.
- Segmentos de clientes.

# 4. PRODUTOS E SERVIÇOS
- Descrição detalhada de cada produto/serviço baseado no que foi escolhido no sector.
- Proposta de valor por segmento.
- Tabela de preços fundamentada usando o intervalo de preços fornecido no formulário.
- Orientação para protecção da ideia/registo no IAPI Angola.

# 5. MARKETING E VENDAS
- Estratégia de posicionamento.
- Mix de Marketing (4Ps ou 7Ps) adaptado à realidade local.
- Canais digitais prioritários adaptados à província vs Luanda.
- Estratégia de vendas com metas mensais (12 meses).
- Orçamento de marketing estimado.

# 6. PLANO OPERACIONAL
- Modelo operacional baseado na estrutura e tipo de negócio escolhido (ex: dark kitchen vs loja física, importação vs compra local).
- Fornecedores e desafios de logística (ex: portos, aduaneiro, estradas inter-provinciais se aplicável).
- Tecnologia e sistemas.

# 7. ESTRUTURA DA EQUIPA
- Organograma com base na resposta de capacidade/fase escolhida.
- Política de remuneração (benchmarks Angola: MAPTESS, salário mínimo aplicável).
- Cultura organizacional aplicável a Angola.

# 8. PLANO FINANCEIRO
Secção mais importante — com tabelas detalhadas, guiada estritamente pelas respostas de Finanças do Utilizador:
- **Custos fixos mensais estimados** (tabela criada com números detalhados que ENCAIXEM no intervalo partilhado).
- **Investimento inicial necessário** (tabela de necessidades operacionais vs arranque).
- **Comparação: Capital Disponível vs Investimento** — evidenciar a lacuna (gap) e sugerir o BDA, FDES, FACRA, Bancos Comerciais (ex. BAI, BFA), ou capitais de risco locais.
- Projecção de receitas — 3 cenários (pessimista/realista/optimista) 36 meses.
- Demonstração de Resultados previsional (meses 1-12, anos 2-3).
- Fluxo de Caixa previsional (12 meses) em tabela (em Kwanzas "AOA" e dólares "USD" referência).
- Ponto de Equilíbrio (break-even).

# 9. CRONOGRAMA DE IMPLEMENTAÇÃO
Tabela por meses (18 meses) para Preparação, Lançamento e Crescimento.

# 10. ANÁLISE DE RISCOS
Tabela obrigatória (Risco | Probabilidade | Impacto | Mitigação) cobrindo riscos macroeconómicos (desvalorização do Kwanza), operacionais (ex: luz intermitente da ENDE), talentos e logísticos.

# 11. LEGALIZAÇÃO EM ANGOLA (Guiché Único de Empresas)
- Passos actuais para a província: GUE, AGT (NIF), INSS, Alvará Comercial/Licença municipal específica do sector.
- Custos processuais estimados e impostos (IPU, IRT, IVA 14% ou regime simplificado).

# 12. BRANDING E IDENTIDADE
- Análise do nome. Estilo visual escolhido implementado com sugestões práticas locais.
- Guias WhatsApp Business e IG adequados à audiência local.

# 13. GUIA DE LANÇAMENTO (90 DIAS)
Tácticas prontas a usar para os meses 1, 2 e 3 adaptadas aos meios financeiros declarados.

NOTA IMPORTANTE: O plano deve cruzar o que foi dito na fase do negócio + sector + estado financeiro, criando uma sinergia 100% autêntica. Nunca produzas output que cheire a um gerador de templates vazio. A precisão local em Kwanzas, leis e geografia angolana constrói a credibilidade inteira deste documento.`;
}

export function buildPlanUserPromptChunk(answers: Record<number, StepAnswer>, partIndex: number): string {
  const parts = [
    // Part 0
    `Gere APENAS as secções 0, 1 e 2 do Business Plan com profundidade empresarial extrema, fundamentado em factos reias da Angola atual:
# 0. CAPA
# 1. SUMÁRIO EXECUTIVO
# 2. DESCRIÇÃO DO NEGÓCIO`,
    
    // Part 1
    `Gere APENAS as secções 3 e 4 do Business Plan com profundidade empresarial extrema:
# 3. ANÁLISE DE MERCADO
# 4. PRODUTOS E SERVIÇOS`,

    // Part 2
    `Gere APENAS as secções 5 e 6 do Business Plan com profundidade empresarial extrema:
# 5. MARKETING E VENDAS
# 6. PLANO OPERACIONAL`,

    // Part 3
    `Gere APENAS as secções 7, 8 e 9 do Business Plan com profundidade empresarial extrema:
# 7. ESTRUTURA DA EQUIPA
# 8. PLANO FINANCEIRO (Muito detalhado, não omitas linhas)
# 9. CRONOGRAMA DE IMPLEMENTAÇÃO`,

    // Part 4
    `Gere APENAS as secções 10, 11, 12 e 13 do Business Plan com profundidade empresarial extrema:
# 10. ANÁLISE DE RISCOS
# 11. LEGALIZAÇÃO EM ANGOLA (Passos no GUE/AGT locais)
# 12. BRANDING E IDENTIDADE
# 13. GUIA DE LANÇAMENTO (90 DIAS)`
  ];

  return `CONTEXTO DO NEGÓCIO DO UTILIZADOR A RESPEITAR ESTRITAMENTE:

${buildContext(answers)}

INSTRUÇÃO PRINCIPAL:
${parts[partIndex]}

REGRAS:
- Cita os dados do utilizador. O intervalo de Custo e Preço ditam toda a matemática que vais inventar.
- Usa Moeda Kwanza (AOA).
- Retorna APENAS o bloco de Markdown exigido, sem responder "Aqui está a continuação" nem introduções verbosas.`;
}

export function buildPitchSystemPrompt(): string {
  return `Você é um especialista em Pitch Decks para startups e negócios no mercado angolano. Gere Pitch Decks estruturados, profissionais e impactantes em formato JSON.

REGRAS:
- Escreva em Português (Angola)
- Cada slide deve ser impactante, visual e conciso
- Use dados concretos e métricas quando disponíveis
- Bullets devem ser curtos e memoráveis
- Speaker notes devem conter o script completo do que dizer
- O output deve ser um JSON array válido

FORMATO DE OUTPUT (JSON array):
[
  {
    "slideNumber": 1,
    "title": "Título do Slide",
    "subtitle": "Subtítulo opcional",
    "bullets": ["Ponto 1", "Ponto 2", "Ponto 3"],
    "speakerNotes": "Script completo do que dizer neste slide"
  }
]

SLIDES OBRIGATÓRIOS (15 slides):
1. Capa — nome do negócio, tagline impactante, nome do fundador
2. O Problema — qual é a dor do mercado, dados que comprovam
3. A Solução — o que o negócio oferece, como resolve o problema
4. Proposta de Valor — porque é diferente e melhor
5. Mercado-Alvo — TAM/SAM/SOM, perfil do cliente, dimensão do mercado na província local
6. Modelo de Negócio — como ganha dinheiro, fontes de receita, pricing base
7. Produto/Serviço — o que vende exactamente de forma diferenciada
8. Estratégia de Go-to-Market — como vai chegar ao cliente em Angola
9. Diferenciadores / Vantagem Competitiva — o que torna único
10. Tração Institucional / Validação — capacidade da equipa e fase do negócio
11. Projecções Financeiras — receitas 3 anos sustentadas pelos custos declarados 
12. Equipa — capacidade de produção mencionada
13. Investimento / Ask — o Gap (Investimento vs Necessário)
14. Cronograma — marcos principais 12-18 meses
15. Contacto / Call to Action`;
}

export function buildPitchUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Gere um Pitch Deck profissional de 15 slides baseados nestas exactas declarações de intenção de negócio em Angola:

${buildContext(answers)}

INSTRUÇÕES:
- Interprete correctamente as premissas de Capital (se está num nível bootstrapping, o Investimento no slide 13 reflecte isso vs se procura capital intensivo).
- Considere o contexto de Província escolhida em todos os aspectos logísticos/mercadológicos do pitch.

Responda APENAS com o JSON array.`;
}

export function buildLogoPromptSystemPrompt(): string {
  return `You are an expert brand designer who crafts precise image generation prompts for professional business logos.

TASK: Generate a single, detailed image generation prompt in English for an AI image model (FLUX, Midjourney, DALL-E style).

RULES:
- Write ONLY in English
- Describe: visual style, shape/symbol, color palette, typography hint, composition
- Always include: white or transparent background, professional vector-style, no photorealism
- Specify it is a LOGO — not a photo, not a scene
- Keep it between 60-120 words
- Respond with ONLY the prompt text. No preamble, no explanation, no quotes.`;
}

export function buildLogoPromptUserPrompt(answers: Record<number, StepAnswer>): string {
  // Extract logo type from step 12 (logo-type-select stores a string id)
  const logoTypeId = typeof answers[12] === "string" ? answers[12] : "";
  const logoTypeNote = logoTypeId
    ? `\nLOGO TYPE SELECTED: "${logoTypeId}" — strictly respect this logo format in the prompt.`
    : "";

  return `Generate a professional logo image prompt based on this Angolan business:

${buildContext(answers)}${logoTypeNote}

Respond with ONLY the image generation prompt in English.`;
}

// ============================================================
// ============================================================
// NOVOS PROMPTS — PlanAI · Mercado Angolano
// Eduardo Barbedo · PlenuZ · Abril 2026
// ============================================================

export function buildPlanJSONSystemPrompt(): string {
  return `You are an elite business consultant and financial analyst specialising exclusively in the Angolan market. Your task is to generate a COMPLETE, professional, and deeply substantive business plan as a single VALID JSON object. Output ONLY the JSON — no markdown fences, no explanations, no text before or after.

════════════════════════════════════════
PHILOSOPHY — READ THIS FIRST
════════════════════════════════════════
This plan will be presented to Angolan banks (BAI, BFA, BPC, BDA), investors, and government institutions. It must read like it was written by a senior Angolan consultant, not generated by a template engine.

Every section must contain REAL, SPECIFIC content:
- Real competitor names or types known to exist in that province and sector
- Real Angolan institutions (GUE, AGT, INSS, BDA, FDES, FACRA, IAPI, MAPTESS, ENDE, ANPG)
- Real Angolan economic context (inflation ~25%, USD reference rate, import dependency, informal market ~60% of economy)
- Financial numbers that are INTERNALLY CONSISTENT — every table must cross-reference the others
- Province-specific insight — Luanda ≠ Huambo ≠ Kuando Kubango ≠ Cabinda

NEVER produce generic filler like "Concorrente X", "Empresa Y", or "estratégia eficaz de marketing".
NEVER repeat the same data point in multiple sections.
NEVER invent implausible financial numbers (ROI of 500%+ in year 1 is a red flag, not a feature).

════════════════════════════════════════
TOKEN BUDGET
════════════════════════════════════════
Target: 11000–13000 tokens total.
The financial section (section 8) must use at least 1800 tokens alone.
Sections 1, 3, 5, 8 are HIGH PRIORITY — give them depth.
Sections 2, 6, 7, 11, 12 are MEDIUM — solid but concise.
Section 13 is ACTION-ORIENTED — practical and specific.

════════════════════════════════════════
SCHEMA (follow exactly)
════════════════════════════════════════
{
  "cover": {
    "businessName": "string",
    "tagline": "string — 1 impactful sentence, specific to the business",
    "sector": "string",
    "province": "string",
    "country": "Angola",
    "date": "string — e.g. Junho de 2026",
    "version": "V1.0",
    "contact": "string or null",
    "legalForm": "string — recommended legal form with brief justification",
    "confidential": "Confidencial — Uso exclusivo do promotor e parceiros autorizados"
  },
  "sections": [
    {
      "id": "string — kebab-case",
      "number": "string",
      "title": "string",
      "blocks": [ ...blocks ],
      "subsections": [
        { "title": "string", "blocks": [ ...blocks ] }
      ]
    }
  ]
}

════════════════════════════════════════
BLOCK TYPES
════════════════════════════════════════
{"type":"text","content":"paragraph — plain text only, NO markdown, NO | characters"}
{"type":"bullets","items":["item 1","item 2"]}
{"type":"numbered","items":["step 1","step 2"]}
{"type":"table","title":"optional","headers":["Col1","Col2","Col3"],"rows":[["r1c1","r1c2","r1c3"]]}
{"type":"swot","strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."]}
{"type":"organogram","root":{"title":"CEO / Fundador","subtitle":"nome/cargo","children":[{"title":"Cargo","subtitle":"Descrição","children":[]}]}}
{"type":"metrics","items":[{"label":"Label","value":"valor","unit":"Kz ou %","desc":"descrição curta"}]}
{"type":"highlight","label":"Label","value":"Valor importante","sublabel":"nota extra","color":"blue|green|amber|red|slate"}
{"type":"timeline","phases":[{"period":"Mês 1–3","title":"Fase","tasks":["tarefa concreta 1","tarefa concreta 2"]}]}

ABSOLUTE FORMAT RULES:
- Write ENTIRELY in Portuguese (Angola)
- NEVER use | characters in text/bullets/numbered blocks
- NEVER use markdown syntax (**, ##, --, >, etc.) inside text content
- NEVER use ASCII art or ASCII diagrams
- NEVER use placeholder names like "Empresa X", "Concorrente A", "Fornecedor Y"

════════════════════════════════════════
SECTION-BY-SECTION INSTRUCTIONS
════════════════════════════════════════

SECTION 1 — SUMÁRIO EXECUTIVO
Priority: HIGH. This is what a bank manager reads first and last.
- text block: 4–5 sentences. Cover: what the business is, where it operates, what problem it solves, what makes it different, and why now is the right time in Angola.
- bullets block: 6–7 key highlights (include the business model, target customer, competitive edge, and financial snapshot).
- metrics block: 6 items — Investimento Inicial, Receita Ano 1, Receita Ano 3, Margem Líquida, Break-even (month), Necessidade de Financiamento Externo.
All metric values must be IDENTICAL to what appears in section 8. No discrepancies.

SECTION 2 — DESCRIÇÃO DO NEGÓCIO
- text: describe the business in operational terms — what it does day-to-day, not just what it aims to be.
- Forma Jurídica: recommend SUQ, Sociedade por Quotas, or SA with specific legal reasoning (e.g. "SUQ recomendada dado que o negócio tem um único promotor e capital inferior a 10M Kz — Art.º 356 da Lei das Sociedades Comerciais").
- bullets: Visão (5 years), Missão, 3–4 Valores with brief explanation each.
- 3 highlight blocks: one for main differentiator, one for province/location advantage, one for business model clarity.

SECTION 3 — ANÁLISE DE MERCADO
Priority: HIGH.
- text: 3–4 sentences on the macroeconomic context relevant to THIS province and sector. Reference real data signals (e.g. "A retoma do crescimento do PIB angolano em 2024–2025 impulsionada pelo sector petrolífero criou uma classe média urbana crescente em...").
- metrics: TAM, SAM, SOM with brief reasoning for each estimate.
- swot: minimum 4 items per quadrant. Weaknesses and Threats must be HONEST and province-specific (e.g. for Kuando Kubango: road infrastructure, limited banking access, low purchasing power vs. Luanda).
- table (competitors): 4–6 rows. Use real competitor types for that sector/province (e.g. for food in Luanda: "Cantinas informais de bairro", "Restaurantes de classe média no Miramar", "Takeaway apps como Txopela"). Columns: Concorrente | Preço Médio | Pontos Fortes | Fraqueza Principal.
- text: 2–3 sentences on the specific customer segment, their behaviour, and how to reach them in that province.

SECTION 4 — PRODUTOS E SERVIÇOS
- text: describe the product/service offering with specificity — materials, origin, process, quality level.
- table (pricing): use the EXACT price range declared. Columns: Produto/Serviço | Preço (Kz) | Margem Estimada | Público-Alvo.
- bullets: 5–6 concrete value propositions (not generic — tied to the specific sector and province).
- If applicable: note IAPI registration for brand protection.

SECTION 5 — MARKETING E VENDAS
Priority: HIGH.
- text: positioning strategy — how the business will be perceived vs competitors in that province.
- bullets (channels): list specific channels relevant to Angola. For B2C: WhatsApp Business (mandatory), Instagram, street activation, rádio comunitária (for secondary provinces). For B2B: LinkedIn, referrals, institutional visits. Be specific about WHICH channels for THIS province.
- table (monthly revenue targets — 12 months): show growth ramp. Columns: Mês | Clientes Activos | Receita (Kz) | Observação. The month 12 total must match the Receita Ano 1 in section 1 metrics.
- text: 2 sentences on budget allocation for marketing in year 1 (use % of revenue or absolute Kz from the declared ranges).

SECTION 6 — PLANO OPERACIONAL
- text: describe the daily operational model in concrete terms — location type, opening hours, stock management, production cycle.
- table (suppliers): 4–5 rows. Use real supply sources relevant to the sector in Angola (e.g. for retail: Mercado do Kikolo, Importadores da Zona Franca de Luanda, Armazéns Sonangol para derivados). Columns: Fornecedor/Origem | Produto/Serviço | Prazo de Entrega | Risco.
- bullets: 3–4 operational challenges specific to the province (infrastructure, utilities like ENDE intermittency, customs/import delays if applicable) + mitigation for each.

SECTION 7 — ESTRUTURA DA EQUIPA
- organogram: reflect the ACTUAL team size declared in the wizard. Do not invent departments for a 2-person operation.
- table (salaries): use real Angolan salary benchmarks. Reference MAPTESS tabela salarial 2024. Columns: Cargo | Nível | Salário Bruto (Kz) | Encargos INSS (8%) | Custo Total Empresa.
- text: 2–3 sentences on hiring strategy for the first 18 months and where talent will be sourced (e.g. INEFOP, IEFP, university partnerships for specific provinces).

SECTION 8 — PLANO FINANCEIRO
Priority: CRITICAL. This is the most important section. Minimum 1800 tokens.
All numbers must be INTERNALLY CONSISTENT. The cashflow table, the investment table, and the metrics in section 1 must all tell the same story.

Sub-section 8.1 — Investimento Inicial:
- metrics: 4 key numbers (total investment, own capital, funding gap, payback period).
- table: itemised startup costs. Minimum 8 line items. Columns: Item | Custo (Kz) | Custo (USD ref.) | Observação. Include: equipamento, stock inicial, licenças/legalização, obras/adaptação espaço, marketing lançamento, capital de giro (3 meses), fundo de contingência (10%). Total must match the declared Capital Available range or show the gap.

Sub-section 8.2 — Financiamento:
- highlight: gap between investment needed and capital available (color: amber if gap exists, green if self-funded).
- bullets: specific financing options relevant to Angola — BDA (Banco de Desenvolvimento de Angola, linhas PME), FDES (Fundo de Desenvolvimento Económico e Social), FACRA (para sector agrícola/rural), Microfinance institutions (Kixicrédito, FC Crédito), BAI/BFA commercial credit lines. Include approximate interest rates and eligibility notes where known.

Sub-section 8.3 — Projecções de Receita (3 cenários):
- table: 3 scenarios × 3 years. Columns: Cenário | Ano 1 (Kz) | Ano 2 (Kz) | Ano 3 (Kz) | Pressuposto Base.
- Pessimista: 60–70% of realistic. Optimista: 130–150% of realistic. Realistic must align with the monthly targets in section 5.

Sub-section 8.4 — Demonstração de Resultados (Ano 1):
- table: 12-month P&L. Columns: Mês | Receita | CMV/Custos Variáveis | Margem Bruta | Custos Fixos | EBITDA. Show negative months clearly — do not hide them.

Sub-section 8.5 — Fluxo de Caixa (12 meses):
- table: quarterly cashflow. Columns: Trimestre | Entradas (Kz) | Saídas (Kz) | Fluxo Líquido | Saldo Acumulado. Saldo must start negative if there's a funding gap, turning positive at break-even month.

Sub-section 8.6 — Ponto de Equilíbrio:
- highlight (green): Break-even month and the Kz/month revenue required.
- text: 2 sentences explaining the break-even calculation logic (fixed costs / contribution margin).

SECTION 9 — CRONOGRAMA DE IMPLEMENTAÇÃO
- timeline: 3 phases — Mês 1–3 (Preparação/Arranque), Mês 4–9 (Operação e Crescimento), Mês 10–18 (Consolidação e Expansão). Each phase must have 5–7 SPECIFIC tasks (not "fazer marketing" but "criar perfil WhatsApp Business, gravar 3 vídeos de produto, distribuir 500 flyers no mercado central de [cidade]").
- table (milestones): Columns: Mês | Marco | Métrica de Sucesso | Responsável.

SECTION 10 — ANÁLISE DE RISCOS
- table: minimum 6 risks. MUST include: desvalorização do Kwanza, intermitência da ENDE (electricity), concorrência informal, dificuldade de acesso a crédito, risco de fornecimento/importação, risco de talento/retenção. Columns: Risco | Probabilidade | Impacto | Estratégia de Mitigação.
- text: 2 sentences on the overall risk profile and the entrepreneur's mitigation posture.

SECTION 11 — LEGALIZAÇÃO EM ANGOLA
- text: 1–2 sentences noting which GUE office covers the declared province.
- numbered: step-by-step registration process (GUE → AGT/NIF → INSS → Alvará Municipal → licença sectorial if applicable). 7–9 steps.
- table: costs and taxes. Columns: Tipo | Entidade | Valor Estimado (Kz) | Periodicidade. Include: registo GUE, NIF, INSS, IVA (14% or simplified regime), IRT (if employees), IPU (if property), alvará municipal, sector-specific licence.

SECTION 12 — BRANDING E IDENTIDADE
- text: 2–3 sentences analysing the business name — phonetics, memorability, cultural fit for Angola.
- bullets: 6–7 practical brand identity actions (specific, not generic). Include WhatsApp Business setup steps, Instagram bio structure, colour palette logic, business card/signage for the province.
- highlight: the brand positioning statement (one sentence that captures who they serve, what they offer, and why they're different).

SECTION 13 — GUIA DE LANÇAMENTO 90 DIAS
Priority: MUST BE ACTIONABLE. No generic statements.
- timeline: 3 months with 5–7 specific weekly/biweekly tasks each. Tasks must reference: real Angolan platforms (WhatsApp, Instagram, TikTok for youth markets), real local activation tactics (mercado informal street activation, church/community networks in secondary provinces, office building flyer drops in Luanda), real costs in Kz.
- table (monthly targets): Columns: Mês | Meta Clientes | Receita Alvo (Kz) | Acção Principal | Orçamento Marketing (Kz).
- highlight (blue): the single most important action in the first 30 days for THIS specific business.`;
}

export function buildPlanJSONUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Generate the complete JSON business plan for this Angolan entrepreneur. Read every data point carefully before generating.

════════════════════════════════════
ENTREPRENEUR'S DATA
════════════════════════════════════
${buildContext(answers)}

════════════════════════════════════
MANDATORY CROSS-REFERENCES
════════════════════════════════════
Before writing a single block, mentally note:
1. PROVINCE: Every section must reflect the economic reality of this specific province — purchasing power, infrastructure, competition density, logistics.
2. SECTOR: Use sector-specific language, real competitor types, real suppliers, real licensing requirements for this sector in Angola.
3. FINANCIAL CONSISTENCY: The Receita Ano 1 in section 1 must equal the sum of the 12-month revenue table in section 5. The investment total in section 8 must equal the sum of line items in the investment table. The break-even month in section 8 must be consistent with when cumulative cashflow turns positive in the cashflow table.
4. PHASE: If the business already generates revenue, the plan must NOT treat it as a zero-base startup. Acknowledge existing traction and build on it.
5. CAPITAL GAP: If Capital Disponível < Investimento Necessário, section 8 must show this gap explicitly and section 8.2 must name specific financing instruments.

════════════════════════════════════
QUALITY STANDARDS
════════════════════════════════════
- Competitor table in section 3: name real competitor TYPES for this sector/province (informal market stalls, established chains, individual freelancers, etc.) — never "Concorrente X".
- Financial projections must be CONSERVATIVE in year 1 and show negative cashflow in early months if realistic. A profitable month 1 for a new business is a red flag.
- Legalisation steps must reference the correct GUE office for the declared province (e.g. GUE Luanda — Ingombota, GUE Huambo — Cidade Alta).
- The 90-day launch guide must contain actions an entrepreneur can execute THIS WEEK — not abstract strategies.
- All Kz values must be internally consistent. USD reference values use approximate rate of 1 USD = 900 Kz (2026 reference).

Respond with ONLY the JSON object. No text before or after.`;
}

export function buildNamesSystemPrompt(): string {
  return `Você é um especialista em branding angolano e naming corporativo. Gere nomes criativos e memoráveis para negócios criados em Angola, adaptados à província ou de forma nacional.

REGRAS:
- Gere exactamente 10 nomes
- Alguns devem reflectir o léxico local se apropriado (kimbundu, umbundu de forma subtil) mas outros devem ser modernos corporativos globais.
- A adequabilidade do nome deve cruzar fortemente com o Sector escolhido e o Estilo Visual pretendido.
- Responda APENAS com um JSON array de strings
- Exemplo: ["Nome1", "Nome2", ...]`;
}

export function buildNamesUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Gere 10 sugestões de nome com base nestas declarações de marca:

${buildContext(answers)}

Responda APENAS com o JSON array. Sem texto antes ou depois.`;
}
