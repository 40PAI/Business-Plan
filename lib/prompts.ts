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
  const labels: Record<number, string> = {
    1: "Área de Negócio",
    2: "Fase do Negócio",
    3: "Problema que Resolve",
    4: "Cliente Principal",
    5: "Diferenciadores",
    6: "Modelo de Receita",
    7: "Números Base",
    8: "Localização",
    9: "Equipa",
    10: "Prazo de Lançamento",
    11: "Objectivo Principal",
    12: "Nome do Negócio",
    13: "Identidade Visual",
  };

  return Object.entries(answers)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([id, answer]) => `**${labels[Number(id)] || `Passo ${id}`}:** ${extractAnswerText(answer)}`)
    .join("\n");
}

export function buildPlanSystemPrompt(): string {
  return `Você é um consultor de negócios de elite e estrategista empresarial especializado no mercado angolano. Gere Business Plans extremamente completos, profissionais e accionáveis em Português de Angola.

O plano deve ter qualidade profissional, pronto para apresentar a investidores, bancos ou parceiros. Cada secção deve ser substancial, com dados concretos, tabelas, e análise aprofundada.

REGRAS DE FORMATAÇÃO:
- Escreva inteiramente em Português (Angola)
- Use Markdown: # para títulos principais, ## para subtítulos, ### para sub-secções
- Use tabelas Markdown (com | e ---) para dados comparativos, financeiros, SWOT, riscos, cronogramas
- Use **negrito** para termos-chave e dados importantes
- Cada secção deve ter pelo menos 3-5 parágrafos substanciais com análise real
- As projecções financeiras devem usar o preço médio fornecido pelo utilizador como base
- O utilizador NÃO fornece custos fixos — VOCÊ deve inferir e calcular os custos fixos reais com base no sector, localização, e tipo de negócio em Angola (renda, salários, utilidades, licenças, etc.)
- O utilizador fornece quanto pode investir — VOCÊ deve calcular o investimento total necessário e comparar com o disponível, mostrando claramente a lacuna financeira (se houver) e sugerindo fontes de financiamento
- Calcule o break-even com base nos custos fixos inferidos e preço médio
- Projecções a 12, 24 e 36 meses com cenários pessimista, realista e optimista
- Valores em AKZ e equivalente USD/EUR quando relevante
- Considere a realidade angolana: inflação, câmbio AKZ/USD/EUR, logística, mercado informal, WhatsApp como canal principal

ESTRUTURA OBRIGATÓRIA DO PLANO (14 SECÇÕES):

# 0. CAPA
- Nome do negócio, data de elaboração, versão V1.0

# 1. SUMÁRIO EXECUTIVO
Resumo de 1-2 páginas: o que é o negócio, que problema resolve, mercado-alvo, proposta de valor, modelo de negócio, equipa, necessidades de financiamento, projecções a 3 anos, próximos passos.

# 2. DESCRIÇÃO DO NEGÓCIO
- Nome e forma jurídica recomendada (SU, Sociedade por quotas, SA — com explicação)
- Visão (5-10 anos), Missão, Valores (3-5)
- Localização e infraestrutura
- Fase actual, Modelo de negócio

# 3. ANÁLISE DE MERCADO
- Contexto macroeconómico angolano (PIB sectorial, tendências, dados BNA/INE)
- Tamanho do mercado (TAM/SAM/SOM)
- Análise de tendências do sector em Angola e SADC
- Análise da concorrência com tabela comparativa (mínimo 3 concorrentes)
- Análise SWOT completa em tabela
- Segmentos de clientes detalhados

# 4. PRODUTOS E SERVIÇOS
- Descrição detalhada de cada produto/serviço
- Proposta de valor por segmento
- Tabela de preços com justificação comparativa
- Pipeline de inovação futura
- Orientação para registo no IAPI Angola

# 5. MARKETING E VENDAS
- Estratégia de posicionamento
- Mix de Marketing (4Ps ou 7Ps) adaptado à realidade angolana
- Canais digitais prioritários (WhatsApp Business, Instagram, Facebook, TikTok)
- Estratégia de vendas com metas mensais (12 meses)
- Plano de lançamento (pré, lançamento, pós)
- Orçamento de marketing estimado

# 6. PLANO OPERACIONAL
- Modelo operacional dia-a-dia
- Processos-chave
- Fornecedores (locais vs importação)
- Logística (desafios Angola: vias, alfândega, armazém)
- Tecnologia e sistemas
- Qualidade e controlo

# 7. ESTRUTURA DA EQUIPA
- Organograma (fase actual e escala)
- Perfis-chave com responsabilidades
- Plano de recrutamento
- Política de remuneração (benchmarks Angola)
- Cultura organizacional
- Parceiros estratégicos

# 8. PLANO FINANCEIRO
Secção mais importante — com tabelas detalhadas:
- **Custos fixos mensais estimados** (tabela detalhada inferida por si: renda, salários, electricidade, água, internet, seguros, licenças, contabilidade, etc. — baseado no sector e localização em Angola)
- **Investimento inicial necessário** (tabela por categoria — infraestrutura, equipamento, stock, marketing, legal, reserva de caixa)
- **Comparação: Investimento disponível vs. necessário** — mostrar claramente quanto o utilizador tem vs. quanto precisa, e a lacuna financeira
- **Se houver lacuna**: recomendar fontes de financiamento (BDA, BPC Empreendedores, INAPEM, FDES, microcrédito, investidores privados)
- Pressupostos financeiros (câmbio AKZ/USD/EUR, inflação, sazonalidade)
- Projecção de receitas — 3 cenários (pessimista/realista/optimista) 36 meses
- Projecção de custos fixos e variáveis
- Demonstração de Resultados previsional (meses 1-12, anos 2-3)
- Fluxo de Caixa previsional (12 meses) em tabela
- Ponto de Equilíbrio (break-even) calculado com custos fixos inferidos
- Indicadores: ROI, margem bruta, margem líquida, payback period

# 9. CRONOGRAMA DE IMPLEMENTAÇÃO
Tabela por meses (18 meses) com:
- Fase de Preparação, Lançamento, Crescimento
- Marcos, responsável, custo associado

# 10. ANÁLISE DE RISCOS
Tabela obrigatória com colunas: Risco | Probabilidade | Impacto | Mitigação
Cobrir: mercado, financeiros, operacionais, regulatórios, equipa, macroeconómicos Angola

# 11. LEGALIZAÇÃO EM ANGOLA
- Forma jurídica recomendada
- Passos: reserva de nome, estatutos, capital social, GUE, Diário da República, AGT (NIF), INSS, licença municipal
- Custos estimados em AKZ/USD
- Tempo estimado
- Fiscalidade: IPU, IRT, IVA

# 12. BRANDING E IDENTIDADE
- Análise do nome proposto + 2-3 alternativas
- Posicionamento e tom de voz
- Paleta de cores, tipografia, estilo visual
- Plataformas digitais prioritárias
- Guia WhatsApp Business
- Estratégia de conteúdo inicial

# 13. GUIA DE LANÇAMENTO (90 DIAS)
Plano táctico:
- Mês 1 — Preparação: checklist, configuração digital, primeiros 10 clientes
- Mês 2 — Lançamento: evento, RP, promoção, testemunhos
- Mês 3 — Ajuste: análise resultados, ajustes, parcerias, plano meses 4-6

NOTA IMPORTANTE: Onde não há dados suficientes, usa estimativas fundamentadas na realidade angolana com nota explícita "[Estimativa — validar com pesquisa local]". O plano deve ser ambicioso mas credível.`;
}

export function buildPlanUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Gere um Business Plan COMPLETO e EXTREMAMENTE DETALHADO com TODAS as 14 secções obrigatórias, com base nos seguintes dados do empreendedor:

${buildContext(answers)}

INSTRUÇÕES ESPECIAIS:
- O plano deve ter profundidade para 15-25 páginas quando exportado
- Use TABELAS markdown para: análise SWOT, comparação concorrência, preços, projecções financeiras, cronograma, riscos
- Cada secção deve ter conteúdo substancial (não genérico)
- IMPORTANTE: O utilizador NÃO forneceu custos fixos — INFIRA e CALCULE os custos fixos reais baseados no sector, localização e tipo de negócio em Angola
- IMPORTANTE: Compare o investimento disponível do utilizador com o investimento total necessário — mostre a lacuna e sugira financiamento se necessário
- As projecções financeiras devem ser calculadas com base no preço médio fornecido e nos custos que você inferir
- Adapte toda a linguagem e análise ao mercado angolano
- Inclua dados reais do mercado angolano quando possível
- Seja prático e accionável — este plano será usado para execução real`;
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
5. Mercado-Alvo — TAM/SAM/SOM, perfil do cliente, dimensão do mercado angolano
6. Modelo de Negócio — como ganha dinheiro, fontes de receita, pricing
7. Produto/Serviço — o que vende exactamente, benefícios-chave
8. Estratégia de Go-to-Market — como vai chegar ao cliente, canais, lançamento
9. Diferenciadores / Vantagem Competitiva — o que torna único, barreiras de entrada
10. Tração / Validação — métricas actuais, testes realizados, feedback de clientes
11. Projecções Financeiras — receitas 3 anos, break-even, ROI
12. Equipa — fundador, competências-chave, necessidades de contratação
13. Investimento / Ask — quanto precisa, para quê, retorno esperado
14. Cronograma — marcos principais 12-18 meses
15. Contacto / Call to Action — próximos passos, como entrar em contacto`;
}

export function buildPitchUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Gere um Pitch Deck profissional de 15 slides com base nestes dados:

${buildContext(answers)}

INSTRUÇÕES:
- Cada slide deve ter 3-5 bullets concretos e impactantes
- As speaker notes devem ter o script completo (3-5 frases por slide)
- Use números e dados concretos sempre que possível
- Adapte ao mercado angolano
- O slide de projecções deve ter números calculados com base nos dados fornecidos

Responda APENAS com o JSON array. Sem texto antes ou depois.`;
}

export function buildNamesSystemPrompt(): string {
  return `Você é um especialista em branding e naming. Gere nomes criativos e memoráveis para negócios.

REGRAS:
- Gere exactamente 10 nomes
- Nomes curtos (1-2 palavras), fáceis de pronunciar
- Mix de português, inglês, e nomes inventados
- Relevantes para a área de negócio
- Responda APENAS com um JSON array de strings
- Exemplo: ["Nome1", "Nome2", ...]`;
}

export function buildNamesUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Gere 10 sugestões de nome para este negócio:

${buildContext(answers)}

Responda APENAS com o JSON array. Sem texto antes ou depois.`;
}
