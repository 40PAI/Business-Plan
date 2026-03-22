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
  return `Você é um consultor de negócios de elite e estrategista empresarial. Gere Business Plans profissionais, detalhados e accionáveis em Português.

REGRAS:
- Escreva inteiramente em Português (PT-PT/Angola)
- Use dados concretos e métricas quando possível
- Seja realista e prático nas projecções
- Use Markdown para formatar (# para títulos, ## para subtítulos, etc.)
- Cada secção deve ter pelo menos 2-3 parágrafos substanciais
- As projecções financeiras devem usar os números fornecidos pelo utilizador
- Calcule o break-even com base nos custos fixos e preço médio
- Projecções a 12, 24 e 36 meses

ESTRUTURA OBRIGATÓRIA:
# Sumário Executivo
# Análise de Mercado
# Proposta de Valor
# Modelo de Negócio
# Estratégia de Marketing e Vendas
# Projecções Financeiras
# Plano Operacional
# Cronograma de Implementação
# Análise de Risco e Mitigação
# Próximos Passos`;
}

export function buildPlanUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Gere um Business Plan completo e profissional com base nos seguintes dados do empreendedor:

${buildContext(answers)}

Seja detalhado, use números concretos nas projecções, e adapte a linguagem e profundidade à fase do negócio indicada.`;
}

export function buildPitchSystemPrompt(): string {
  return `Você é um especialista em Pitch Decks para startups e negócios. Gere Pitch Decks estruturados em formato JSON.

REGRAS:
- Escreva em Português (PT-PT/Angola)
- Cada slide deve ser impactante e conciso
- Use dados concretos quando disponíveis
- O output deve ser um JSON array válido

FORMATO DE OUTPUT (JSON array):
[
  {
    "slideNumber": 1,
    "title": "Título do Slide",
    "subtitle": "Subtítulo opcional",
    "bullets": ["Ponto 1", "Ponto 2", "Ponto 3"],
    "speakerNotes": "Notas para o apresentador"
  }
]

SLIDES OBRIGATÓRIOS (10 slides):
1. Capa (nome, tagline)
2. O Problema
3. A Solução
4. Mercado-Alvo
5. Modelo de Negócio
6. Diferenciadores / Vantagem Competitiva
7. Tração / Métricas (se aplicável)
8. Equipa
9. Projecções Financeiras
10. Ask / Próximos Passos`;
}

export function buildPitchUserPrompt(answers: Record<number, StepAnswer>): string {
  return `Gere um Pitch Deck de 10 slides com base nestes dados:

${buildContext(answers)}

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
