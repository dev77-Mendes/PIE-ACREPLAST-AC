// PIE Digital NR-10 — Documentos section
// Gestão completa dos documentos do prontuário

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
import { Plus, ExternalLink, FolderOpen } from "lucide-react";

const TIPOS_DOC = [
  "Diagrama unifilar atualizado",
  "Projeto elétrico",
  "Laudo de aterramento",
  "Laudo de SPDA",
  "RTI - Relatório Técnico de Inspeção",
  "Procedimento de trabalho",
  "Certificado NR-10",
  "ART/TRT",
  "Laudo de instalações elétricas",
  "Plano de manutenção elétrica",
  "Inventário de riscos elétricos",
  "Outro documento",
];

interface DocForm {
  clienteId: string;
  tipo: string;
  validade: string;
  status: string;
  link: string;
  responsavelTecnico: string;
  obs: string;
  [key: string]: unknown;
}

const EMPTY: DocForm = {
  clienteId: "", tipo: TIPOS_DOC[0], validade: "", status: "Válido",
  link: "", responsavelTecnico: "", obs: "",
};

export default function Documentos() {
  const { clientes, documentos, add, remove } = usePie();
  const [form, setForm] = useState<DocForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCliente, setFilterCliente] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const set = (k: keyof DocForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const clienteName = (id: string) => clientes.find((c) => c.id === id)?.razao ?? "—";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    setSaving(true);
    try {
      await add("documentos", form);
      setForm(EMPTY);
      toast.success("Documento salvo com sucesso!");
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === "permission-denied"
        ? "Permissão negada. Configure as regras do Firestore em Configurações."
        : "Erro ao salvar documento.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = documentos.filter((d) => {
    const byCliente = filterCliente === "todos" || d.clienteId === filterCliente;
    const byStatus = filterStatus === "todos" || d.status === filterStatus;
    return byCliente && byStatus;
  });

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Adicionar documento ao prontuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cliente *</Label>
                <Select value={form.clienteId} onValueChange={(v) => set("clienteId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={clientes.length === 0 ? "Cadastre um cliente primeiro" : "Selecionar cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tipo de documento</Label>
                <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_DOC.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Validade</Label>
                <Input type="date" value={form.validade} onChange={(e) => set("validade", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Válido", "Pendente", "Vencido", "Em revisão"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Link do arquivo</Label>
                <Input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="Drive, Storage ou URL pública" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Responsável técnico</Label>
                <Input value={form.responsavelTecnico} onChange={(e) => set("responsavelTecnico", e.target.value)} placeholder="Nome, CREA/CFT" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Observação</Label>
              <Textarea value={form.obs} onChange={(e) => set("obs", e.target.value)} className="min-h-[72px]" />
            </div>
            <Button
              type="submit"
              disabled={saving}
              style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
              className="font-bold"
            >
              {saving ? "Salvando..." : "Salvar documento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">Documentos ({filtered.length})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger className="h-8 text-xs w-[180px]">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {["Válido", "Pendente", "Vencido", "Em revisão"].map((s) => (
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
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum documento encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id} className="data-row">
                      <TableCell className="font-medium text-sm">{clienteName(d.clienteId)}</TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <span className="truncate block">{d.tipo}</span>
                        {d.obs && <span className="text-xs text-muted-foreground block truncate">{d.obs}</span>}
                      </TableCell>
                      <TableCell><StatusBadge value={d.status} /></TableCell>
                      <TableCell className="text-sm font-mono">{d.validade || "—"}</TableCell>
                      <TableCell className="text-sm">{d.responsavelTecnico || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {d.link && (
                            <a href={d.link} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                                <ExternalLink className="w-3 h-3" /> Abrir
                              </Button>
                            </a>
                          )}
                          <ConfirmDelete onConfirm={() => remove("documentos", d.id)} />
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
