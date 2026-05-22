// PIE Digital NR-10 — Trabalhadores autorizados section

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
import { Plus, HardHat, ExternalLink } from "lucide-react";

interface TrabForm {
  clienteId: string;
  nome: string;
  funcao: string;
  tipo: string;
  validade: string;
  status: string;
  link: string;
  [key: string]: unknown;
}

const EMPTY: TrabForm = {
  clienteId: "", nome: "", funcao: "", tipo: "NR-10 Básico",
  validade: "", status: "Autorizado", link: "",
};

export default function Trabalhadores() {
  const { clientes, trabalhadores, add, remove } = usePie();
  const [form, setForm] = useState<TrabForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCliente, setFilterCliente] = useState("todos");

  const set = (k: keyof TrabForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const clienteName = (id: string) => clientes.find((c) => c.id === id)?.razao ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    if (!form.nome.trim()) { toast.error("Informe o nome do trabalhador."); return; }
    setSaving(true);
    try {
      await add("trabalhadores", form);
      setForm(EMPTY);
      toast.success("Trabalhador cadastrado com sucesso!");
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === "permission-denied"
        ? "Permissão negada. Configure as regras do Firestore em Configurações."
        : "Erro ao salvar trabalhador.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterCliente === "todos"
    ? trabalhadores
    : trabalhadores.filter((t) => t.clienteId === filterCliente);

  // Check expiring in 30 days
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiring = filtered.filter((t) => t.validade && new Date(t.validade) <= in30 && new Date(t.validade) >= today);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Cadastrar trabalhador autorizado
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
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nome completo *</Label>
                <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome do trabalhador" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Função / Cargo</Label>
                <Input value={form.funcao} onChange={(e) => set("funcao", e.target.value)} placeholder="Eletricista, técnico..." />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tipo de autorização</Label>
                <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["NR-10 Básico", "NR-10 SEP", "Qualificado", "Habilitado", "Capacitado"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Validade do treinamento</Label>
                <Input type="date" value={form.validade} onChange={(e) => set("validade", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Autorizado", "Pendente", "Vencido"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Link certificado/ASO</Label>
                <Input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="URL do documento" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
              className="font-bold"
            >
              {saving ? "Salvando..." : "Salvar trabalhador"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {expiring.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-amber-800 mb-2">
              ⚠️ {expiring.length} trabalhador(es) com treinamento vencendo em 30 dias:
            </p>
            <div className="space-y-1">
              {expiring.map((t) => (
                <p key={t.id} className="text-xs text-amber-700">
                  {t.nome} — {t.tipo} — vence em {t.validade}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Trabalhadores autorizados ({filtered.length})</CardTitle>
            <Select value={filterCliente} onValueChange={setFilterCliente}>
              <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue placeholder="Todos" /></SelectTrigger>
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
              <HardHat className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum trabalhador cadastrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Autorização</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} className="data-row">
                      <TableCell className="font-medium text-sm">{clienteName(t.clienteId)}</TableCell>
                      <TableCell className="text-sm font-semibold">{t.nome || "—"}</TableCell>
                      <TableCell className="text-sm">{t.funcao || "—"}</TableCell>
                      <TableCell className="text-sm">{t.tipo}</TableCell>
                      <TableCell className="text-sm font-mono">{t.validade || "—"}</TableCell>
                      <TableCell><StatusBadge value={t.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {t.link && (
                            <a href={t.link} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                                <ExternalLink className="w-3 h-3" /> Doc
                              </Button>
                            </a>
                          )}
                          <ConfirmDelete onConfirm={() => remove("trabalhadores", t.id)} />
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
