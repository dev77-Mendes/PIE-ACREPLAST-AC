// PIE Digital NR-10 — Status badge component
// Classifies text into ok/warn/bad/info categories

import { cn } from "@/lib/utils";

const classify = (v: string): "ok" | "warn" | "bad" | "info" => {
  const t = (v || "").toLowerCase();
  if (
    t.includes("conforme") ||
    t.includes("válido") ||
    t.includes("autorizado") ||
    t.includes("aprovado") ||
    t.includes("concluído") ||
    t.includes("validado") ||
    t.includes("baixo")
  )
    return "ok";
  if (
    t.includes("pendente") ||
    t.includes("parcial") ||
    t.includes("médio") ||
    t.includes("andamento") ||
    t.includes("revisão")
  )
    return "warn";
  if (
    t.includes("crítico") ||
    t.includes("alto") ||
    t.includes("vencido") ||
    t.includes("não") ||
    t.includes("atrasado") ||
    t.includes("reprovado") ||
    t.includes("aberto")
  )
    return "bad";
  return "info";
};

const CLASSES: Record<string, string> = {
  ok: "badge-ok",
  warn: "badge-warn",
  bad: "badge-bad",
  info: "badge-info",
};

interface StatusBadgeProps {
  value: string;
  className?: string;
}

export default function StatusBadge({ value, className }: StatusBadgeProps) {
  const type = classify(value);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
        CLASSES[type],
        className
      )}
    >
      {value || "—"}
    </span>
  );
}
