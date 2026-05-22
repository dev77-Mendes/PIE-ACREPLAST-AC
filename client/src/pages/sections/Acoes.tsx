// PIE Digital NR-10 — Plano de Ação section

import { useState } from "react";
import { usePie } from "@/contexts/PieContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDelete from "@/components/ConfirmDelete";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Wrench } from "lucide-react";

interface AcaoForm {
  clienteId: string;
  acao: string;
  prioridade: string;
  prazo: string;
  responsavel: string;
  status: string;
  norma: string;
  [key: string]: unknown;
}

const EMPTY: AcaoForm = {
  clienteId: "", acao: "", prioridade: "Média", prazo: "",
  responsavel: "", status: "Aberto", norma: "",
};

export default function Acoes() {
  const { clientes, acoes, add, remove } = usePie();
  const [form, setForm] = useState<AcaoForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCliente, setFilterCliente] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const set = (k: keyof AcaoForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const clienteName = (id: string) => clientes.find((c) => c.id === id)?.razao ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    if (!form.acao.trim()) { toast.error("Descreva a ação recomendada."); return; }
    setSaving(true);
    try {
      await add("acoes", form);
      setForm(EMPTY);
      toast.success("Ação registrada com sucesso!");
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === "permission-denied"
        ? "Permissão negada. Configure as regras do Firestore em Configurações."
        : "Erro ao salvar ação.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = acoes.filter((a) => {
    const byCliente = filterCliente === "todos" || a.clienteId === filterCliente;
    const byStatus = filterStatus === "todos" || a.status === filterStatus;
    return byCliente && byStatus;
  });

  const abertas = acoes.filter((a) => a.status === "Aberto").length;
  const atrasadas = acoes.filter((a) => a.status === "Atrasado").length;
  const concluidas = acoes.filter((a) => a.status === "Concluído").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Registrar ação de adequação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cliente *</Label>
                <Select value={form.clienteId} onValueChange={(v) => set("clienteId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={clientes.length === 0 ? "Cadastre um cliente" : "Selecionar"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Baixa", "Média", "Alta", "Crítica"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Prazo</Label>
                <Input type="date" value={form.prazo} onChange={(e) => set("prazo", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ação recomendada *</Label>
              <Textarea value={form.acao} onChange={(e) => set("acao", e.target.value)} className="min-h-[80px]" placeholder="Descreva a ação de adequação necessária..." required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Responsável</Label>
                <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} placeholder="Nome do responsável" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Aberto", "Em andamento", "Concluído", "Atrasado"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Norma vinculada</Label>
                <Input value={form.norma} onChange={(e) => set("norma", e.target.value)} placeholder="NR-10, NBR 5410..." />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
              className="font-bold"
            >
              {saving ? "Salvando..." : "Salvar ação"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary */}
      {acoes.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-red-700">{abertas}</p>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Abertas</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-amber-700">{atrasadas}</p>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Atrasadas</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-green-700">{concluidas}</p>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Concluídas</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Plano de ação ({filtered.length})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {["Aberto", "Em andamento", "Concluído", "Atrasado"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma ação registrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id} className="data-row">
                      <TableCell className="font-medium text-sm">{clienteName(a.clienteId)}</TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <span className="truncate block">{a.acao || "—"}</span>
                        {a.norma && <span className="text-xs text-muted-foreground">{a.norma}</span>}
                      </TableCell>
                      <TableCell><StatusBadge value={a.prioridade} /></TableCell>
                      <TableCell className="text-sm font-mono">{a.prazo || "—"}</TableCell>
                      <TableCell className="text-sm">{a.responsavel || "—"}</TableCell>
                      <TableCell><StatusBadge value={a.status} /></TableCell>
                      <TableCell className="text-right">
                        <ConfirmDelete onConfirm={() => remove("acoes", a.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
