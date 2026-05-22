# PIE Digital NR-10 — Guia de Configuração do Firebase

## Visão geral

O **PIE Digital NR-10** utiliza o Firebase como backend seguro e escalável. Cada usuário tem acesso exclusivo aos seus próprios dados, garantindo isolamento total entre contas.

---

## Passo a passo de configuração

### 1. Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto**
3. Dê um nome ao projeto (ex: `pie-digital-nr10`)
4. Desative o Google Analytics (opcional) e clique em **Criar projeto**

---

### 2. Ativar Authentication (E-mail/senha)

1. No menu lateral, clique em **Authentication**
2. Clique em **Começar**
3. Na aba **Sign-in method**, clique em **E-mail/senha**
4. Ative a opção e clique em **Salvar**

---

### 3. Criar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Selecione **Iniciar no modo de produção**
4. Escolha a região mais próxima (ex: `southamerica-east1` para Brasil)
5. Clique em **Ativar**

---

### 4. Aplicar as regras de segurança

1. No Firestore Database, clique na aba **Regras**
2. Substitua todo o conteúdo pelas regras do arquivo `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clique em **Publicar**

---

### 5. Registrar o app Web e obter credenciais

1. Em **Configurações do projeto** (ícone de engrenagem) → **Geral**
2. Role até **Seus apps** → Clique no ícone **Web** (`</>`)
3. Dê um apelido ao app (ex: `pie-digital-web`) e clique em **Registrar app**
4. Copie o objeto `firebaseConfig` exibido

---

### 6. Atualizar o arquivo firebase.ts

Abra o arquivo `client/src/lib/firebase.ts` e substitua o objeto `firebaseConfig` com suas credenciais:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "XXXXXXXXXX",
  appId: "1:XXXXXXXXXX:web:XXXXXXXX"
};
```

---

### 7. Publicar a aplicação

Após configurar o Firebase, clique no botão **Publicar** no painel do Manus para disponibilizar a aplicação com sua configuração.

---

## Estrutura de dados no Firestore

```
/users/{userId}/
  clientes/          → Empresas atendidas
  documentos/        → Documentos do prontuário
  checklist/         → Itens de verificação NR-10
  inspecoes/         → Inspeções de campo
  acoes/             → Plano de ação
  trabalhadores/     → Trabalhadores autorizados
  epis/              → EPIs, EPCs e ferramentas
```

---

## Segurança

- Cada usuário acessa **apenas seus próprios dados**
- As regras do Firestore garantem isolamento total entre contas
- Os dados são criptografados em repouso e em trânsito pelo Firebase/Google Cloud
- A autenticação usa e-mail e senha com tokens JWT seguros

---

## Suporte

Desenvolvido por **Joelson M. Mendes** — SENAI HUB Inovação e Tecnologia
