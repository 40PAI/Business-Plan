"use client";

interface ConditionalFieldsProps {
  fields: { label: string; placeholder: string }[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function ConditionalFields({ fields, values, onChange }: ConditionalFieldsProps) {
  return (
    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-3 duration-500">
      {fields.map((field) => (
        <div key={field.label}>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            {field.label}
          </label>
          <input
            type="text"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-foreground/30 transition-all"
            placeholder={field.placeholder}
            value={values[field.label] || ""}
            onChange={(e) =>
              onChange({ ...values, [field.label]: e.target.value })
            }
          />
        </div>
      ))}
    </div>
  );
}
