"use client";

import { useState } from "react";
import { Phone, Mail, ChevronDown, MessageCircle, Send } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+258", country: "Moçambique", flag: "🇲🇿" },
  { code: "+239", country: "São Tomé", flag: "🇸🇹" },
  { code: "+238", country: "Cabo Verde", flag: "🇨🇻" },
  { code: "+245", country: "Guiné-Bissau", flag: "🇬🇼" },
  { code: "+1", country: "EUA", flag: "🇺🇸" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "+33", country: "França", flag: "🇫🇷" },
  { code: "+27", country: "África do Sul", flag: "🇿🇦" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+971", country: "EAU", flag: "🇦🇪" },
  { code: "+234", country: "Nigéria", flag: "🇳🇬" },
];

type DeliveryPreference = "whatsapp" | "email" | "both";

interface ContactInputProps {
  value: {
    countryCode: string;
    whatsapp: string;
    email: string;
    deliveryPreference?: DeliveryPreference;
  };
  onChange: (value: { countryCode: string; whatsapp: string; email: string; deliveryPreference?: DeliveryPreference }) => void;
}

export function ContactInput({ value, onChange }: ContactInputProps) {
  const [showCodes, setShowCodes] = useState(false);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === value.countryCode) || COUNTRY_CODES[0];

  const handleWhatsappChange = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, "");
    onChange({ ...value, whatsapp: cleaned });
  };

  const handleEmailChange = (val: string) => {
    onChange({ ...value, email: val.trim() });
  };

  const handleSelectCode = (code: string) => {
    onChange({ ...value, countryCode: code });
    setShowCodes(false);
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp field */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-3">
          <Phone size={16} className="text-green-500" />
          Número de WhatsApp
        </label>
        <div className="flex gap-2">
          {/* Country code selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCodes(!showCodes)}
              className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-3 text-sm hover:border-accent-foreground/30 transition-all min-w-[120px]"
            >
              <span className="text-base">{selectedCountry.flag}</span>
              <span className="font-mono text-foreground/80">{selectedCountry.code}</span>
              <ChevronDown size={14} className="text-muted-foreground ml-auto" />
            </button>

            {showCodes && (
              <div className="absolute z-20 top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-background border border-border rounded-xl shadow-xl">
                {COUNTRY_CODES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCode(c.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors ${
                      c.code === value.countryCode ? "bg-secondary/30 text-foreground" : "text-foreground/70"
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="font-mono">{c.code}</span>
                    <span className="text-muted-foreground text-xs">{c.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone number input */}
          <input
            type="tel"
            inputMode="numeric"
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-foreground/30 transition-all"
            placeholder="Ex: 923 456 789"
            value={value.whatsapp}
            onChange={(e) => handleWhatsappChange(e.target.value)}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">e / ou</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Email field */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-3">
          <Mail size={16} className="text-accent-foreground" />
          Email
        </label>
        <input
          type="email"
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-foreground/30 transition-all"
          placeholder="exemplo@email.com"
          value={value.email}
          onChange={(e) => handleEmailChange(e.target.value)}
        />
      </div>

      {/* Delivery preference */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-3">
          <Send size={16} className="text-accent-foreground" />
          Como prefere receber os documentos?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: "whatsapp", icon: <MessageCircle size={16} className="text-green-500" />, label: "WhatsApp" },
            { key: "email",    icon: <Mail size={16} className="text-accent-foreground" />,  label: "Email" },
            { key: "both",     icon: <Send size={16} className="text-primary" />,            label: "Ambos" },
          ] as { key: DeliveryPreference; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => {
            const active = (value.deliveryPreference ?? "both") === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...value, deliveryPreference: key })}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all
                  ${active
                    ? "border-accent-foreground/50 bg-accent-foreground/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-accent-foreground/30"
                  }`}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Preencha pelo menos um dos campos acima para receber os seus documentos.
      </p>
    </div>
  );
}
