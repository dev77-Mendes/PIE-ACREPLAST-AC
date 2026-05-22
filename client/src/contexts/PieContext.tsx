// PIE Digital NR-10 — Data context
// Real-time Firestore listeners for all PIE collections.

import {
  addRecord,
  deleteRecord,
  listenCollection,
  updateRecord,
} from "@/lib/firebase";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string;
  razao: string;
  cnpj?: string;
  carga?: number;
  responsavel?: string;
  telefone?: string;
  cidade?: string;
  endereco?: string;
  tensao?: string;
  subestacao?: string;
  solar?: string;
  createdAt?: unknown;
}

export interface Documento {
  id: string;
  clienteId: string;
  tipo: string;
  validade?: string;
  status: string;
  link?: string;
  responsavelTecnico?: string;
  obs?: string;
  createdAt?: unknown;
}

export interface ChecklistItem {
  id: string;
  clienteId: string;
  item: string;
  status: string;
  obs?: string;
  createdAt?: unknown;
}

export interface Inspecao {
  id: string;
  clienteId: string;
  local?: string;
  risco: string;
  descricao?: string;
  recomendacao?: string;
  foto?: string;
  norma?: string;
  status: string;
  createdAt?: unknown;
}

export interface Acao {
  id: string;
  clienteId: string;
  acao?: string;
  prioridade: string;
  prazo?: string;
  responsavel?: string;
  status: string;
  norma?: string;
  createdAt?: unknown;
}

export interface Trabalhador {
  id: string;
  clienteId: string;
  nome?: string;
  funcao?: string;
  tipo: string;
  validade?: string;
  status: string;
  link?: string;
  createdAt?: unknown;
}

export interface Epi {
  id: string;
  clienteId: string;
  tipo: string;
  nome?: string;
  ca?: string;
  validade?: string;
  status: string;
  createdAt?: unknown;
}

export interface PieState {
  clientes: Cliente[];
  documentos: Documento[];
  checklist: ChecklistItem[];
  inspecoes: Inspecao[];
  acoes: Acao[];
  trabalhadores: Trabalhador[];
  epis: Epi[];
}

interface PieContextValue extends PieState {
  add: (col: keyof PieState, data: Record<string, unknown>) => Promise<string>;
  update: (col: keyof PieState, id: string, data: Record<string, unknown>) => Promise<void>;
  remove: (col: keyof PieState, id: string) => Promise<void>;
  clienteName: (id: string) => string;
}

const PieContext = createContext<PieContextValue | null>(null);

const COLLECTIONS: Array<keyof PieState> = [
  "clientes",
  "documentos",
  "checklist",
  "inspecoes",
  "acoes",
  "trabalhadores",
  "epis",
];

export function PieProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? "";

  const [state, setState] = useState<PieState>({
    clientes: [],
    documentos: [],
    checklist: [],
    inspecoes: [],
    acoes: [],
    trabalhadores: [],
    epis: [],
  });

  useEffect(() => {
    if (!uid) return;
    const unsubs = COLLECTIONS.map((col) =>
      listenCollection(uid, col, (docs) =>
        setState((prev) => ({ ...prev, [col]: docs }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  const add = (col: keyof PieState, data: Record<string, unknown>) =>
    addRecord(uid, col, data);

  const update = (col: keyof PieState, id: string, data: Record<string, unknown>) =>
    updateRecord(uid, col, id, data);

  const remove = (col: keyof PieState, id: string) =>
    deleteRecord(uid, col, id);

  const clienteName = (id: string) =>
    state.clientes.find((c) => c.id === id)?.razao ?? "—";

  return (
    <PieContext.Provider value={{ ...state, add, update, remove, clienteName }}>
      {children}
    </PieContext.Provider>
  );
}

export const usePie = () => {
  const ctx = useContext(PieContext);
  if (!ctx) throw new Error("usePie must be used inside PieProvider");
  return ctx;
};
