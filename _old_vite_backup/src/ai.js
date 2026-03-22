// ============================================
// PlanAI — AI Integration (OpenRouter API)
// ============================================

import { getApiKey } from './formEngine.js';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-exp:free';

async function singleCallAI(messages, maxTokens = 4000) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API key não configurada. Clique em ⚙️ para configurar.');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min timeout

    let res;
    try {
        res = await fetch(API_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'PlanAI - Business Plan Generator',
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                max_tokens: maxTokens,
                temperature: 0.7,
            }),
        });
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') throw new Error('Tempo esgotado (>2 min). Tente novamente.');
        throw new Error('Sem ligação à internet ou API inacessível.');
    }
    clearTimeout(timeout);

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody.error?.message || `Erro HTTP ${res.status}`;
        if (res.status === 401) throw new Error('API key inválida. Verifique em ⚙️.');
        if (res.status === 429) throw new Error('Limite de pedidos atingido. Aguarde 30 segundos e tente novamente.');
        throw new Error(msg);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const finishReason = data.choices?.[0]?.finish_reason || '';
    return { content, finishReason };
}

// Auto-continuation: if the model stops due to token limit, keep asking it to continue
async function callAI(messages, maxTokens = 4000) {
    let { content, finishReason } = await singleCallAI(messages, maxTokens);
    let fullText = content;
    let retries = 0;
    const MAX_CONTINUATIONS = 3;

    while (finishReason === 'length' && retries < MAX_CONTINUATIONS) {
        retries++;
        const continuationMessages = [
            ...messages,
            { role: 'assistant', content: fullText },
            { role: 'user', content: 'O texto foi cortado. Continua EXACTAMENTE de onde paraste, sem repetir o que já escreveste. Não repitas títulos nem secções já escritas.' },
        ];
        const next = await singleCallAI(continuationMessages, maxTokens);
        fullText += next.content;
        finishReason = next.finishReason;
    }

    return fullText;
}

function buildContext(formData, exclude = []) {
    return Object.entries(formData)
        .filter(([k]) => !exclude.includes(k))
        .map(([k, v]) => `- ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n');
}

// ── Generate business name suggestions ────────────────────────────────────────
export async function generateNameSuggestions(formData) {
    const context = buildContext(formData, ['Nome do negócio', 'Estilo de logo', 'Tipo de logo']);

    const messages = [
        {
            role: 'system',
            content: 'És um especialista em branding e naming de empresas. Responde APENAS com uma lista JSON de nomes, sem explicação adicional.',
        },
        {
            role: 'user',
            content: `Com base nas seguintes informações de negócio, sugere exactamente 10 nomes criativos, memoráveis e profissionais para a empresa.\n\nInformações:\n${context}\n\nResponde APENAS com um array JSON de strings, exemplo: ["Nome1", "Nome2", ...]\nNão incluas explicações, apenas o array JSON.`,
        },
    ];

    const response = await callAI(messages, 600);

    try {
        const match = response.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
        return [];
    } catch {
        return response.split('\n').filter(n => n.trim()).slice(0, 10);
    }
}

// ── Generate full 14-section business plan ────────────────────────────────────
export async function generateBusinessPlan(formData) {
    const context = buildContext(formData);

    const messages = [
        {
            role: 'system',
            content: `És um consultor de negócios sénior especializado em criar Business Plans completos para o mercado angolano, prontos para apresentar a investidores, bancos (BDA, BPC) ou parceiros.

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
- Onde não há dados suficientes, usa estimativas fundamentadas na realidade angolana com nota explícita`,
        },
        {
            role: 'user',
            content: `Cria um Business Plan profissional e completo com 14 secções com base nestes dados do empreendedor:

${context}

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

IMPORTANTE: Escreve TODAS as 14 secções de forma COMPLETA. Não interrompas nenhuma secção a meio. Não omitas nenhuma subsecção. Usa Kwanzas (Kz) em todos os valores financeiros com equivalente USD entre parênteses. Contextualiza TUDO para Angola/Luanda (salvo mercado geográfico diferente). O plano deve ser ambicioso mas credível — evita projecções irrealistas. Sê extremamente detalhado. O plano deve ter entre 5.000 e 8.000 palavras e ser digno de apresentação a investidores profissionais, bancos angolanos e internacionais.`,
        },
    ];

    return await callAI(messages, 12000);
}

// ── Generate logo briefing ─────────────────────────────────────────────────────
export async function generateLogoBriefing(formData) {
    const context = buildContext(formData);

    const messages = [
        {
            role: 'system',
            content: 'És um director criativo especializado em identidade visual e branding para o mercado angolano. Considera a ressonância cultural das cores, tipografia e elementos visuais no contexto de Angola/Luanda. Inclui orientação para registo da marca no IAPI (Instituto Angolano da Propriedade Industrial). Escreves em Português de Portugal. Usas formatação Markdown clara.',
        },
        {
            role: 'user',
            content: `Com base nos seguintes dados do negócio, cria um briefing completo de identidade visual para ser entregue a um designer gráfico ou usado para geração via IA de imagem (Midjourney, DALL-E, etc.):

${context}

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
Formatos de ficheiro necessários, tamanhos, versões (positivo/negativo, horizontal/quadrado, com/sem tagline).`,
        },
    ];

    return await callAI(messages, 3000);
}

// ── Generate logo image via Pollinations AI (Free, No Key Required) ────────────
export async function generateLogoImage(formData, logoBriefing) {
    // Try to extract the English AI prompt from the briefing (section 8) //
    let imagePrompt = '';
    if (logoBriefing) {
        const patterns = [
            /(?:Prompt de IA|AI Prompt|Prompt para IA|Image Prompt)[^\n]*\n+([\s\S]*?)(?=\n##|\n#|$)/i,
            /(?:prompt|sugestão de prompt)[^\n]*[:]\s*["`]([^"`]+)["`]/i,
            /(?:prompt)[^\n]*\n+[>\-\*\s]*([^\n]{20,})/i,
        ];
        for (const re of patterns) {
            const m = logoBriefing.match(re);
            if (m) {
                imagePrompt = m[1].replace(/^[`\-\*>\s]+|[`\s]+$/g, '').trim();
                if (imagePrompt.length >= 20) break;
                imagePrompt = '';
            }
        }
    }

    // Fallback: build a clean prompt from formData
    if (!imagePrompt || imagePrompt.length < 20) {
        const area = formData['Área de negócio'] || 'business';
        const style = formData['Estilo de logo'] || 'modern minimal';
        const name = formData['Nome do negócio'] || '';
        const logoType = formData['Tipo de logo'] || 'wordmark';
        imagePrompt = `Professional ${style} logo design for a ${area} company${name ? ` called "${name}"` : ''}. ${logoType} style. Clean vector illustration, white background, suitable for branding. High quality, scalable graphic.`;
    }

    // Add extra instructions to ensure clean logo without weird text
    imagePrompt += " clean white background, professional logo vector graphics, minimalist, no text, no words";

    const encodedPrompt = encodeURIComponent(imagePrompt.substring(0, 1000));
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Falha ao aceder ao servidor de imagens.');
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Base64 for easier PDF export
            reader.onerror = () => resolve(url);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Fallback to direct URL due to fetch error:', e);
        return url;
    }
}

// ── Generate pitch deck ────────────────────────────────────────────────────────
export async function generatePitchDeck(formData) {
    const context = buildContext(formData);

    const messages = [
        {
            role: 'system',
            content: 'És um especialista em pitch decks para startups e PMEs no mercado angolano. Crias apresentações concisas e impactantes. Usa Kwanzas (Kz) nos valores financeiros com equivalente USD entre parênteses. Contexto por defeito: Luanda, Angola. Respondes APENAS com um array JSON válido de slides, sem texto adicional antes ou depois.',
        },
        {
            role: 'user',
            content: `Com base nos seguintes dados do negócio, cria um pitch deck de 8 slides.

        ${context}

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
Responde APENAS com o array JSON, começando com[e terminando com ]. Sem explicações.`,
        },
    ];

    const response = await callAI(messages, 2500);

    try {
        const match = response.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
        return [];
    } catch {
        return [];
    }
}
