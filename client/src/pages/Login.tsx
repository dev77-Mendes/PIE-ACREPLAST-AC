// PIE Digital NR-10 — Login page
// Design: Azul marinho profundo + laranja elétrico, layout split-screen

import { useState } from "react";
import { loginWithEmail, registerWithEmail, resetPassword } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Zap, ShieldCheck, FileText, BarChart3 } from "lucide-react";

type Mode = "login" | "register" | "reset";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("Bem-vindo ao PIE Digital NR-10!");
      } else if (mode === "register") {
        if (password !== confirm) {
          toast.error("As senhas não coincidem.");
          return;
        }
        if (password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres.");
          return;
        }
        await registerWithEmail(email, password);
        toast.success("Conta criada com sucesso!");
      } else {
        await resetPassword(email);
        toast.success("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
        setMode("login");
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Erro desconhecido.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        toast.error("E-mail ou senha incorretos.");
      } else if (msg.includes("email-already-in-use")) {
        toast.error("Este e-mail já está cadastrado.");
      } else if (msg.includes("invalid-email")) {
        toast.error("E-mail inválido.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FileText, label: "Gestão completa do PIE conforme NR-10" },
    { icon: ShieldCheck, label: "Controle de documentos, EPIs e autorizações" },
    { icon: BarChart3, label: "Dashboard de conformidade em tempo real" },
    { icon: Zap, label: "Geração automática de relatórios em PDF" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, oklch(0.15 0.055 258) 0%, oklch(0.22 0.06 255) 60%, oklch(0.28 0.07 258) 100%)" }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, oklch(0.72 0.19 47), transparent)" }} />
          <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-8"
            style={{ background: "radial-gradient(circle, oklch(0.55 0.18 255), transparent)" }} />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.19 47), oklch(0.82 0.17 52))", color: "oklch(0.1 0.02 258)" }}>
              PIE
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold leading-tight">PIE Digital NR-10</h1>
              <p className="text-sm" style={{ color: "oklch(0.72 0.03 255)" }}>Prontuário das Instalações Elétricas</p>
            </div>
          </div>
        </div>

        {/* Main headline */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-bold leading-tight mb-6">
            Gestão profissional do prontuário elétrico conforme{" "}
            <span style={{ color: "oklch(0.82 0.17 52)" }}>NR-10</span>
          </h2>
          <p className="text-base mb-10" style={{ color: "oklch(0.72 0.03 255)" }}>
            Organize documentos, controle inspeções, gerencie trabalhadores autorizados e gere relatórios técnicos completos — tudo em um único sistema seguro e em conformidade com a legislação.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.28 0.07 258)" }}>
                  <Icon className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
                </div>
                <span className="text-sm font-medium" style={{ color: "oklch(0.85 0.02 255)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "oklch(0.55 0.03 255)" }}>
            Base técnica: NR-10 • NBR 5410 • NBR 5419 • SPDA/Aterramento • RTI
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.03 255)" }}>
            Desenvolvido por Joelson M. Mendes — SENAI HUB Inovação e Tecnologia
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.19 47), oklch(0.82 0.17 52))", color: "oklch(0.1 0.02 258)" }}>
              PIE
            </div>
            <div>
              <h1 className="text-foreground text-xl font-bold leading-tight">PIE Digital NR-10</h1>
              <p className="text-xs text-muted-foreground">Prontuário das Instalações Elétricas</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "Acessar sistema" : mode === "register" ? "Criar conta" : "Recuperar senha"}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {mode === "login"
                ? "Entre com suas credenciais para continuar."
                : mode === "register"
                ? "Crie sua conta para começar a usar o PIE Digital."
                : "Informe seu e-mail para receber o link de recuperação."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com"
                required
                className="h-11"
              />
            </div>

            {mode !== "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  minLength={6}
                  required
                  className="h-11"
                />
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Confirmar senha
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="repita a senha"
                  required
                  className="h-11"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-bold text-sm"
              style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Aguarde...</>
              ) : mode === "login" ? "Entrar no sistema" : mode === "register" ? "Criar conta" : "Enviar link de recuperação"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-muted-foreground hover:text-foreground transition-colors block w-full"
                >
                  Esqueci minha senha
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-semibold hover:underline block w-full"
                  style={{ color: "oklch(0.72 0.19 47)" }}
                >
                  Criar nova conta
                </button>
              </>
            )}
            {(mode === "register" || mode === "reset") && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar ao login
              </button>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Seus dados são armazenados com segurança no Firebase e acessíveis apenas pela sua conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
