// PIE Digital NR-10 — Dashboard section
// KPIs, conformidade, distribuição de riscos, alertas de vencimento

import { usePie } from "@/contexts/PieContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Building2,
  FolderOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

const RISK_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#7c3aed"];

export default function Dashboard() {
  const { clientes, documentos, checklist, inspecoes, acoes, trabalhadores, epis } = usePie();

  // KPIs
  const totalPendencias =
    acoes.filter((a) => !["Concluído", "Validado"].includes(a.status)).length +
    documentos.filter((d) => ["Pendente", "Vencido"].includes(d.status)).length;

  const totalChecks = checklist.length || 1;
  const ok = checklist.filter((i) => i.status === "Conforme").length;
  const closed = acoes.filter((a) => a.status === "Concluído").length;
  const totalA = acoes.length || 1;
  const validDocs = documentos.filter((d) => d.status === "Válido").length;
  const totalDocs = documentos.length || 1;
  const conformidade = Math.round(
    (ok / totalChecks) * 55 + (closed / totalA) * 25 + (validDocs / totalDocs) * 20
  );

  // Risk distribution
  const riskData = ["Baixo", "Médio", "Alto", "Crítico"].map((r, i) => ({
    name: r,
    value: inspecoes.filter((x) => x.risco === r).length,
    color: RISK_COLORS[i],
  })).filter((d) => d.value > 0);

  // Documents by status
  const docStatusData = ["Válido", "Pendente", "Vencido", "Em revisão"].map((s) => ({
    name: s,
    total: documentos.filter((d) => d.status === s).length,
  }));

  // Upcoming expirations (next 60 days)
  const today = new Date();
  const in60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const expiring = [
    ...documentos
      .filter((d) => d.validade && new Date(d.validade) <= in60 && new Date(d.validade) >= today)
      .map((d) => ({ tipo: "Documento", nome: d.tipo, validade: d.validade!, status: d.status })),
    ...trabalhadores
      .filter((t) => t.validade && new Date(t.validade) <= in60 && new Date(t.validade) >= today)
      .map((t) => ({ tipo: "Trabalhador", nome: t.nome ?? "—", validade: t.validade!, status: t.status })),
    ...epis
      .filter((e) => e.validade && new Date(e.validade) <= in60 && new Date(e.validade) >= today)
      .map((e) => ({ tipo: "EPI/EPC", nome: e.nome ?? "—", validade: e.validade!, status: e.status })),
  ].sort((a, b) => a.validade.localeCompare(b.validade));

  const kpis = [
    {
      label: "Clientes cadastrados",
      value: clientes.length,
      icon: Building2,
      color: "oklch(0.55 0.18 255)",
    },
    {
      label: "Documentos anexados",
      value: documentos.length,
      icon: FolderOpen,
      color: "oklch(0.72 0.19 47)",
    },
    {
      label: "Pendências abertas",
      value: totalPendencias,
      icon: AlertTriangle,
      color: totalPendencias > 0 ? "oklch(0.55 0.22 25)" : "oklch(0.52 0.15 145)",
    },
    {
      label: "Conformidade média",
      value: `${conformidade}%`,
      icon: conformidade >= 70 ? CheckCircle2 : TrendingUp,
      color: conformidade >= 70 ? "oklch(0.52 0.15 145)" : "oklch(0.72 0.15 70)",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }, idx) => (
          <Card key={label} className="kpi-card card-hover" style={{ animationDelay: `${idx * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-3xl font-black" style={{ color }}>{value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conformidade bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Índice de conformidade geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${conformidade}%`,
                    background: conformidade >= 70
                      ? "linear-gradient(90deg, oklch(0.52 0.15 145), oklch(0.65 0.17 145))"
                      : conformidade >= 40
                      ? "linear-gradient(90deg, oklch(0.72 0.15 70), oklch(0.82 0.17 52))"
                      : "linear-gradient(90deg, oklch(0.55 0.22 25), oklch(0.65 0.20 25))",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Calculado com base em checklist (55%), plano de ação (25%) e documentos válidos (20%).
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-3xl font-black" style={{
                color: conformidade >= 70 ? "oklch(0.52 0.15 145)" : conformidade >= 40 ? "oklch(0.72 0.15 70)" : "oklch(0.55 0.22 25)"
              }}>
                {conformidade}%
              </p>
              <p className="text-xs text-muted-foreground">
                {conformidade >= 70 ? "Adequado" : conformidade >= 40 ? "Em adequação" : "Crítico"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição de riscos nas inspeções</CardTitle>
          </CardHeader>
          <CardContent>
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {riskData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhuma inspeção registrada ainda.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents by status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Documentos por status</CardTitle>
          </CardHeader>
          <CardContent>
            {documentos.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={docStatusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 255)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Documentos" radius={[6, 6, 0, 0]}>
                    {docStatusData.map((entry, i) => {
                      const colors = ["oklch(0.52 0.15 145)", "oklch(0.72 0.15 70)", "oklch(0.55 0.22 25)", "oklch(0.55 0.18 255)"];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum documento registrado ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring items */}
      {expiring.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <Clock className="w-4 h-4" />
              Itens com vencimento nos próximos 60 dias ({expiring.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiring.slice(0, 8).map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-800 flex-shrink-0">{item.tipo}</span>
                    <span className="truncate text-amber-900 font-medium">{item.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-amber-700 font-mono">{item.validade}</span>
                    <StatusBadge value={item.status} />
                  </div>
                </div>
              ))}
              {expiring.length > 8 && (
                <p className="text-xs text-amber-700 font-medium">+ {expiring.length - 8} outros itens...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Checklist NR-10", value: `${ok}/${checklist.length} conformes`, color: "oklch(0.52 0.15 145)" },
          { label: "Inspeções abertas", value: inspecoes.filter(i => i.status === "Aberto").length, color: "oklch(0.55 0.22 25)" },
          { label: "Trabalhadores autorizados", value: trabalhadores.filter(t => t.status === "Autorizado").length, color: "oklch(0.55 0.18 255)" },
          { label: "EPIs aprovados", value: epis.filter(e => e.status === "Aprovado").length, color: "oklch(0.52 0.15 145)" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">{label}</p>
              <p className="text-xl font-black" style={{ color }}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
