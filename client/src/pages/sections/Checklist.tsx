// PIE Digital NR-10 — Checklist NR-10 section

import { useState } from "react";
import { usePie } from "@/contexts/PieContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDelete from "@/components/ConfirmDelete";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, CheckSquare } from "lucide-react";

const ITENS_CHECKLIST = [
  "Diagrama unifilar atualizado",
  "Quadros elétricos identificados e sinalizados",
  "Sinalização de risco elétrico nos pontos críticos",
  "Proteção contra contato acidental (invólucros, barreiras)",
  "Sistema de aterramento documentado e ensaiado",
  "DR/DPS instalados onde aplicável",
  "Procedimentos de trabalho disponíveis e atualizados",
  "Trabalhadores autorizados NR-10 com certificados válidos",
  "EPIs e EPCs disponíveis e dentro da validade",
  "Plano de manutenção elétrica preventiva",
  "Inventário de riscos elétricos atualizado",
  "ART/TRT emitida por profissional habilitado",
  "Laudo de instalações elétricas vigente",
  "Proteção contra sobrecorrente adequada",
  "Identificação de circuitos nos quadros",
  "Condutores e cabos em bom estado",
  "Tomadas e plugues em conformidade",
  "Iluminação de emergência funcional",
  "Extintores de incêndio adequados ao risco elétrico",
  "Acesso seguro às instalações elétricas",
];

interface ChecklistForm {
  clienteId: string;
  item: string;
  status: string;
  obs: string;
  [key: string]: unknown;
}

const EMPTY: ChecklistForm = {
  clienteId: "", item: ITENS_CHECKLIST[0], status: "Conforme", obs: "",
};

export default function Checklist() {
  const { clientes, checklist, add, remove } = usePie();
  const [form, setForm] = useState<ChecklistForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCliente, setFilterCliente] = useState("todos");

  const set = (k: keyof ChecklistForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const clienteName = (id: string) => clientes.find((c) => c.id === id)?.razao ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    setSaving(true);
    try {
      await add("checklist", form);
      setForm((p) => ({ ...p, obs: "" }));
      toast.success("Item do checklist salvo!");
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === "permission-denied"
        ? "Permissão negada. Configure as regras do Firestore em Configurações."
        : "Erro ao salvar item.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterCliente === "todos"
    ? checklist
    : checklist.filter((i) => i.clienteId === filterCliente);

  const conformes = filtered.filter((i) => i.status === "Conforme").length;
  const naoConformes = filtered.filter((i) => i.status === "Não conforme").length;
  const parciais = filtered.filter((i) => i.status === "Parcial").length;

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Registrar item do checklist
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
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Item verificado</Label>
                <Select value={form.item} onValueChange={(v) => set("item", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ITENS_CHECKLIST.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Conformidade</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Conforme", "Parcial", "Não conforme"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Evidência / Observação</Label>
                <Textarea value={form.obs} onChange={(e) => set("obs", e.target.value)} className="min-h-[60px]" placeholder="Descreva a evidência ou observação técnica..." />
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

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-green-700">{conformes}</p>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Conformes</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-amber-700">{parciais}</p>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Parciais</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-black text-red-700">{naoConformes}</p>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Não conformes</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Registros do checklist ({filtered.length})</CardTitle>
            <Select value={filterCliente} onValueChange={setFilterCliente}>
              <SelectTrigger className="h-8 text-xs w-[180px]">
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os clientes</SelectItem>
                {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum item registrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Item verificado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((i) => (
                    <TableRow key={i.id} className="data-row">
                      <TableCell className="font-medium text-sm">{clienteName(i.clienteId)}</TableCell>
                      <TableCell className="text-sm">{i.item}</TableCell>
                      <TableCell><StatusBadge value={i.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                        <span className="truncate block">{i.obs || "—"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmDelete onConfirm={() => remove("checklist", i.id)} />
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
