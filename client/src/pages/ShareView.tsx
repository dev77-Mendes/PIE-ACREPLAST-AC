import { useEffect, useMemo, useState } from "react";
import ProntuarioReport, { type ProntuarioReportData } from "@/components/ProntuarioReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicShare, type PublicShareRecord } from "@/lib/firebase";
import { Download, Eye, Loader2, ShieldCheck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

declare const html2pdf: (element?: HTMLElement) => {
  set: (opts: Record<string, unknown>) => ReturnType<typeof html2pdf>;
  from: (el: HTMLElement) => ReturnType<typeof html2pdf>;
  save: () => Promise<void>;
};

export default function ShareView() {
  const shareId = useMemo(() => window.location.pathname.split("/share/")[1]?.split("/")[0] ?? "", []);
  const [record, setRecord] = useState<(PublicShareRecord & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getPublicShare(shareId);
        if (!cancelled) setRecord(data && data.active ? data : null);
      } catch (error) {
        console.error(error);
        if (!cancelled) setRecord(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [shareId]);

  const reportData = record?.data as unknown as ProntuarioReportData | undefined;

  const handleDownload = async () => {
    const el = document.getElementById("readonly-report");
    if (!el || !reportData) return;
    setGenerating(true);
    try {
      const h2p = (window as unknown as { html2pdf: typeof html2pdf }).html2pdf;
      await h2p(el)
        .set({
          margin: 12,
          filename: `PIE_${reportData.cliente.razao.replace(/\W+/g, "_")}_visualizacao.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível gerar o PDF desta visualização.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <PublicShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p>Carregando visualização do prontuário...</p>
        </div>
      </PublicShell>
    );
  }

  if (!record || !reportData) {
    return (
      <PublicShell>
        <Card className="max-w-xl mx-auto mt-10">
          <CardContent className="py-12 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-bold mb-2">Link indisponível</h1>
            <p className="text-sm text-muted-foreground">
              O link de visualização não existe, foi desativado ou não está mais disponível.
            </p>
          </CardContent>
        </Card>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl space-y-4">
        <Card className="no-print">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-green-100 p-2 text-green-700">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base">Visualização somente leitura</h1>
                <p className="text-sm text-muted-foreground">
                  Este prontuário foi partilhado para consulta. Não há permissões de cadastro, edição ou exclusão nesta tela.
                </p>
              </div>
            </div>
            <Button onClick={handleDownload} disabled={generating} className="gap-2 w-full sm:w-auto">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><Download className="w-4 h-4" /> Baixar PDF</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6 overflow-x-auto">
            <div id="readonly-report">
              <ProntuarioReport {...reportData} compact />
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="no-print border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <img src="/pie-logo.png" alt="PIE Digital NR-10" className="w-10 h-10 rounded-xl object-contain bg-white border" />
          <div>
            <p className="font-bold leading-tight">PIE Digital NR-10</p>
            <p className="text-xs text-muted-foreground">Prontuário Elétrico compartilhado</p>
          </div>
        </div>
      </header>
      <main className="px-3 sm:px-4 py-4 sm:py-6">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
