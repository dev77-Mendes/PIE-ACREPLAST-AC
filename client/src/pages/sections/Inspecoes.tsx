// PIE Digital NR-10 — Inspeções de campo section

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
import { Plus, Camera, ExternalLink } from "lucide-react";

interface InspecaoForm {
  clienteId: string;
  local: string;
  risco: string;
  descricao: string;
  recomendacao: string;
  foto: string;
  norma: string;
  status: string;
  [key: string]: unknown;
}

const EMPTY: InspecaoForm = {
  clienteId: "", local: "", risco: "Médio", descricao: "",
  recomendacao: "", foto: "", norma: "", status: "Aberto",
};

export default function Inspecoes() {
  const { clientes, inspecoes, add, remove } = usePie();
  const [form, setForm] = useState<InspecaoForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCliente, setFilterCliente] = useState("todos");
  const [filterRisco, setFilterRisco] = useState("todos");

  const set = (k: keyof InspecaoForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const clienteName = (id: string) => clientes.find((c) => c.id === id)?.razao ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    if (!form.descricao.trim()) { toast.error("Descreva a não conformidade."); return; }
    setSaving(true);
    try {
      await add("inspecoes", form);
      setForm(EMPTY);
      toast.success("Inspeção registrada com sucesso!");
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === "permission-denied"
        ? "Permissão negada. Configure as regras do Firestore em Configurações."
        : "Erro ao salvar inspeção.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = inspecoes.filter((i) => {
    const byCliente = filterCliente === "todos" || i.clienteId === filterCliente;
    const byRisco = filterRisco === "todos" || i.risco === filterRisco;
    return byCliente && byRisco;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Registrar inspeção de campo
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
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Local inspecionado</Label>
                <Input value={form.local} onChange={(e) => set("local", e.target.value)} placeholder="QGBT, subestação, sala elétrica..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Grau de risco</Label>
                <Select value={form.risco} onValueChange={(v) => set("risco", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Baixo", "Médio", "Alto", "Crítico"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Não conformidade identificada *</Label>
              <Textarea value={form.descricao} onChange={(e) => set("descricao", e.target.value)} className="min-h-[80px]" placeholder="Descreva detalhadamente a não conformidade..." required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recomendação técnica</Label>
              <Textarea value={form.recomendacao} onChange={(e) => set("recomendacao", e.target.value)} className="min-h-[72px]" placeholder="Ação corretiva recomendada..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Foto/evidência (link)</Label>
                <Input value={form.foto} onChange={(e) => set("foto", e.target.value)} placeholder="URL da foto ou evidência" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Norma relacionada</Label>
                <Input value={form.norma} onChange={(e) => set("norma", e.target.value)} placeholder="NR-10 / NBR 5410 / NBR 5419" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Aberto", "Em andamento", "Corrigido", "Validado"].map((s) => (
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
              {saving ? "Salvando..." : "Salvar inspeção"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Inspeções registradas ({filtered.length})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterRisco} onValueChange={setFilterRisco}>
                <SelectTrigger className="h-8 text-xs w-[120px]"><SelectValue placeholder="Risco" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os riscos</SelectItem>
                  {["Baixo", "Médio", "Alto", "Crítico"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma inspeção registrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Risco</TableHead>
                    <TableHead>Não conformidade</TableHead>
                    <TableHead>Norma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((i) => (
                    <TableRow key={i.id} className="data-row">
                      <TableCell className="font-medium text-sm">{clienteName(i.clienteId)}</TableCell>
                      <TableCell className="text-sm">{i.local || "—"}</TableCell>
                      <TableCell><StatusBadge value={i.risco} /></TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <span className="truncate block">{i.descricao || "—"}</span>
                        {i.recomendacao && <span className="text-xs text-muted-foreground truncate block">{i.recomendacao}</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{i.norma || "—"}</TableCell>
                      <TableCell><StatusBadge value={i.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {i.foto && (
                            <a href={i.foto} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                                <ExternalLink className="w-3 h-3" /> Foto
                              </Button>
                            </a>
                          )}
                          <ConfirmDelete onConfirm={() => remove("inspecoes", i.id)} />
                        </div>
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
