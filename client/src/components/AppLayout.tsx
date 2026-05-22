// PIE Digital NR-10 — App layout with persistent sidebar
// Design: Sidebar azul marinho + área de conteúdo clara

import { useState } from "react";
import { logout } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Building2,
  FolderOpen,
  CheckSquare,
  Camera,
  Wrench,
  HardHat,
  Shield,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Section =
  | "dashboard"
  | "clientes"
  | "documentos"
  | "checklist"
  | "inspecoes"
  | "acoes"
  | "trabalhadores"
  | "epis"
  | "relatorios"
  | "config";

const NAV_ITEMS: Array<{ id: Section; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: Building2 },
  { id: "documentos", label: "Documentos", icon: FolderOpen },
  { id: "checklist", label: "Checklist NR-10", icon: CheckSquare },
  { id: "inspecoes", label: "Inspeções", icon: Camera },
  { id: "acoes", label: "Plano de Ação", icon: Wrench },
  { id: "trabalhadores", label: "Trabalhadores", icon: HardHat },
  { id: "epis", label: "EPIs / EPCs", icon: Shield },
  { id: "relatorios", label: "Relatórios PDF", icon: FileText },
  { id: "config", label: "Configurações", icon: Settings },
];

interface AppLayoutProps {
  activeSection: Section;
  onNavigate: (s: Section) => void;
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
}

export default function AppLayout({
  activeSection,
  onNavigate,
  children,
  pageTitle,
  pageSubtitle,
}: AppLayoutProps) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Sessão encerrada.");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b" style={{ borderColor: "oklch(0.3 0.07 258)" }}>
        <div className="flex items-center gap-3">
          <img
            src="/pie-logo.png"
            alt="PIE Digital NR-10"
            className="w-10 h-10 rounded-xl object-contain bg-white shadow-lg flex-shrink-0"
          />
          <div>
            <p className="text-white font-bold text-sm leading-tight">PIE Digital NR-10</p>
            <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>Prontuário Elétrico</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onNavigate(id); setMobileOpen(false); }}
            className={cn(
              "nav-item w-full",
              activeSection === id && "active"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "oklch(0.3 0.07 258)" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2"
          style={{ background: "oklch(0.28 0.07 258)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}>
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
            <p className="text-xs" style={{ color: "oklch(0.6 0.03 255)" }}>Usuário ativo</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>

      {/* Footer note */}
      <div className="px-4 pb-4">
        <div className="rounded-xl p-3 text-xs" style={{ background: "oklch(0.28 0.07 258)", color: "oklch(0.6 0.03 255)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3" style={{ color: "oklch(0.72 0.19 47)" }} />
            <span className="font-semibold" style={{ color: "oklch(0.78 0.02 255)" }}>Base normativa</span>
          </div>
          NR-10 • NBR 5410 • NBR 5419 • SPDA • RTI
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[260px] flex-shrink-0 h-full overflow-hidden"
        style={{ background: "linear-gradient(180deg, oklch(0.18 0.055 258) 0%, oklch(0.22 0.06 255) 100%)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 h-full w-[260px] flex flex-col overflow-hidden z-10"
            style={{ background: "linear-gradient(180deg, oklch(0.18 0.055 258) 0%, oklch(0.22 0.06 255) 100%)" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex-shrink-0 bg-card border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-start sm:items-center justify-between gap-3 no-print">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="font-bold text-base sm:text-lg text-foreground leading-tight truncate">{pageTitle}</h2>
              {pageSubtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-1">{pageSubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{ background: "oklch(0.95 0.01 255)", color: "oklch(0.28 0.09 258)", borderColor: "oklch(0.88 0.02 255)" }}
            >
              {user?.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
