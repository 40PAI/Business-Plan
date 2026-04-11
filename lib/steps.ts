import type { Step } from "./types";

export const BLOCKS = [
  { name: "Negócio", steps: [1, 2, 3] }, // Sector, Província, Fase
  { name: "Mercado", steps: [4, 5] },    // Problema, Cliente
  { name: "Modelo", steps: [6, 7] },     // Receita, Diferencial
  { name: "Sector", steps: [] },         // Dinâmico (Perguntas variáveis)
  { name: "Finanças", steps: [8, 9, 10] }, // Preço, Custo, Capital
  { name: "Marca", steps: [11, 12] },    // Nome, Identidade Visual
  { name: "Contacto", steps: [13] },     // Contato
];

export const STEPS: Step[] = [
  // ==========================================
  // BLOCO 1 — NEGÓCIO
  // ==========================================
  {
    id: 1,
    block: "Negócio",
    blockIndex: 0,
    title: "Área de Negócio",
    description: "Em que área actua o seu negócio? Escolha a que mais se aproxima.",
    type: "single-select",
    options: [
      { label: "Restauração / Alimentação", icon: "UtensilsCrossed" },
      { label: "Moda / Atelier / Confecção", icon: "Shirt" },
      { label: "Saúde / Clínicas / Estética", icon: "HeartPulse" },
      { label: "Retalho / Comércio", icon: "ShoppingBag" },
      { label: "Educação / Formação", icon: "BookOpen" },
      { label: "Tecnologia / Software / IA", icon: "Monitor" },
      { label: "Serviços Financeiros / Seguros", icon: "Landmark" },
      { label: "Logística / Transporte", icon: "Truck" },
      { label: "Imobiliário / Construção", icon: "Building" },
      { label: "Agricultura / Agro", icon: "Leaf" },
      { label: "Consultoria", icon: "BarChart" },
      { label: "Outro", icon: "Pencil" },
    ],
  },
  {
    id: 2,
    block: "Negócio",
    blockIndex: 0,
    title: "Localização",
    description: "Em que província vai operar o seu negócio?",
    type: "multi-select",
    options: [
      { label: "Luanda (capital)", icon: "Star" },
      { label: "Lunda Sul", icon: "MapPin" },
      { label: "Lunda Norte", icon: "MapPin" },
      { label: "Moxico", icon: "MapPin" },
      { label: "Kuando Kubango", icon: "MapPin" },
      { label: "Bengo", icon: "MapPin" },
      { label: "Cuanza Sul", icon: "MapPin" },
      { label: "Cuanza Norte", icon: "MapPin" },
      { label: "Malanje", icon: "MapPin" },
      { label: "Uíge", icon: "MapPin" },
      { label: "Zaire", icon: "MapPin" },
      { label: "Cabinda", icon: "MapPin" },
      { label: "Benguela", icon: "MapPin" },
      { label: "Huambo", icon: "MapPin" },
      { label: "Bié", icon: "MapPin" },
      { label: "Huíla", icon: "MapPin" },
      { label: "Namibe", icon: "MapPin" },
      { label: "Cunene", icon: "MapPin" },
      { label: "100% Digital (sem base)", icon: "Wifi" },
    ],
  },
  {
    id: 3,
    block: "Negócio",
    blockIndex: 0,
    title: "Fase do Negócio",
    description: "Em que fase está o seu negócio? Seja honesto — não há resposta errada.",
    type: "multi-select",
    options: [
      {
        label: "Não tenho nenhuma ideia",
        icon: "HelpCircle",
        conditionalFields: [
          { label: "Temas ou áreas que te interessam", placeholder: "Ex: tecnologia, saúde, educação..." },
          { label: "Competências ou experiência que tens", placeholder: "Ex: marketing, programação, vendas..." },
        ],
      },
      {
        label: "Só tenho a ideia",
        icon: "Lightbulb",
        conditionalFields: [
          { label: "Descreve a tua ideia em poucas palavras", placeholder: "Ex: app de entregas para zonas rurais..." },
          { label: "O que te motivou a pensar nesta ideia?", placeholder: "Ex: vi uma necessidade no meu bairro..." },
        ],
      },
      {
        label: "Já testei com alguns clientes",
        icon: "Users",
        conditionalFields: [
          { label: "Quantos clientes já tens?", placeholder: "Ex: 15 clientes activos" },
          { label: "Qual foi o principal feedback?", placeholder: "Ex: adoram a velocidade mas querem mais opções..." },
        ],
      },
      {
        label: "Já gero receita",
        icon: "DollarSign",
        conditionalFields: [
          { label: "Qual a receita mensal actual (aprox.)?", placeholder: "Ex: 500.000 Kz / mês" },
          { label: "Qual o maior desafio agora?", placeholder: "Ex: encontrar clientes novos..." },
        ],
      },
      {
        label: "Quero escalar o que já existe",
        icon: "TrendingUp",
        conditionalFields: [
          { label: "Qual o principal obstáculo ao crescimento?", placeholder: "Ex: falta de capital, equipa pequena..." },
          { label: "Que objectivo queres atingir em 12 meses?", placeholder: "Ex: duplicar a receita, abrir 2ª loja..." },
        ],
      },
    ],
  },

  // ==========================================
  // BLOCO 2 — MERCADO
  // ==========================================
  {
    id: 4,
    block: "Mercado",
    blockIndex: 1,
    title: "Problema que Resolve",
    description: "Qual o principal problema que o negócio resolve? Pense no cliente.",
    type: "multi-select",
    options: [
      { label: "Poupa tempo", icon: "Clock" },
      { label: "Poupa dinheiro", icon: "PiggyBank" },
      { label: "Substitui algo caro ou difícil de encontrar", icon: "Replace" },
      { label: "Dá acesso a algo que não existe no mercado", icon: "Key" },
      { label: "Melhora uma experiência má", icon: "ThumbsUp" },
      { label: "Aumenta segurança e confiança", icon: "Shield" },
      { label: "Outro", icon: "Pencil" },
    ],
  },
  {
    id: 5,
    block: "Mercado",
    blockIndex: 1,
    title: "Cliente Principal",
    description: "Quem é o seu cliente principal? O foco é essencial (pode escolher vários).",
    type: "multi-select",

    options: [
      { label: "Jovens 18–30 anos", icon: "User" },
      { label: "Adultos 30–50 anos", icon: "UserCheck" },
      { label: "Seniores 50+ anos", icon: "UserCog" },
      { label: "Famílias de classe média", icon: "Home" },
      { label: "Famílias de alta renda", icon: "Crown" },
      { label: "Estudantes universitários", icon: "GraduationCap" },
      { label: "Pequenos comerciantes / Empreendedores", icon: "Store" },
      { label: "Médias e grandes empresas (B2B)", icon: "Building2" },
      { label: "Governo ou Instituições", icon: "Landmark" },
      { label: "Outro", icon: "Pencil" },
    ],
  },

  // ==========================================
  // BLOCO 3 — MODELO
  // ==========================================
  {
    id: 6,
    block: "Modelo",
    blockIndex: 2,
    title: "Como vai receber",
    description: "Como é o modelo principal de receita?",
    type: "multi-select",
    options: [
      { label: "Venda directa de produto ou serviço", icon: "ShoppingCart" },
      { label: "Mensalidade / Subscrição", icon: "RefreshCw" },
      { label: "Comissão por venda/intermediação", icon: "Percent" },
      { label: "Projectos ou contratos fechados", icon: "Briefcase" },
      { label: "Formação / Inscrições", icon: "GraduationCap" },
      { label: "Arrendamento / Aluguer", icon: "Key" },
      { label: "Outro", icon: "Pencil" },
    ],
  },
  {
    id: 7,
    block: "Modelo",
    blockIndex: 2,
    title: "Diferencial Competitivo",
    description: "Por que as pessoas vão escolher você em vez do vizinho?",
    type: "multi-select",

    options: [
      { label: "Preço mais acessível", icon: "BadgeDollarSign" },
      { label: "Produto de maior qualidade / luxo", icon: "Award" },
      { label: "Rapidez na entrega / serviço", icon: "Rocket" },
      { label: "Melhor experiência de atendimento", icon: "Headphones" },
      { label: "Localização estratégica", icon: "MapPin" },
      { label: "Uso de tecnologia inovadora", icon: "Cpu" },
      { label: "Conhecemos bem a zona e os clientes", icon: "Smile" },
      { label: "Confiança / Reputação do fundador", icon: "ShieldCheck" },
      { label: "Outro", icon: "Pencil" },
    ],
  },

  // ==========================================
  // BLOCO 4 — CONTEXTO SECTORIAL (Variável)
  // Cada ID de 101 a 110 são para os sectores
  // ==========================================

  // --- RESTAURAÇÃO / ALIMENTAÇÃO ---
  {
    id: 101,
    block: "Sector",
    blockIndex: 3,
    title: "Tipo de Negócio",
    description: "Qual é o formato principal?",
    type: "multi-select",
    sectorCondition: ["Restauração / Alimentação"],
    options: [
      { label: "Restaurante com lugar sentado", icon: "Utensils" },
      { label: "Take-away e Delivery", icon: "Package" },
      { label: "Roulotte / Carrinho / Barraca", icon: "Truck" },
      { label: "Pastelaria / Padaria / Café", icon: "Coffee" },
      { label: "Catering / Eventos", icon: "PartyPopper" },
      { label: "Produção de Alimentos (fabricação)", icon: "Factory" },
    ],
  },
  {
    id: 102,
    block: "Sector",
    blockIndex: 3,
    title: "Operação e Vendas",
    description: "Onde os clientes compram a tua comida?",
    type: "multi-select",
    sectorCondition: ["Restauração / Alimentação"],
    options: [
      { label: "Apenas loja física (própria)", icon: "Store" },
      { label: "A partir de casa (Dark Kitchen)", icon: "Home" },
      { label: "Apenas apps (Tupuca, Mamboo)", icon: "Smartphone" },
      { label: "Modelo híbrido (físico + apps/WhatsApp)", icon: "Layers" },
      { label: "Foco em eventos pontuais", icon: "Calendar" },
    ],
  },
  {
    id: 103,
    block: "Sector",
    blockIndex: 3,
    title: "Produção",
    description: "Quem vai ficar na cozinha/produção?",
    type: "multi-select",
    sectorCondition: ["Restauração / Alimentação"],
    options: [
      { label: "Eu mesmo vou cozinhar", icon: "User" },
      { label: "Contrato um cozinheiro / chef experiente", icon: "Briefcase" },
      { label: "Tenho um sócio/parceiro da área", icon: "Users" },
      { label: "Vou revender produtos já feitos", icon: "Repeat" },
    ],
  },

  // --- MODA / CONFECÇÃO ---
  {
    id: 104,
    block: "Sector",
    blockIndex: 3,
    title: "Tipo de Produto",
    description: "O que vais vender principalmente?",
    type: "multi-select",

    sectorCondition: ["Moda / Atelier / Confecção"],
    options: [
      { label: "Roupa feminina", icon: "Shirt" },
      { label: "Roupa masculina", icon: "User" },
      { label: "Roupa infantil / bebé", icon: "Baby" },
      { label: "Acessórios, malas ou calçados", icon: "Watch" },
      { label: "Uniformes para empresas", icon: "Briefcase" },
      { label: "Corte e costura por medida (Atelier)", icon: "Scissors" },
    ],
  },
  {
    id: 105,
    block: "Sector",
    blockIndex: 3,
    title: "Cadeia de Valor",
    description: "Como adquires a roupa para vender?",
    type: "multi-select",
    sectorCondition: ["Moda / Atelier / Confecção"],
    options: [
      { label: "Produzo cá do zero", icon: "Scissors" },
      { label: "Desenho o modelo e mando fazer em Angola", icon: "PenTool" },
      { label: "Importo novidades (China, Turquia, Brasil, etc.)", icon: "Plane" },
      { label: "Compro cá nos armazéns e revendo", icon: "Truck" },
      { label: "Roupa em 2ª mão / Fardo premium", icon: "Recycle" },
    ],
  },
  {
    id: 106,
    block: "Sector",
    blockIndex: 3,
    title: "Canais de Venda",
    description: "Como vais vender a roupa?",
    type: "multi-select",

    sectorCondition: ["Moda / Atelier / Confecção"],
    options: [
      { label: "Loja de rua urbana / Boutique", icon: "Store" },
      { label: "Montra digital apenas (Instagram)", icon: "Instagram" },
      { label: "WhatsApp vendas / Encomendas", icon: "MessageCircle" },
      { label: "Feiras, mercados e pop-ups", icon: "Tent" },
      { label: "Venda porta-a-porta no bairro", icon: "Home" },
    ],
  },

  // --- SAÚDE / ESTÉTICA ---
  {
    id: 107,
    block: "Sector",
    blockIndex: 3,
    title: "Formato do Serviço",
    description: "Onde prestas o serviço de saúde ou beleza?",
    type: "multi-select",
    sectorCondition: ["Saúde / Clínicas / Estética"],
    options: [
      { label: "Espaço próprio remodelado", icon: "Building" },
      { label: "Atendimento ao domicílio do cliente", icon: "Home" },
      { label: "Divido espaço num salão/clínica maior", icon: "Scissors" },
      { label: "Só teleconsulta / acompanhamento online", icon: "Monitor" },
    ],
  },
  {
    id: 108,
    block: "Sector",
    blockIndex: 3,
    title: "Volume e Capacidade",
    description: "Quantos clientes consegues atender por dia?",
    type: "multi-select",
    sectorCondition: ["Saúde / Clínicas / Estética"],
    options: [
      { label: "1 a 5 atendimentos personalizados", icon: "UserCheck" },
      { label: "6 a 15 pessoas por dia", icon: "Users" },
      { label: "16 a 30 (fluxo moderado)", icon: "UsersRound" },
      { label: "Mais de 30 clientes / volume alto", icon: "Factory" },
    ],
  },
  {
    id: 109,
    block: "Sector",
    blockIndex: 3,
    title: "Estrutura da Equipa",
    description: "Como tens a equipa estruturada agora?",
    type: "multi-select",
    sectorCondition: ["Saúde / Clínicas / Estética"],
    options: [
      { label: "Sozinho(a) – Eu faço os serviços todos", icon: "User" },
      { label: "1 a 3 assistentes ou colegas de serviço", icon: "Users" },
      { label: "Mais de 3 pessoas em folha de salário", icon: "Building2" },
      { label: "Presto serviço numa clínica como independente", icon: "Briefcase" },
    ],
  },

  // --- RETALHO / COMÉRCIO ---
  {
    id: 110,
    block: "Sector",
    blockIndex: 3,
    title: "Tipo de Artigos",
    description: "O que vendes na tua loja/armazen?",
    type: "multi-select",
    sectorCondition: ["Retalho / Comércio"],
    options: [
      { label: "Bens Alimentares ou Cantina / Minimercado", icon: "ShoppingCart" },
      { label: "Electrodomésticos ou Telemóveis", icon: "Smartphone" },
      { label: "Materiais de Construção / Decoração Casa", icon: "Home" },
      { label: "Material Escolar, Papelaria ou Limpeza", icon: "BookOpen" },
      { label: "Peças Auto / Lubrificantes / Oficina", icon: "Wrench" },
      { label: "Misto ou Bazar", icon: "Layers" },
    ],
  },
  {
    id: 111,
    block: "Sector",
    blockIndex: 3,
    title: "Origem dos Produtos",
    description: "De onde vêm as coisas que vendes?",
    type: "multi-select",
    sectorCondition: ["Retalho / Comércio"],
    options: [
      { label: "Só compramos a fornecedores/armazéns estatais", icon: "Truck" },
      { label: "Importamos directamente de fora", icon: "Plane" },
      { label: "Compramos metade cá e importamos o resto", icon: "Ship" },
      { label: "Trazido nas bagagens de viagens", icon: "Briefcase" },
    ],
  },

  // --- EDUCAÇÃO ---
  {
    id: 112,
    block: "Sector",
    blockIndex: 3,
    title: "Tipo de Formação",
    description: "Qual é o foco da educação?",
    type: "multi-select",
    sectorCondition: ["Educação / Formação"],
    options: [
      { label: "Explicações e reforço escolar (crianças/jovens)", icon: "Pencil" },
      { label: "Cursos Técnicos Profissionais (costura, IT, cabeleireiro)", icon: "Wrench" },
      { label: "Formação para Empresas e Executivos", icon: "Briefcase" },
      { label: "Ensino de Idiomas (inglês, francês)", icon: "Languages" },
      { label: "Creche ou Jardim de Infância", icon: "Baby" },
    ],
  },
  {
    id: 113,
    block: "Sector",
    blockIndex: 3,
    title: "Formato Escolar",
    description: "Como dão as aulas?",
    type: "multi-select",

    sectorCondition: ["Educação / Formação"],
    options: [
      { label: "Damos só as aulas num centro presencial", icon: "Building" },
      { label: "Damos as aulas online no Zoom/Teams", icon: "Monitor" },
      { label: "Gravamos vídeos em plataformas e-learning", icon: "Play" },
      { label: "Ao domicílio do aluno", icon: "Home" },
    ],
  },
  {
    id: 114,
    block: "Sector",
    blockIndex: 3,
    title: "Volume Alunos",
    description: "Quantos formandos ou alunos por mês estima gerir?",
    type: "multi-select",
    sectorCondition: ["Educação / Formação"],
    options: [
      { label: "1 a 10 alunos VIP / individuais", icon: "UserCheck" },
      { label: "10 a 30 formandos em turmas", icon: "Users" },
      { label: "30 a 100 espalhados no mês", icon: "Library" },
      { label: "Mais de 100 volume de escola", icon: "GraduationCap" },
    ],
  },

  // --- TECNOLOGIA / IT ---
  {
    id: 115,
    block: "Sector",
    blockIndex: 3,
    title: "Solução Digital",
    description: "Que tipo de solução de tecnologia ou IA é?",
    type: "multi-select",
    sectorCondition: ["Tecnologia / Software / IA"],
    options: [
      { label: "Aplicação Móvel (iOS/Android)", icon: "Smartphone" },
      { label: "Website ou Plataforma Web (SaaS)", icon: "Globe" },
      { label: "Agência de Marketing Digital/Consultoria", icon: "Megaphone" },
      { label: "Agentes de Inteligência Artificial e Automação", icon: "Bot" },
      { label: "Apoio Ténico / Redes e Manutenção", icon: "Wrench" },
    ],
  },
  {
    id: 116,
    block: "Sector",
    blockIndex: 3,
    title: "Capacidade de Produção",
    description: "No caso de plataformas/software, quem vai codificar ou fazer a solução?",
    type: "multi-select",
    sectorCondition: ["Tecnologia / Software / IA"],
    options: [
      { label: "Eu mesmo sou programador / desenvolvedor", icon: "Code" },
      { label: "Já temos ou contratarei uma equipa local", icon: "Users" },
      { label: "Tenho um parceiro técnico no projecto (sócio)", icon: "Handshake" },
      { label: "Sou de negócios, vou usar no-code/automações", icon: "Wand2" },
      { label: "Vou terceirizar (contratar a Índia, Portugal, etc.)", icon: "Globe" },
    ],
  },

  // --- SERVIÇOS FINANCEIROS / SEGUROS ---
  {
    id: 117,
    block: "Sector",
    blockIndex: 3,
    title: "Operação e Vendas",
    description: "Qual o seu modelo financeiro específico?",
    type: "multi-select",
    sectorCondition: ["Serviços Financeiros / Seguros"],
    options: [
      { label: "Casa de Câmbio ou Mediação", icon: "DollarSign" },
      { label: "Crédito Informal ou Mútuo", icon: "PiggyBank" },
      { label: "Corretora de Seguros", icon: "Shield" },
      { label: "Agência de Contabilidade Integrada", icon: "Calculator" },
    ],
  },
  {
    id: 118,
    block: "Sector",
    blockIndex: 3,
    title: "Volume Moeda",
    description: "Qual o volume médio transaccionado (ou a movimentar) por mês?",
    type: "multi-select",
    sectorCondition: ["Serviços Financeiros / Seguros"],
    options: [
      { label: "Menos de 1.000.000 AOA movimentados", icon: "Coins" },
      { label: "1 a 10 milhões AOA movimentados/segurados", icon: "Banknote" },
      { label: "10 a 50 milhões AOA", icon: "Landmark" },
      { label: "Operações corporativas > 50 milhões", icon: "Building" },
    ],
  },

  // --- LOGÍSTICA / TRANSPORTE ---
  {
    id: 119,
    block: "Sector",
    blockIndex: 3,
    title: "Operação e Serviço",
    description: "Qual o modelo do seu trânsporte ou logística?",
    type: "multi-select",
    sectorCondition: ["Logística / Transporte"],
    options: [
      { label: "Tupuca local (moto / pequenos pacotes)", icon: "Bike" },
      { label: "Frete e Mudanças em viatura local", icon: "Truck" },
      { label: "Transporte Colectivo Urbano", icon: "Bus" },
      { label: "Distribuição Nacional com grande frota", icon: "Ship" },
      { label: "Logística / Despachante e Alfândega", icon: "ClipboardList" },
    ],
  },
  {
    id: 120,
    block: "Sector",
    blockIndex: 3,
    title: "Titularidade Frota",
    description: "A frota é própria?",
    type: "multi-select",
    sectorCondition: ["Logística / Transporte"],
    options: [
      { label: "Tenho o meu mota/carro", icon: "Car" },
      { label: "Temos uma pequena frota financiada/paga", icon: "Truck" },
      { label: "Somos apenas plataforma e conectamos motoristas", icon: "Smartphone" },
      { label: "Não aplicável / Não uso transporte físico", icon: "Wifi" },
    ],
  },


  // ==========================================
  // BLOCO 5 — FINANÇAS E NÚMEROS
  // ==========================================
  {
    id: 8,
    block: "Finanças",
    blockIndex: 4,
    title: "Preço de Venda",
    description: "Se tivesse que fazer a média, quanto cada cliente paga numa compra/serviço?",
    type: "multi-select",
    options: [
      { label: "Venda popular/pequena (Até 5.000 Kz)", icon: "Coins" },
      { label: "Ticket médio (5.000 a 20.000 Kz)", icon: "Banknote" },
      { label: "Valor intermédio (20k a 50.000 Kz)", icon: "Wallet" },
      { label: "Valor Premium/Corporativo (Acima de 50.000 Kz)", icon: "Landmark" },
      { label: "Não tenho um valor bem definido ou depende muito", icon: "HelpCircle" },
    ],
  },
  {
    id: 9,
    block: "Finanças",
    blockIndex: 4,
    title: "Custos Mensais",
    description: "Imagina o custo fixo para as tuas portas estarem abertas ou para ires para a rua trabalhar num mês, quanto seria?",
    type: "multi-select",
    options: [
      { label: "Trabalho em casa (Quase zero ou muito pequeno, até 100k)", icon: "Home" },
      { label: "Uma base ligeira com net e alguma luz (Até 500k AOA/Mês)", icon: "BatteryLow" },
      { label: "Uma estrutura arrendada normal (De 500k a 2 Milhões)", icon: "Building" },
      { label: "Uma estrutura ou frota pesada (Mais de 2 Milhões por mês)", icon: "Factory" },
      { label: "Não sei... preciso de ajuda para estimar", icon: "Pencil" },
    ],
  },
  {
    id: 10,
    block: "Finanças",
    blockIndex: 4,
    title: "Capital Disponível",
    description: "Onde estás agora a nível de capital para arrancar / sustentar as operações?",
    type: "multi-select",
    options: [
      { label: "Abaixo de 500.000 Kz (Quero base bootstrapping)", icon: "BatteryWarning" },
      { label: "Abaixo de 2.000.000 Kz (Tenho pequeno pé de meia)", icon: "PiggyBank" },
      { label: "Abaixo de 10.000.000 Kz", icon: "Wallet" },
      { label: "Acima de 10 Milhões AOA ou vou procurar investidor", icon: "Banknote" },
      { label: "Ainda não tenho um kwanza", icon: "Frown" },
    ],
  },

  // ==========================================
  // BLOCO 6 — MARCA
  // ==========================================
  {
    id: 11,
    block: "Marca",
    blockIndex: 5,
    title: "Nome do Negócio",
    description: "Escreva o nome ou peça sugestões automáticas à nossa IA baseadas na região de Angola.",
    type: "text-input",
    hasAiGenerate: true,
    placeholder: "O nome do seu negócio...",
  },
  {
    id: 12,
    block: "Marca",
    blockIndex: 5,
    title: "Tipo de Logo",
    description: "Que tipo de logo quer para a sua marca? Escolha o estilo que melhor representa o seu negócio.",
    type: "logo-type-select",
  },

  // ==========================================
  // BLOCO 7 — CONTACTO
  // ==========================================
  {
    id: 13,
    block: "Contacto",
    blockIndex: 6,
    title: "Último Passo",
    description: "O teu Business Plan em PDF será preparado. Onde pretendes receber os relatórios?",
    type: "contact-input",
  },
];
