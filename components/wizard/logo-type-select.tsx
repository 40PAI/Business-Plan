"use client";

interface LogoExample {
  src: string;
  alt: string;
  bg?: string;
}

interface LogoType {
  id: string;
  name: string;
  bullets: string[];
  goodFor: string;
  examples: LogoExample[];
  recommended?: boolean;
}

const LOGO_TYPES: LogoType[] = [
  {
    id: "wordmark",
    name: "1. Logotipo (Wordmark)",
    bullets: ["Baseado apenas em texto", "Usa tipografia personalizada"],
    goodFor: "marcas que querem fixar o nome na mente",
    examples: [
      { src: "/logos/coca-cola.png", alt: "Coca-Cola", bg: "#fff" },
      { src: "/logos/google.png", alt: "Google", bg: "#fff" },
      { src: "/logos/visa.png", alt: "Visa", bg: "#fff" },
    ],
  },
  {
    id: "lettermark",
    name: "2. Monograma (Lettermark)",
    bullets: ["Usa iniciais da empresa", "Forma reduzida do nome"],
    goodFor: "nomes longos",
    examples: [
      { src: "/logos/ibm.png", alt: "IBM", bg: "#1F70C1" },
      { src: "/logos/nasa.png", alt: "NASA", bg: "#1B3F8B" },
      { src: "/logos/hp.png", alt: "HP", bg: "#0096D6" },
    ],
  },
  {
    id: "brandmark",
    name: "3. Símbolo / Ícone (Brandmark)",
    bullets: ["Apenas imagem, sem texto", "Forte reconhecimento visual"],
    goodFor: "marcas já conhecidas ou com grande ambição",
    examples: [
      { src: "/logos/apple.png", alt: "Apple", bg: "#fff" },
      { src: "/logos/nike.png", alt: "Nike", bg: "#fff" },
      { src: "/logos/linkedin.png", alt: "LinkedIn", bg: "#0A66C2" },
    ],
  },
  {
    id: "combination",
    name: "4. Combinação (Combination Mark)",
    bullets: ["Texto + símbolo juntos", "Pode ser usado separado depois"],
    goodFor: "a maioria dos negócios",
    recommended: true,
    examples: [
      { src: "/logos/adidas.png", alt: "Adidas", bg: "#fff" },
      { src: "/logos/burgerking.png", alt: "Burger King", bg: "#F5EDD6" },
      { src: "/logos/pepsi-combo.png", alt: "Pepsi", bg: "#fff" },
    ],
  },
  {
    id: "emblem",
    name: "5. Emblema",
    bullets: ["Texto dentro de um símbolo/forma fechada", "Estilo mais clássico"],
    goodFor: "marcas tradicionais ou institucionais",
    examples: [
      { src: "/logos/bmw.png", alt: "BMW", bg: "#fff" },
      { src: "/logos/harley.png", alt: "Harley-Davidson", bg: "#fff" },
      { src: "/logos/starbucks.png", alt: "Starbucks", bg: "#fff" },
    ],
  },
  {
    id: "mascot",
    name: "6. Mascote",
    bullets: ["Personagem representa a marca", "Cria conexão emocional"],
    goodFor: "marcas descontraídas ou voltadas ao público",
    examples: [
      { src: "/logos/kfc.png", alt: "KFC", bg: "#fff" },
      { src: "/logos/pringles.png", alt: "Pringles", bg: "#fff" },
      { src: "/logos/michelin.png", alt: "Michelin", bg: "#fff" },
    ],
  },
  {
    id: "abstract",
    name: "7. Logotipo Abstrato",
    bullets: ["Forma não literal, simbólica", "Moderno e escalável"],
    goodFor: "marcas modernas e escaláveis",
    examples: [
      { src: "/logos/pepsi-globe.png", alt: "Pepsi Globe", bg: "#fff" },
      { src: "/logos/bp.png", alt: "BP", bg: "#fff" },
      { src: "/logos/airbnb.png", alt: "Airbnb", bg: "#fff" },
    ],
  },
  {
    id: "dynamic",
    name: "8. Logotipo Dinâmico (Modular)",
    bullets: ["Muda de cor, forma ou fundo", "Altamente adaptável"],
    goodFor: "marcas digitais ou criativas",
    examples: [
      { src: "/logos/mtv.png", alt: "MTV", bg: "#fff" },
      { src: "/logos/spotify.png", alt: "Spotify", bg: "#1DB954" },
      { src: "/logos/google-doodle.png", alt: "Google Doodle", bg: "#fff" },
    ],
  },
];

interface LogoTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function LogoTypeSelect({ value, onChange }: LogoTypeSelectProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {LOGO_TYPES.map((type) => {
        const active = value === type.id;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`relative flex flex-col text-left rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden hover:scale-[1.01] focus:outline-none ${
              active
                ? "border-primary/70 shadow-md ring-2 ring-primary/30 bg-primary/5"
                : "border-border bg-card hover:border-primary/30 hover:bg-secondary/40"
            }`}
          >
            {/* Recommended badge */}
            {type.recommended && (
              <div className="absolute top-2.5 right-2.5 z-10 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow">
                Recomendado
              </div>
            )}

            {/* Logo examples strip */}
            <div className="grid grid-cols-3 w-full border-b border-border/50">
              {type.examples.map((ex) => (
                <div
                  key={ex.alt}
                  className="flex items-center justify-center p-3 h-[72px]"
                  style={{ backgroundColor: ex.bg || "#f8f9fa" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.src}
                    alt={ex.alt}
                    className="max-h-[48px] max-w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      // fallback: hide broken image
                      (e.target as HTMLImageElement).style.opacity = "0.2";
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="p-4 space-y-1.5">
              <p className={`text-sm font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>
                {type.name}
              </p>

              <ul className="space-y-0.5">
                {type.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 shrink-0 text-primary/50">•</span>
                    {b}
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted-foreground/70 italic pt-0.5">
                Bom para:{" "}
                <span className="not-italic font-medium text-muted-foreground">{type.goodFor}</span>
              </p>
            </div>

            {/* Active indicator */}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}

export { LOGO_TYPES };
