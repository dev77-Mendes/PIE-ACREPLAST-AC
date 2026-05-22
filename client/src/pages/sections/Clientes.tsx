// PIE Digital NR-10 — Clientes section
// Cadastro e listagem de clientes com indicador de obrigatoriedade do PIE

import { useState } from "react";
import { usePie } from "@/contexts/PieContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDelete from "@/components/ConfirmDelete";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Building2, Phone, MapPin, Zap } from "lucide-react";

interface ClienteForm {
  razao: string;
  cnpj: string;
  carga: string;
  responsavel: string;
  telefone: string;
  cidade: string;
  endereco: string;
  tensao: string;
  subestacao: string;
  solar: string;
}

const EMPTY: ClienteForm = {
  razao: "", cnpj: "", carga: "", responsavel: "", telefone: "",
  cidade: "Rio Branco/AC", endereco: "", tensao: "", subestacao: "Não", solar: "Não",
};

export default function Clientes() {
  const { clientes, add, remove } = usePie();
  const [form, setForm] = useState<ClienteForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const set = (k: keyof ClienteForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.razao.trim()) { toast.error("Razão social é obrigatória."); return; }
    setSaving(true);
    try {
      await add("clientes", { ...form, carga: Number(form.carga) || 0 });
      setForm(EMPTY);
      toast.success("Cliente cadastrado com sucesso!");
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === "permission-denied"
        ? "Permissão negada. Configure as regras do Firestore em Configurações."
        : "Erro ao salvar cliente.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = clientes.filter((c) =>
    c.razao.toLowerCase().includes(search.toLowerCase()) ||
    (c.cnpj ?? "").includes(search) ||
    (c.cidade ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fade-in-up">
      {/* Form */}
      <div className="xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
              Cadastrar cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Razão social *</Label>
                <Input value={form.razao} onChange={(e) => set("razao", e.target.value)} placeholder="Nome da empresa" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">CNPJ</Label>
                  <Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Carga instalada (kW)</Label>
                  <Input type="number" step="0.1" value={form.carga} onChange={(e) => set("carga", e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Responsável legal</Label>
                  <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(68) 99999-9999" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Endereço</Label>
                <Input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cidade / UF</Label>
                <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tensão de entrada</Label>
                <Input value={form.tensao} onChange={(e) => set("tensao", e.target.value)} placeholder="127/220 V, 220/380 V..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Possui subestação?</Label>
                  <Select value={form.subestacao} onValueChange={(v) => set("subestacao", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Não">Não</SelectItem>
                      <SelectItem value="Sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Sistema solar?</Label>
                  <Select value={form.solar} onValueChange={(v) => set("solar", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Não">Não</SelectItem>
                      <SelectItem value="Sim">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full font-bold"
                style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
              >
                {saving ? "Salvando..." : "Salvar cliente"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div className="xl:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Clientes cadastrados ({clientes.length})</CardTitle>
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-[200px] h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{clientes.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="border border-border rounded-xl p-4 hover:border-orange-200 hover:bg-orange-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-foreground">{c.razao}</h4>
                          <StatusBadge
                            value={Number(c.carga) >= 75 ? "PIE obrigatório" : "Avaliar obrigatoriedade"}
                          />
                        </div>
                        <div className="mt-2 space-y-1">
                          {c.cnpj && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Building2 className="w-3 h-3" /> CNPJ: {c.cnpj}
                            </p>
                          )}
                          {c.cidade && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" /> {c.cidade}
                            </p>
                          )}
                          {c.telefone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Phone className="w-3 h-3" /> {c.telefone}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Zap className="w-3 h-3" />
                            Carga: {c.carga ?? 0} kW
                            {c.tensao && ` • ${c.tensao}`}
                            {c.subestacao === "Sim" && " • Subestação"}
                            {c.solar === "Sim" && " • Solar"}
                          </p>
                        </div>
                      </div>
                      <ConfirmDelete onConfirm={() => remove("clientes", c.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
