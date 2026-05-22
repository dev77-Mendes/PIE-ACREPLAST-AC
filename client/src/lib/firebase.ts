// PIE Digital NR-10 — Firebase configuration and service exports
// Replace the firebaseConfig values with your own Firebase project settings.

import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// ─── Firebase project configuration ──────────────────────────────────────────
// Replace with your own project's config from Firebase Console →
// Project Settings → General → Your apps → Web app
// ✅ Credenciais carregadas via variáveis de ambiente (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// ✅ Configuração pronta! Agora aplique as regras de segurança no Firestore Console.

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// ─── Firestore helpers ────────────────────────────────────────────────────────
export const userCol = (uid: string, name: string) =>
  collection(db, "users", uid, name);

export const addRecord = async (
  uid: string,
  colName: string,
  data: Record<string, unknown>
) => {
  const ref = await addDoc(userCol(uid, colName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateRecord = async (
  uid: string,
  colName: string,
  id: string,
  data: Record<string, unknown>
) =>
  updateDoc(doc(db, "users", uid, colName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });

export const deleteRecord = (uid: string, colName: string, id: string) =>
  deleteDoc(doc(db, "users", uid, colName, id));

export const listenCollection = (
  uid: string,
  colName: string,
  cb: (docs: Array<Record<string, unknown> & { id: string }>) => void
) => {
  const q = query(userCol(uid, colName), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })))
  );
};

// ─── Public read-only sharing helpers ─────────────────────────────────────────
export interface PublicShareRecord {
  ownerUid: string;
  clienteId: string;
  active: boolean;
  mode: "readonly";
  data: Record<string, unknown>;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const createShareId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}${Math.random().toString(36).slice(2)}`;
};

export const savePublicShare = async (
  shareId: string,
  payload: Omit<PublicShareRecord, "active" | "mode" | "createdAt" | "updatedAt">
) => {
  await setDoc(doc(db, "publicShares", shareId), {
    ...payload,
    active: true,
    mode: "readonly",
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return shareId;
};

export const getPublicShare = async (shareId: string) => {
  const snap = await getDoc(doc(db, "publicShares", shareId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as PublicShareRecord) };
};
