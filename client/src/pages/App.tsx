// PIE Digital NR-10 — Main app page
// Integrates all sections with layout and navigation

import { useState } from "react";
import AppLayout, { type Section } from "@/components/AppLayout";
import Dashboard from "./sections/Dashboard";
import Clientes from "./sections/Clientes";
import Documentos from "./sections/Documentos";
import Checklist from "./sections/Checklist";
import Inspecoes from "./sections/Inspecoes";
import Acoes from "./sections/Acoes";
import Trabalhadores from "./sections/Trabalhadores";
import Epis from "./sections/Epis";
import Relatorios from "./sections/Relatorios";
import Config from "./sections/Config";

const SECTION_META: Record<Section, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Visão geral do prontuário — conformidade, riscos e pendências",
  },
  clientes: {
    title: "Clientes",
    subtitle: "Cadastro e gestão de empresas atendidas",
  },
  documentos: {
    title: "Documentos do PIE",
    subtitle: "Gestão de documentos técnicos e legais do prontuário",
  },
  checklist: {
    title: "Checklist NR-10",
    subtitle: "Verificação de conformidade com os requisitos da NR-10",
  },
  inspecoes: {
    title: "Inspeções de campo",
    subtitle: "Registro de não conformidades e evidências técnicas",
  },
  acoes: {
    title: "Plano de ação",
    subtitle: "Cronograma de adequação e acompanhamento de ações corretivas",
  },
  trabalhadores: {
    title: "Trabalhadores autorizados",
    subtitle: "Controle de habilitações e treinamentos NR-10",
  },
  epis: {
    title: "EPIs, EPCs e ferramentas",
    subtitle: "Inventário e controle de validade de equipamentos de proteção",
  },
  relatorios: {
    title: "Relatórios PDF",
    subtitle: "Geração do prontuário completo em formato PDF",
  },
  config: {
    title: "Configurações",
    subtitle: "Configuração do Firebase e regras de segurança",
  },
};

export default function AppPage() {
  const [section, setSection] = useState<Section>("dashboard");
  const meta = SECTION_META[section];

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard />;
      case "clientes": return <Clientes />;
      case "documentos": return <Documentos />;
      case "checklist": return <Checklist />;
      case "inspecoes": return <Inspecoes />;
      case "acoes": return <Acoes />;
      case "trabalhadores": return <Trabalhadores />;
      case "epis": return <Epis />;
      case "relatorios": return <Relatorios />;
      case "config": return <Config />;
    }
  };

  return (
    <AppLayout
      activeSection={section}
      onNavigate={setSection}
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
    >
      {renderSection()}
    </AppLayout>
  );
}
