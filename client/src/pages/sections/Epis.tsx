// PIE Digital NR-10 — EPIs, EPCs e ferramentas section

import { useState } from "react";
import { usePie } from "@/contexts/PieContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDelete from "@/components/ConfirmDelete";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Shield } from "lucide-react";

const EPIS_SUGERIDOS = [
  "Luva isolante classe 0 (até 1000V)",
  "Luva isolante classe 1 (até 7500V)",
  "Luva isolante classe 2 (até 17000V)",
  "Capacete de segurança dielétrico",
  "Óculos de proteção contra arco elétrico",
  "Protetor facial contra arco elétrico",
  "Calçado de segurança dielétrico",
  "Roupa de proteção contra arco elétrico",
  "Detector de tensão (teste de ausência de tensão)",
  "Alicate amperímetro",
  "Multímetro digital",
  "Tapete isolante",
  "Manta isolante",
  "Bastão de manobra",
  "Aterramento temporário",
  "Cadeado de bloqueio (LOTO)",
  "Sinalização de segurança elétrica",
  "Extrator de fusível",
  "Outro item",
];

interface EpiForm {
  clienteId: string;
  tipo: string;
  nome: string;
  ca: string;
  validade: string;
  status: string;
  [key: string]: unknown;
}

const EMPTY: EpiForm = {
  clienteId: "", tipo: "EPI", nome: "", ca: "", validade: "", status: "Aprovado",
};

export default function Epis() {
  const { clientes, epis, add, remove } = usePie();
  const [form, setForm] = useState<EpiForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCliente, setFilterCliente] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");

  const set = (k: keyof EpiForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const clienteName = (id: string) => clientes.find((c) => c.id === id)?.razao ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    if (!form.nome.trim()) { toast.error("Informe o nome do item."); return; }
    setSaving(true);
    try {
      await add("epis", form);
      setForm(EMPTY);
      toast.success("Item cadastrado com sucesso!");
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === "permission-denied"
        ? "Permissão negada. Configure as regras do Firestore em Configurações."
        : "Erro ao salvar item.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = epis.filter((e) => {
    const byCliente = filterCliente === "todos" || e.clienteId === filterCliente;
    const byTipo = filterTipo === "todos" || e.tipo === filterTipo;
    return byCliente && byTipo;
  });

  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiring = filtered.filter((e) => e.validade && new Date(e.validade) <= in30 && new Date(e.validade) >= today);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Cadastrar EPI, EPC ou ferramenta
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
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["EPI", "EPC", "Ferramenta", "Instrumento de medição"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nome do item *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  placeholder="Ex: Luva isolante classe 0"
                  list="epis-list"
                  required
                />
                <datalist id="epis-list">
                  {EPIS_SUGERIDOS.map((e) => <option key={e} value={e} />)}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">CA / Certificado</Label>
                <Input value={form.ca} onChange={(e) => set("ca", e.target.value)} placeholder="Número do CA" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Validade / Próximo teste</Label>
                <Input type="date" value={form.validade} onChange={(e) => set("validade", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Condição</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Aprovado", "Reprovado", "Pendente", "Vencido"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
              className="font-bold"
            >
              {saving ? "Salvando..." : "Salvar item"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {expiring.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-amber-800 mb-2">
              ⚠️ {expiring.length} item(ns) com vencimento em 30 dias:
            </p>
            <div className="space-y-1">
              {expiring.map((e) => (
                <p key={e.id} className="text-xs text-amber-700">
                  {e.tipo} — {e.nome} — vence em {e.validade}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Inventário de EPIs/EPCs ({filtered.length})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {["EPI", "EPC", "Ferramenta", "Instrumento de medição"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum item cadastrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Condição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id} className="data-row">
                      <TableCell className="font-medium text-sm">{clienteName(e.clienteId)}</TableCell>
                      <TableCell>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{e.tipo}</span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{e.nome || "—"}</TableCell>
                      <TableCell className="text-sm font-mono">{e.ca || "—"}</TableCell>
                      <TableCell className="text-sm font-mono">{e.validade || "—"}</TableCell>
                      <TableCell><StatusBadge value={e.status} /></TableCell>
                      <TableCell className="text-right">
                        <ConfirmDelete onConfirm={() => remove("epis", e.id)} />
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
