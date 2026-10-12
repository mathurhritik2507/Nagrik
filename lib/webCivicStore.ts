/**
 * Browser-side prototype storage. Isolated by Firebase user UID.
 * IMPORTANT: no cross-device sync, authority submission or server verification.
 */
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { CrateClaim, WEEKLY_GOAL, weekKeyFor, currentWeekProgress, chooseVirtualBadge } from "./weeklyRewards";

export type CivicAction = { id: string; createdAt: string; category: string; description: string; image?: string };
export type CivicReport = { id: string; createdAt: string; category: string; location: string; description: string; image?: string; status: "Saved locally" };
export type CivicProof = { id: string; createdAt: string; challengeId: string; description: string; image: string; status: "Unverified" };
export type CivicProfile = { city: string; bio: string };
export type CivicData = { actions: CivicAction[]; reports: CivicReport[]; proofs: CivicProof[]; profile: CivicProfile; crateClaims: CrateClaim[] };
const EVENT = "nagrik-civic-updated";
const defaults = (): CivicData => ({ actions: [], reports: [], proofs: [], profile: { city: "Pune", bio: "" }, crateClaims: [] });
const storageKey = (uid: string) => "nagrik:civic:v2:" + uid;

export function readCivic(uid: string): CivicData {
  if (typeof window === "undefined" || !uid) return defaults();
  try {
    const raw = window.localStorage.getItem(storageKey(uid));
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    return {
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      proofs: Array.isArray(parsed.proofs) ? parsed.proofs : [],
      crateClaims: Array.isArray(parsed.crateClaims) ? parsed.crateClaims : [],
      profile: { city: String(parsed.profile?.city || "Pune"), bio: String(parsed.profile?.bio || "") },
    };
  } catch {
    return defaults();
  }
}

function updateCivic(uid: string, change: (state: CivicData) => CivicData) {
  if (!uid || typeof window === "undefined") throw new Error("Sign in to save your activity.");
  const previous = readCivic(uid);
  const next = change(previous);
  try {
    window.localStorage.setItem(storageKey(uid), JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    throw new Error("This browser could not save your changes. Check storage settings or reduce image size.");
  }
}
const makeId = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
export function useCivicData() {
  const uid = auth.currentUser?.uid || "";
  const [data, setData] = useState<CivicData>(() => readCivic(uid));
  useEffect(() => {
    const refresh = () => setData(readCivic(uid));
    refresh();
    if (typeof window === "undefined") return;
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [uid]);
  const addAction = (item: Pick<CivicAction, "category" | "description" | "image">) => {
    if (!item.description.trim()) throw new Error("Describe your civic action before submitting.");
    updateCivic(uid, state => ({
      ...state, actions: [{ ...item, description: item.description.trim(), id: makeId(), createdAt: new Date().toISOString() }, ...state.actions].slice(0, 35),
    }));
  };
  const addReport = (item: Pick<CivicReport, "category" | "location" | "description" | "image">) => {
    if (item.location.trim().length < 3 || item.description.trim().length < 12) {
      throw new Error("Add a location and a clear description of at least 12 characters.");
    }
    updateCivic(uid, state => ({
      ...state, reports: [{ ...item, id: makeId(), createdAt: new Date().toISOString(), status: "Saved locally" as const }, ...state.reports].slice(0, 35),
    }));
  };
  const addProof = (item: Pick<CivicProof, "challengeId" | "description" | "image">) => {
    if (!item.image || item.description.trim().length < 12) throw new Error("Add a photo and describe your action in at least 12 characters.");
    updateCivic(uid, state => {
      if(currentWeekProgress(state.proofs).has(item.challengeId)){
        throw new Error("You already submitted proof for that mission this week. Try a different mission.");
      }
      return {
        ...state, proofs: [{ ...item, id: makeId(), createdAt: new Date().toISOString(), status: "Unverified" as const }, ...state.proofs].slice(0, 60),
      };
    });
  };
  const openWeeklyCrate = () => {
    if(!uid) throw new Error("Please sign in first.");
    let prize: ReturnType<typeof chooseVirtualBadge> | null = null;
    updateCivic(uid, state => {
      const weekKey=weekKeyFor(new Date());
      if(state.crateClaims.some(c=>c.weekKey===weekKey))throw new Error("You already opened your crate this week.");
      const unique=currentWeekProgress(state.proofs);
      if(unique.size<WEEKLY_GOAL)throw new Error(`Complete ${WEEKLY_GOAL} different challenges this week to unlock your crate.`);
      prize=chooseVirtualBadge(uid,weekKey);
      return {...state,crateClaims:[{weekKey,rewardId:prize.id,openedAt:new Date().toISOString(),kind:"virtual-badge"},...state.crateClaims]};
    });
    return prize!;
  };
  const saveProfile = (profile: CivicProfile) => {
    if (!profile.city.trim()) throw new Error("Enter your city.");
    updateCivic(uid, state => ({ ...state, profile: { city: profile.city.trim().slice(0, 80), bio: profile.bio.trim().slice(0, 280) } }));
  };
  const clearLocalRecords = () => {
    if (!uid || typeof window === "undefined") throw new Error("Sign in to manage your records.");
    window.localStorage.removeItem(storageKey(uid));
    window.dispatchEvent(new Event(EVENT));
  };
  const downloadRecords = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download="nagrik-my-records.json"; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };
  const points = data.actions.length * 50 + data.reports.length * 20;
  return { data, addAction, addReport, addProof, saveProfile, clearLocalRecords, downloadRecords, openWeeklyCrate, points };
}
