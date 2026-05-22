// PIE Digital NR-10 — Configurações section
// Instruções de configuração do Firebase e regras de segurança

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ShieldCheck, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cada usuário autenticado acessa apenas seus próprios dados
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // Links públicos de visualização: somente leitura e apenas quando ativos
    match /publicShares/{shareId} {
      allow read: if resource.data.active == true
                  && resource.data.mode == "readonly";

      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.ownerUid
                    && request.resource.data.active == true
                    && request.resource.data.mode == "readonly";

      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.ownerUid;
    }

    // Bloqueia qualquer outro caminho
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

const FIREBASE_CONFIG_EXAMPLE = `// Em client/src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "XXXXXXXXXX",
  appId: "1:XXXXXXXXXX:web:XXXXXXXX"
};`;

export default function Config() {
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado!`));
  };

  const steps = [
    {
      num: "01",
      title: "Criar projeto no Firebase",
      desc: "Acesse console.firebase.google.com, clique em 'Adicionar projeto' e siga o assistente.",
      link: "https://console.firebase.google.com",
      linkLabel: "Abrir Firebase Console",
    },
    {
      num: "02",
      title: "Ativar Authentication",
      desc: "No menu lateral, vá em Authentication → Sign-in method → E-mail/senha → Ativar.",
    },
    {
      num: "03",
      title: "Criar Firestore Database",
      desc: "Vá em Firestore Database → Criar banco de dados → Iniciar no modo de produção → Escolha a região mais próxima.",
    },
    {
      num: "04",
      title: "Copiar o firebaseConfig",
      desc: "Em Configurações do projeto → Geral → Seus apps → App Web → SDK setup and configuration → Copie o objeto firebaseConfig.",
    },
    {
      num: "05",
      title: "Atualizar firebase.ts",
      desc: "Abra o arquivo client/src/lib/firebase.ts e substitua os valores do objeto firebaseConfig pelos dados do seu projeto.",
    },
    {
      num: "06",
      title: "Aplicar regras de segurança",
      desc: "No Firestore → Regras, cole as regras abaixo e publique. Isso garante que cada usuário acesse apenas seus próprios dados.",
    },
    {
      num: "07",
      title: "Publicar a aplicação",
      desc: "Clique no botão Publicar no painel do Manus para disponibilizar a aplicação com sua configuração do Firebase.",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Critical alert */}
      <div className="rounded-2xl border-2 p-5 flex gap-4"
        style={{ borderColor: "oklch(0.72 0.19 47)", background: "oklch(0.98 0.01 47)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}>
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "oklch(0.35 0.12 47)" }}>Configuração necessária antes de usar</p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.08 47)" }}>
            Para salvar e carregar dados, você precisa: (1) configurar seu projeto Firebase, (2) atualizar o arquivo <code className="font-mono bg-orange-100 px-1 rounded">firebase.ts</code> com suas credenciais e (3) aplicar as regras de segurança no Firestore. Siga os passos abaixo.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" style={{ color: "oklch(0.72 0.19 47)" }} />
            Configuração do Firebase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            O PIE Digital NR-10 utiliza o Firebase como backend seguro. Siga os passos abaixo para configurar seu próprio projeto.
          </p>
          <div className="space-y-4">
            {steps.map(({ num, title, desc, link, linkLabel }) => (
              <div key={num} className="flex gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5"
                  style={{ background: "oklch(0.72 0.19 47)", color: "oklch(0.1 0.02 258)" }}
                >
                  {num}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                  {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold mt-1"
                      style={{ color: "oklch(0.55 0.18 255)" }}>
                      <ExternalLink className="w-3 h-3" /> {linkLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Firestore Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              Regras de segurança do Firestore
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => copy(FIRESTORE_RULES, "Regras do Firestore")}
            >
              <Copy className="w-3 h-3" /> Copiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Cole estas regras em <strong>Firestore Database → Regras</strong> e clique em Publicar.
            Elas garantem que cada usuário acesse apenas seus próprios dados.
          </p>
          <pre className="text-xs rounded-xl p-4 overflow-x-auto font-mono leading-relaxed"
            style={{ background: "oklch(0.15 0.055 258)", color: "oklch(0.85 0.02 255)" }}>
            {FIRESTORE_RULES}
          </pre>
        </CardContent>
      </Card>

      {/* Firebase config example */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Exemplo de configuração (firebase.ts)</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => copy(FIREBASE_CONFIG_EXAMPLE, "Exemplo de config")}
            >
              <Copy className="w-3 h-3" /> Copiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-xs rounded-xl p-4 overflow-x-auto font-mono leading-relaxed"
            style={{ background: "oklch(0.15 0.055 258)", color: "oklch(0.85 0.02 255)" }}>
            {FIREBASE_CONFIG_EXAMPLE}
          </pre>
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-5">
          <p className="text-sm font-bold text-blue-800 mb-2">Sobre a segurança dos dados</p>
          <p className="text-sm text-blue-700">
            Cada conta de usuário tem acesso exclusivo aos seus próprios dados no Firestore.
            As regras de segurança garantem isolamento total entre contas diferentes.
            Os dados são armazenados com criptografia em repouso e em trânsito pelo Firebase/Google Cloud.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
