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
// JSON STRUCTURED BUSINESS PLAN PROMPTS
// ============================================================

export function buildPlanJSONSystemPrompt(): string {
  return `You are an elite business plan consultant specialising in the Angolan market. Generate a COMPLETE, professional business plan as a single VALID JSON object. Output ONLY the JSON — no markdown fences, no explanations, no text before or after.

SCHEMA (follow exactly):
{
  "cover": {
    "businessName": "string",
    "tagline": "string — 1 impactful sentence",
    "sector": "string",
    "province": "string",
    "country": "Angola",
    "date": "string — e.g. Junho de 2025",
    "version": "V1.0",
    "contact": "string or null",
    "legalForm": "string — recommended legal form in Angola",
    "confidential": "Confidencial — Uso exclusivo do promotor e parceiros autorizados"
  },
  "sections": [
    {
      "id": "string — kebab-case",
      "number": "string — e.g. 1",
      "title": "string",
      "blocks": [ ...blocks ],
      "subsections": [
        { "title": "string", "blocks": [ ...blocks ] }
      ]
    }
  ]
}

BLOCK TYPES (use any combination per section):
{"type":"text","content":"paragraph — plain text only, NO markdown, NO | characters"}
{"type":"bullets","items":["item 1","item 2"]}
{"type":"numbered","items":["step 1","step 2"]}
{"type":"table","title":"optional","headers":["Col1","Col2","Col3"],"rows":[["r1c1","r1c2","r1c3"]]}
{"type":"swot","strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."]}
{"type":"organogram","root":{"title":"CEO / Fundador","subtitle":"nome/cargo","children":[{"title":"Dir. Técnico","subtitle":"Cargo","children":[]}]}}
{"type":"metrics","items":[{"label":"Investimento Total","value":"96.580.000","unit":"Kz","desc":"Capital necessário no arranque"}]}
{"type":"highlight","label":"Label","value":"Valor importante","sublabel":"nota extra","color":"blue|green|amber|red|slate"}
{"type":"timeline","phases":[{"period":"Mês 1–3","title":"Arranque","tasks":["tarefa 1","tarefa 2"]}]}

ABSOLUTE RULES:
- Write ENTIRELY in Portuguese (Angola)
- NEVER use | characters in text/bullets/numbered blocks (only inside table rows)
- NEVER use ASCII art, ASCII boxes, or ASCII diagrams anywhere
- NEVER use markdown syntax (**, ##, --, >, etc.) inside text content
- Financial values in AOA (Kz) and USD — infer realistic numbers within the stated ranges
- Every section must be SUBSTANTIAL (not template placeholders)
- The organogram must reflect the actual team capacity declared

REQUIRED SECTIONS (generate ALL 13, in this order):
1. SUMÁRIO EXECUTIVO — text + bullets + metrics (key financial highlights)
2. DESCRIÇÃO DO NEGÓCIO — text + bullets + highlight boxes (visão/missão/valores)
3. ANÁLISE DE MERCADO — text + metrics (TAM/SAM/SOM) + swot + table (competitors)
4. PRODUTOS E SERVIÇOS — text + table (pricing) + bullets
5. MARKETING E VENDAS — text + bullets + table (monthly targets)
6. PLANO OPERACIONAL — text + bullets + table (suppliers/logistics)
7. ESTRUTURA DA EQUIPA — text + organogram + table (roles and salaries)
8. PLANO FINANCEIRO — metrics (key numbers) + table (investment) + table (cashflow 12m) + table (P&L) + highlight (break-even) + highlight (funding gap)
9. CRONOGRAMA DE IMPLEMENTAÇÃO — timeline (18 months in 3 phases)
10. ANÁLISE DE RISCOS — table (risk | probability | impact | mitigation)
11. LEGALIZAÇÃO EM ANGOLA — numbered + table (costs)
12. BRANDING E IDENTIDADE — text + bullets
13. GUIA DE LANÇAMENTO 90 DIAS — timeline (3 phases: month 1, 2, 3) + table (90-day targets)`;
}

export function buildPlanJSONUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Generate the complete JSON business plan for this Angolan entrepreneur:

${buildContext(answers)}

CRITICAL INSTRUCTIONS:
- Cross-reference the province with the sector to infer realistic market conditions
- Use the stated Cost Range and Price Range to build ALL financial tables with actual numbers
- The Capital Available vs Investment Required gap must be explicit in section 8
- Cite real Angolan institutions: BDA, FDES, FACRA, BAI, BFA, GUE, AGT, INSS
- Dates: use current year 2025/2026
- Currency: Kwanza (Kz / AOA) primarily, USD as reference

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
