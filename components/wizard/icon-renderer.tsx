"use client";

import { useState, useEffect } from "react";
import type { LucideProps } from "lucide-react";

interface IconRendererProps extends LucideProps {
  name: string;
}

const iconCache = new Map<string, React.ComponentType<LucideProps>>();

export function IconRenderer({ name, ...props }: IconRendererProps) {
  const [Icon, setIcon] = useState<React.ComponentType<LucideProps> | null>(null);

  useEffect(() => {
    if (iconCache.has(name)) {
      setIcon(() => iconCache.get(name)!);
      return;
    }
    import("lucide-react").then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resolved = (mod as any)[name] as React.ComponentType<LucideProps> | undefined;
      if (resolved) {
        iconCache.set(name, resolved);
        setIcon(() => resolved);
      }
    });
  }, [name]);

  if (!Icon) return <span className="inline-block w-4 h-4" />;
  return <Icon {...props} />;
}
