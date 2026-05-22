// PIE Digital NR-10 — Relatórios PDF e partilha somente leitura

import { useMemo, useRef, useState } from "react";
import { usePie } from "@/contexts/PieContext";
import { useAuth } from "@/contexts/AuthContext";
import { createShareId, savePublicShare } from "@/lib/firebase";
import ProntuarioReport, { type ProntuarioReportData } from "@/components/ProntuarioReport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Download, ExternalLink, FileText, Loader2, Share2 } from "lucide-react";

declare const html2pdf: (element?: HTMLElement) => {
  set: (opts: Record<string, unknown>) => ReturnType<typeof html2pdf>;
  from: (el: HTMLElement) => ReturnType<typeof html2pdf>;
  save: () => Promise<void>;
};

export default function Relatorios() {
  const { user } = useAuth();
  const { clientes, documentos, checklist, inspecoes, acoes, trabalhadores, epis } = usePie();
  const [clienteId, setClienteId] = useState("");
  const [rt, setRt] = useState("");
  const [art, setArt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const cliente = clientes.find((c) => c.id === clienteId);

  const reportData = useMemo<ProntuarioReportData | null>(() => {
    if (!cliente) return null;
    return {
      cliente,
      documentos: documentos.filter((d) => d.clienteId === clienteId),
      checklist: checklist.filter((i) => i.clienteId === clienteId),
      inspecoes: inspecoes.filter((i) => i.clienteId === clienteId),
      acoes: acoes.filter((a) => a.clienteId === clienteId),
      trabalhadores: trabalhadores.filter((t) => t.clienteId === clienteId),
      epis: epis.filter((e) => e.clienteId === clienteId),
      rt,
      art,
      emittedAt: new Date().toISOString(),
    };
  }, [acoes, art, checklist, cliente, clienteId, documentos, epis, inspecoes, rt, trabalhadores]);

  const handleGenerate = async () => {
    if (!cliente) { toast.error("Selecione um cliente."); return; }
    setGenerating(true);
    try {
      const el = reportRef.current;
      if (!el) return;
      const h2p = (window as unknown as { html2pdf: typeof html2pdf }).html2pdf;
      await h2p(el)
        .set({
          margin: 12,
          filename: `PIE_${cliente.razao.replace(/\W+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
      toast.success("PDF gerado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF. Verifique o console.");
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!user || !cliente || !reportData) {
      toast.error("Selecione um cliente antes de compartilhar.");
      return;
    }
    setSharing(true);
    try {
      const shareId = createShareId();
      await savePublicShare(shareId, {
        ownerUid: user.uid,
        clienteId: cliente.id,
        data: reportData as unknown as Record<string, unknown>,
      });
      const url = `${window.location.origin}/share/${shareId}`;
      setShareUrl(url);
      await navigator.clipboard?.writeText(url);
      toast.success("Link somente leitura criado e copiado.");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível criar o link de compartilhamento.");
    } finally {
      setSharing(false);
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard?.writeText(shareUrl);
    toast.success("Link copiado.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Gerar e compartilhar prontuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cliente *</Label>
              <Select value={clienteId} onValueChange={(value) => { setClienteId(value); setShareUrl(""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={clientes.length === 0 ? "Cadastre um cliente" : "Selecionar cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.razao}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Responsável técnico</Label>
              <Input value={rt} onChange={(e) => setRt(e.target.value)} placeholder="Nome, CREA/CFT" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">ART / TRT</Label>
              <Input value={art} onChange={(e) => setArt(e.target.value)} placeholder="Número da ART/TRT" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerate}
              disabled={generating || !clienteId}
              style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
              className="font-bold gap-2 w-full sm:w-auto"
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando PDF...</> : <><Download className="w-4 h-4" /> Gerar PDF</>}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleShare}
              disabled={sharing || !clienteId}
              className="font-bold gap-2 w-full sm:w-auto"
            >
              {sharing ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando link...</> : <><Share2 className="w-4 h-4" /> Compartilhar visualização</>}
            </Button>
          </div>

          {shareUrl && (
            <div className="mt-4 rounded-xl border bg-muted/40 p-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Link somente leitura</Label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-xs" />
                <Button type="button" variant="outline" onClick={copyShareUrl} className="gap-2">
                  <Copy className="w-4 h-4" /> Copiar
                </Button>
                <Button type="button" variant="outline" onClick={() => window.open(shareUrl, "_blank", "noopener,noreferrer")} className="gap-2">
                  <ExternalLink className="w-4 h-4" /> Abrir
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Este link permite apenas visualizar o prontuário. Fiscais e interessados não terão botões de cadastro, edição ou exclusão.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {reportData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pré-visualização do relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={reportRef} className="overflow-x-auto bg-white p-2 sm:p-0">
              <ProntuarioReport {...reportData} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">Selecione um cliente acima para visualizar, gerar ou compartilhar o prontuário.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
