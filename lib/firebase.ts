"use client";

import type { FirebaseApp } from "firebase/app";
import type { Database } from "firebase/database";

/**
 * Firebase Realtime Database for the dream guestbook + visit counter.
 * Web config is public by design — security comes from database.rules.json
 * (length limits, write-once wishes, server timestamp). Deploy those rules.
 * Everything is lazy-imported so Firebase never touches first paint.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyC3Sle1dclWzhoKnnXYzCS3UidxgKNjmPc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "hackathon-1d30e.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? "https://hackathon-1d30e-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "hackathon-1d30e",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:887688616711:web:a7b45c9c2781c5d86183a2",
};

export interface Wish { id: string; name: string; text: string; tint: number; ts: number }

let dbPromise: Promise<Database> | null = null;
async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getDatabase } = await import("firebase/database");
      const app: FirebaseApp = getApps()[0] ?? initializeApp(config);
      return getDatabase(app);
    })();
  }
  return dbPromise;
}

/** live wish wall. returns an unsubscribe fn. */
export async function subscribeWishes(cb: (w: Wish[]) => void, onError: (e: Error) => void) {
  try {
    const db = await getDb();
    const { ref, query, orderByChild, limitToLast, onValue } = await import("firebase/database");
    const q = query(ref(db, "wishes"), orderByChild("ts"), limitToLast(48));
    return onValue(q, (snap) => {
      const out: Wish[] = [];
      snap.forEach((c) => {
        const v = c.val() as Omit<Wish, "id">;
        if (v && typeof v.text === "string") out.push({ ...v, id: c.key ?? String(out.length) });
      });
      cb(out.reverse());
    }, (e) => onError(e));
  } catch (e) { onError(e as Error); return () => {}; }
}

export async function addWish(w: { name: string; text: string; tint: number }) {
  const db = await getDb();
  const { ref, push, serverTimestamp } = await import("firebase/database");
  await push(ref(db, "wishes"), { name: w.name, text: w.text, tint: w.tint, ts: serverTimestamp() });
}

/** counts one visit per browser session; resolves to the new total (or null if offline) */
export async function bumpVisits(): Promise<number | null> {
  try {
    const db = await getDb();
    const { ref, runTransaction, get } = await import("firebase/database");
    const r = ref(db, "stats/visits");
    let counted = false;
    try { counted = sessionStorage.getItem("pip-counted") === "1"; } catch { /* ignore */ }
    if (counted) { const s = await get(r); return (s.val() as number | null) ?? 0; }
    const res = await runTransaction(r, (n) => ((n as number | null) ?? 0) + 1);
    try { sessionStorage.setItem("pip-counted", "1"); } catch { /* ignore */ }
    return (res.snapshot.val() as number | null) ?? null;
  } catch { return null; }
}
