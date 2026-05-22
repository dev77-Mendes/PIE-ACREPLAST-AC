import type {
  Acao,
  ChecklistItem,
  Cliente,
  Documento,
  Epi,
  Inspecao,
  Trabalhador,
} from "@/contexts/PieContext";

export interface ProntuarioReportData {
  cliente: Cliente;
  documentos: Documento[];
  checklist: ChecklistItem[];
  inspecoes: Inspecao[];
  acoes: Acao[];
  trabalhadores: Trabalhador[];
  epis: Epi[];
  rt?: string;
  art?: string;
  emittedAt?: string;
}

interface ProntuarioReportProps extends ProntuarioReportData {
  compact?: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return new Date().toLocaleDateString("pt-BR");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("pt-BR");
};

export default function ProntuarioReport({
  cliente,
  documentos,
  checklist,
  inspecoes,
  acoes,
  trabalhadores,
  epis,
  rt = "",
  art = "",
  emittedAt,
  compact = false,
}: ProntuarioReportProps) {
  const today = formatDate(emittedAt);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: compact ? "12px" : "11px",
        color: "#111",
        background: "#fff",
        padding: "0",
        lineHeight: 1.5,
        maxWidth: compact ? "100%" : undefined,
      }}
    >
      <div style={{ borderBottom: "4px solid #ff7a00", paddingBottom: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <img
            src="/pie-logo.png"
            alt="PIE Digital NR-10"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              objectFit: "contain",
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: compact ? "20px" : "18px", color: "#061a3a", fontWeight: "900" }}>
              Prontuário das Instalações Elétricas — PIE
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>
              Base técnica: NR-10 • NBR 5410 • NBR 5419 quando aplicável
            </p>
          </div>
        </div>
        <ResponsiveTable>
          <tbody>
            <tr>
              <InfoCell label="Cliente" value={cliente.razao} />
              <InfoCell label="CNPJ" value={cliente.cnpj || "—"} />
            </tr>
            <tr>
              <td style={labelStyle}>Endereço:</td>
              <td colSpan={3} style={cellStyle}>{cliente.endereco || "—"} — {cliente.cidade || "—"}</td>
            </tr>
            <tr>
              <InfoCell label="Resp. técnico" value={rt || "—"} />
              <InfoCell label="ART/TRT" value={art || "—"} />
            </tr>
            <tr>
              <InfoCell label="Data de emissão" value={today} />
              <InfoCell label="Carga instalada" value={`${cliente.carga || 0} kW`} />
            </tr>
          </tbody>
        </ResponsiveTable>
      </div>

      <ReportSection title="1. Caracterização da instalação">
        <ResponsiveTable>
          <tbody>
            {[
              ["Tensão de entrada", cliente.tensao || "—"],
              ["Possui subestação", cliente.subestacao || "—"],
              ["Sistema solar fotovoltaico", cliente.solar || "—"],
              ["Responsável legal", cliente.responsavel || "—"],
              ["Telefone", cliente.telefone || "—"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ ...labelStyle, width: "200px" }}>{k}:</td>
                <td style={cellStyle}>{v}</td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      </ReportSection>

      <ReportSection title="2. Documentos do prontuário">
        <ReportTable
          headers={["Documento", "Status", "Validade", "Responsável técnico"]}
          rows={documentos.map((d) => [d.tipo, d.status, d.validade || "—", d.responsavelTecnico || "—"])}
          empty="Nenhum documento registrado."
        />
      </ReportSection>

      <ReportSection title="3. Checklist NR-10">
        <ReportTable
          headers={["Item verificado", "Conformidade", "Observação/Evidência"]}
          rows={checklist.map((i) => [i.item, i.status, i.obs || "—"])}
          empty="Nenhum item de checklist registrado."
        />
      </ReportSection>

      <ReportSection title="4. Relatório de inspeção técnica de campo">
        <ReportTable
          headers={["Local", "Risco", "Não conformidade", "Recomendação", "Norma", "Status"]}
          rows={inspecoes.map((i) => [i.local || "—", i.risco, i.descricao || "—", i.recomendacao || "—", i.norma || "—", i.status])}
          empty="Nenhuma inspeção registrada."
        />
      </ReportSection>

      <ReportSection title="5. Plano de ação e cronograma de adequação">
        <ReportTable
          headers={["Ação recomendada", "Prioridade", "Prazo", "Responsável", "Status"]}
          rows={acoes.map((a) => [a.acao || "—", a.prioridade, a.prazo || "—", a.responsavel || "—", a.status])}
          empty="Nenhuma ação registrada."
        />
      </ReportSection>

      <ReportSection title="6. Trabalhadores autorizados (NR-10)">
        <ReportTable
          headers={["Nome", "Função", "Tipo de autorização", "Validade", "Status"]}
          rows={trabalhadores.map((t) => [t.nome || "—", t.funcao || "—", t.tipo, t.validade || "—", t.status])}
          empty="Nenhum trabalhador registrado."
        />
      </ReportSection>

      <ReportSection title="7. EPIs, EPCs e ferramentas">
        <ReportTable
          headers={["Tipo", "Nome", "CA/Certificado", "Validade/Teste", "Condição"]}
          rows={epis.map((e) => [e.tipo, e.nome || "—", e.ca || "—", e.validade || "—", e.status])}
          empty="Nenhum item registrado."
        />
      </ReportSection>

      <ReportSection title="8. Observação técnica e declaração">
        <p style={{ margin: 0, textAlign: "justify" }}>
          Este Prontuário das Instalações Elétricas foi elaborado com base nas informações fornecidas e nos registros técnicos
          disponíveis, em conformidade com os requisitos da NR-10, NBR 5410 e NBR 5419, quando aplicável. A validação final deve
          ser realizada por profissional legalmente habilitado, com emissão de ART ou TRT junto ao CREA/CFT competente.
        </p>
        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
          <Signature title={rt || "Responsável técnico"} subtitle={`CREA/CFT: ${art || "—"}`} />
          <Signature title={cliente.responsavel || "Responsável legal"} subtitle={cliente.razao} />
        </div>
      </ReportSection>

      <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "20px", paddingTop: "10px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", fontSize: "10px", color: "#9ca3af" }}>
        <span>PIE Digital NR-10 — Desenvolvido por Joelson M. Mendes — SENAI HUB Inovação e Tecnologia</span>
        <span>Emitido em {today}</span>
      </div>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{
        margin: "0 0 8px",
        fontSize: "13px",
        fontWeight: "900",
        color: "#061a3a",
        borderLeft: "4px solid #ff7a00",
        paddingLeft: "8px",
        lineHeight: 1.3,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ReportTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (rows.length === 0) {
    return <p style={{ margin: 0, color: "#9ca3af", fontStyle: "italic" }}>{empty}</p>;
  }
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse", fontSize: "10px" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            {headers.map((h) => (
              <th key={h} style={{
                border: "1px solid #e2e8f0",
                padding: "5px 6px",
                textAlign: "left",
                fontWeight: "700",
                color: "#374151",
                fontSize: "10px",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  border: "1px solid #e2e8f0",
                  padding: "5px 6px",
                  color: "#1f2937",
                  verticalAlign: "top",
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResponsiveTable({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse", fontSize: "11px" }}>{children}</table>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <>
      <td style={labelStyle}>{label}:</td>
      <td style={cellStyle}>{value}</td>
    </>
  );
}

function Signature({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: "center", flex: "1 1 240px" }}>
      <div style={{ borderTop: "1px solid #374151", paddingTop: "6px", marginTop: "32px" }}>
        <p style={{ margin: 0, fontWeight: "bold" }}>{title}</p>
        <p style={{ margin: "2px 0 0", color: "#6b7280" }}>{subtitle}</p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  padding: "3px 8px 3px 0",
  fontWeight: "bold",
  color: "#374151",
  width: "160px",
  verticalAlign: "top",
};

const cellStyle: React.CSSProperties = {
  padding: "3px 0",
  verticalAlign: "top",
};
