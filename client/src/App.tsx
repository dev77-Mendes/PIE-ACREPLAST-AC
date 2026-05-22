// PIE Digital NR-10 — Root app component
// Handles auth state routing between login and main app

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PieProvider } from "@/contexts/PieContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Login from "@/pages/Login";
import AppPage from "@/pages/App";
import ShareView from "@/pages/ShareView";
import { Loader2 } from "lucide-react";

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, oklch(0.72 0.19 47), oklch(0.82 0.17 52))",
              color: "oklch(0.1 0.02 258)",
            }}
          >
            PIE
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <PieProvider>
      <AppPage />
    </PieProvider>
  );
}

export default function App() {
  const isPublicShare = window.location.pathname.startsWith("/share/");

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          {isPublicShare ? (
            <ShareView />
          ) : (
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          )}
          {!isPublicShare && <Toaster richColors position="top-right" />}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
